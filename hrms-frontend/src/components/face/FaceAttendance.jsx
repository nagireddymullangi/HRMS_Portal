// src/components/face/FaceAttendance.jsx
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiCamera, FiMapPin, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle
} from 'react-icons/fi';
import {
  loadFaceApiModels, detectFaceDescriptor,
  captureImageFromVideo, drawFaceBox, getCurrentLocation
} from '../../utils/faceApiUtils';
import faceRecognitionService from '../../services/faceRecognitionService';
import Loader from '../common/Loader';

const FaceAttendance = ({ onSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [location, setLocation] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    initializeSystem();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      stopCamera();
      clearInterval(timer);
    };
  }, []);

  const initializeSystem = async () => {
    try {
      const loaded = await loadFaceApiModels();
      if (!loaded) throw new Error('Model loading failed');
      setModelsReady(true);

      await startCamera();
      await fetchLocation();
    } catch (err) {
      setError(err.message);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          startAutoDetection();
        };
      }
    } catch (err) {
      setError('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const fetchLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err) {
      console.warn('Location not available:', err);
    }
  };

  const startAutoDetection = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || processing) return;

      const detection = await detectFaceDescriptor(videoRef.current);
      if (canvasRef.current && detection) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        drawFaceBox(canvasRef.current, detection);
      }
    }, 500);

    return () => clearInterval(interval);
  };

  const handleMarkAttendance = async () => {
    setProcessing(true);
    setResult(null);

    try {
      // Detect face
      const detection = await detectFaceDescriptor(videoRef.current);

      if (!detection) {
        toast.error('No face detected. Please face the camera.');
        setProcessing(false);
        return;
      }

      // Capture photo
      const photoBase64 = captureImageFromVideo(videoRef.current);

      // Send for verification & attendance marking
      const res = await faceRecognitionService.markAttendance({
        faceDescriptor: JSON.stringify(detection.descriptor),
        photoBase64,
        confidenceScore: detection.quality,
        latitude: location?.latitude,
        longitude: location?.longitude,
        location: location ? `${location.latitude}, ${location.longitude}` : null,
      });

      setResult({
        success: true,
        data: res.data.data,
        message: 'Attendance marked successfully!',
      });

      toast.success('✅ Attendance marked!');
      setTimeout(() => onSuccess?.(res.data.data), 2000);
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';
      setResult({ success: false, message });
      toast.error('❌ ' + message);
    } finally {
      setProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!modelsReady) {
    return (
      <div className="text-center p-8">
        <Loader fullScreen={false} />
        <p className="text-gray-500 mt-3">Initializing face recognition...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Time & Location Display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600
                        rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <FiClock className="h-4 w-4" />
            <p className="text-xs opacity-90">Current Time</p>
          </div>
          <p className="text-2xl font-bold">
            {currentTime.toLocaleTimeString()}
          </p>
          <p className="text-xs opacity-90">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            })}
          </p>
        </div>
        <div className={`bg-gradient-to-br ${location
          ? 'from-green-500 to-green-600'
          : 'from-yellow-500 to-yellow-600'} rounded-2xl p-4 text-white`}>
          <div className="flex items-center gap-2 mb-1">
            <FiMapPin className="h-4 w-4" />
            <p className="text-xs opacity-90">Location</p>
          </div>
          <p className="text-sm font-bold">
            {location ? '📍 Captured' : '⚠️ Unavailable'}
          </p>
          {location && (
            <p className="text-xs opacity-90 mt-1 truncate">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* Camera Preview */}
      <div className="relative bg-black rounded-2xl overflow-hidden
                      aspect-video mx-auto max-w-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {cameraReady && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs px-2 py-1
                             rounded-full flex items-center gap-1">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
              REC
            </span>
          </div>
        )}

        {/* Face guide */}
        {cameraReady && !processing && !result && (
          <div className="absolute inset-0 flex items-center justify-center
                          pointer-events-none">
            <div className="border-4 border-dashed border-white/40
                            rounded-full w-64 h-64" />
          </div>
        )}

        {/* Processing overlay */}
        {processing && (
          <div className="absolute inset-0 bg-black/60 flex items-center
                          justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-4
                              border-white border-t-transparent mx-auto" />
              <p className="mt-3">Verifying...</p>
            </div>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className={`rounded-2xl p-6 text-center ${result.success
          ? 'bg-green-50 border-2 border-green-200'
          : 'bg-red-50 border-2 border-red-200'}`}>
          {result.success ? (
            <>
              <FiCheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h3 className="text-xl font-bold text-green-800 mt-3">
                Welcome, {result.data.employeeName}!
              </h3>
              <p className="text-sm text-green-600 mt-1">
                Attendance marked at
                {' '}{new Date().toLocaleTimeString()}
              </p>
            </>
          ) : (
            <>
              <FiXCircle className="h-16 w-16 text-red-600 mx-auto" />
              <h3 className="text-xl font-bold text-red-800 mt-3">
                Verification Failed
              </h3>
              <p className="text-sm text-red-600 mt-1">{result.message}</p>
            </>
          )}
        </div>
      )}

      {/* Action Button */}
      {!result && (
        <button
          onClick={handleMarkAttendance}
          disabled={!cameraReady || processing}
          className="btn-primary w-full justify-center py-4 text-lg
                     shadow-lg"
        >
          <FiCamera className="h-6 w-6" />
          {processing ? 'Verifying...' : 'Mark Attendance'}
        </button>
      )}

      {result && !result.success && (
        <button
          onClick={() => setResult(null)}
          className="btn-secondary w-full justify-center"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default FaceAttendance;