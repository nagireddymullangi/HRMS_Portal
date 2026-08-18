// src/pages/employee/FaceCheckIn.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUserPlus, FiCamera } from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import FaceEnrollment from '../../components/face/FaceEnrollment';
import FaceAttendance from '../../components/face/FaceAttendance';
import faceRecognitionService from '../../services/faceRecognitionService';
import { useAuth } from '../../context/AuthContext';

const FaceCheckIn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);

  useEffect(() => {
    if (user?.employeeId) checkEnrollment();
  }, [user]);

  const checkEnrollment = async () => {
    try {
      const res = await faceRecognitionService.isEnrolled(user.employeeId);
      setIsEnrolled(res.data.data.enrolled);
    } catch {
      console.error('Failed to check enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Face Recognition Attendance"
        subtitle="Mark your attendance using face recognition"
      />

      {loading ? (
        <Loader fullScreen={false} />
      ) : !isEnrolled ? (
        <div className="max-w-md mx-auto">
          <div className="card text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex
                            items-center justify-center mx-auto mb-4">
              <FiUserPlus className="h-12 w-12 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Face Not Enrolled
            </h2>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              You need to enroll your face before you can use
              face recognition attendance.
            </p>
            <button
              onClick={() => setShowEnrollment(true)}
              className="btn-primary w-full justify-center py-3"
            >
              <FiUserPlus />
              Enroll Face Now
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <FaceAttendance
            onSuccess={() => {
              setTimeout(() => navigate('/employee/attendance'), 2000);
            }}
          />

          <div className="text-center mt-6">
            <button
              onClick={() => setShowEnrollment(true)}
              className="text-sm text-primary-600 hover:underline"
            >
              🔄 Re-enroll Face
            </button>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      <Modal
        isOpen={showEnrollment}
        onClose={() => setShowEnrollment(false)}
        title={isEnrolled ? 'Update Face Enrollment' : 'Enroll Your Face'}
        size="lg"
      >
        <FaceEnrollment
          employeeId={user?.employeeId}
          existingEnrollment={isEnrolled}
          onSuccess={() => {
            setShowEnrollment(false);
            setIsEnrolled(true);
            toast.success('You can now use face recognition!');
          }}
        />
      </Modal>
    </Layout>
  );
};

export default FaceCheckIn;