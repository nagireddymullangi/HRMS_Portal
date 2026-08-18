// src/utils/faceApiUtils.js
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load all required face-api models
 */
export const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;

  try {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('✅ Face API models loaded');
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    return false;
  }
};

/**
 * Detect face and extract descriptor
 */
export const detectFaceDescriptor = async (videoElement) => {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement,
        new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return null;

    return {
      descriptor: Array.from(detection.descriptor),
      quality: detection.detection.score,
      box: detection.detection.box,
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
};

/**
 * Capture image from video element as base64
 */
export const captureImageFromVideo = (videoElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
};

/**
 * Draw face detection box on canvas
 */
export const drawFaceBox = (canvas, detection) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!detection) return;

  const { box } = detection;
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  // Draw label
  ctx.fillStyle = '#10b981';
  ctx.fillRect(box.x, box.y - 25, 120, 25);
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.fillText('Face Detected', box.x + 5, box.y - 8);
};

/**
 * Get user's current geolocation
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};