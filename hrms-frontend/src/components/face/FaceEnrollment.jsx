// src/components/face/FaceEnrollment.jsx
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiCamera, FiCheck, FiRefreshCw,
  FiUserCheck, FiAlertCircle
} from 'react-icons/fi';
import {
  loadFaceApiModels, detectFaceDescriptor,
  captureImageFromVideo, drawFaceBox
} from '../../utils/faceApiUtils';
import faceRecognitionService from '../../services/faceRecognitionService';
import Loader from '../common/Loader';

const FaceEnrollment = ({ employeeId, onSuccess, existingEnrollment }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [capturedData, setCapturedData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeSystem();
    return () => stopCamera();
  }, []);

  const initializeSystem = async () => {
    try {
      const loaded = await loadFaceApiModels();
      if (!loaded) {
        setError('Failed to load face recognition models');
        return;
      }
      setModelsReady(true);
      await startCamera();
    } catch (err) {
      setError('Failed to initialize: ' + err.message);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user',
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          startFaceDetection();
        };
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startFaceDetection = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || capturing || enrolling) return;

      setDetecting(true);
      const detection = await detectFaceDescriptor(videoRef.current);

      if (canvasRef.current && detection) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        drawFaceBox(canvasRef.current, detection);
      }
      setDetecting(false);
    }, 500);

    return () => clearInterval(interval);
  };

  const handleCapture = async () => {
    setCapturing(true);
    try {
      // Detect face
      const detection = await detectFaceDescriptor(videoRef.current);

      if (!detection) {
        toast.error('No face detected. Please face the camera clearly.');
        setCapturing(false);
        return;
      }

      if (detection.quality < 0.5) {
        toast.warning('Face quality is low. Please improve lighting.');
      }

      // Capture image
      const photoBase64 = captureImageFromVideo(videoRef.current);

      setCapturedData({
        descriptor: detection.descriptor,
        quality: detection.quality,
        photo: photoBase64,
      });

      toast.success('Face captured! Click Enroll to save.');
    } catch (err) {
      toast.error('Capture failed: ' + err.message);
    } finally {
      setCapturing(false);
    }
  };

  const handleEnroll = async () => {
    if (!capturedData) return;

    setEnrolling(true);
    try {
      const payload = {
        employeeId,
        faceDescriptor: JSON.stringify(capturedData.descriptor),
        photoBase64: capturedData.photo,
        qualityScore: capturedData.quality,
      };

      if (existingEnrollment) {
        await faceRecognitionService.updateEnrollment(employeeId, payload);
        toast.success('Face enrollment updated successfully!');
      } else {
        await faceRecognitionService.enroll(payload);
        toast.success('Face enrolled successfully!');
      }

      stopCamera();
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleRetake = () => {
    setCapturedData(null);
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
        <p className="text-gray-500 mt-3">Loading face recognition models...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera Preview */}
      <div className="relative bg-black rounded-2xl overflow-hidden
                      aspect-video mx-auto max-w-md">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Status overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {cameraReady && (
            <span className="bg-green-500 text-white text-xs px-2 py-1
                             rounded-full flex items-center gap-1">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
              Live
            </span>
          )}
          {detecting && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1
                             rounded-full">
              Detecting...
            </span>
          )}
        </div>

        {/* Guide overlay */}
        {cameraReady && !capturedData && (
          <div className="absolute inset-0 flex items-center justify-center
                          pointer-events-none">
            <div className="border-4 border-dashed border-white/50
                            rounded-full w-64 h-64" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <FiUserCheck className="h-5 w-5 text-blue-600 flex-shrink-0
                                   mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Look directly at the camera</li>
              <li>Ensure good lighting on your face</li>
              <li>Remove sunglasses or hat</li>
              <li>Keep a neutral expression</li>
              <li>Position face within the circle</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Captured Data Info */}
      {capturedData && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FiCheck className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">
                Face Captured Successfully
              </p>
              <p className="text-xs text-green-600 mt-1">
                Quality Score: {(capturedData.quality * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!capturedData ? (
          <button
            onClick={handleCapture}
            disabled={!cameraReady || capturing}
            className="btn-primary flex-1 justify-center py-3"
          >
            <FiCamera className="h-5 w-5" />
            {capturing ? 'Capturing...' : 'Capture Face'}
          </button>
        ) : (
          <>
            <button
              onClick={handleRetake}
              disabled={enrolling}
              className="btn-secondary flex-1 justify-center py-3"
            >
              <FiRefreshCw /> Retake
            </button>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn-success flex-1 justify-center py-3"
            >
              <FiCheck />
              {enrolling ? 'Enrolling...' :
                existingEnrollment ? 'Update Enrollment' : 'Enroll Face'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FaceEnrollment;