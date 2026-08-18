// src/pages/admin/FaceEnrollments.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiUserCheck, FiTrash2, FiCamera, FiSearch
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import FaceEnrollment from '../../components/face/FaceEnrollment';
import faceRecognitionService from '../../services/faceRecognitionService';
import employeeService from '../../services/employeeService';
import { formatDate, getInitials } from '../../utils/helpers';

const FaceEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [enrollModal, setEnrollModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrRes, empRes] = await Promise.all([
        faceRecognitionService.getAllEnrollments(),
        employeeService.getAll(),
      ]);
      setEnrollments(enrRes.data.data || []);
      setEmployees(empRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await faceRecognitionService.deleteEnrollment(deleteId);
      toast.success('Enrollment deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const enrolledIds = new Set(enrollments.map(e => e.employee?.id));
  const notEnrolled = employees.filter(e => !enrolledIds.has(e.id));

  const filtered = enrollments.filter(e => {
    const name = e.employee?.firstName + ' ' + e.employee?.lastName;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Layout>
      <PageHeader
        title="Face Enrollments"
        subtitle="Manage employee face registrations"
        action={
          <button onClick={() => setEnrollModal(true)} className="btn-primary">
            <FiCamera /> Enroll New Face
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white">
          <p className="text-sm opacity-90">Total Enrolled</p>
          <p className="text-3xl font-bold mt-2">{enrollments.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white">
          <p className="text-sm opacity-90">Not Enrolled</p>
          <p className="text-3xl font-bold mt-2">{notEnrolled.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white">
          <p className="text-sm opacity-90">Total Employees</p>
          <p className="text-3xl font-bold mt-2">{employees.length}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search enrolled employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiUserCheck}
            title="No Enrollments"
            description="Enroll employees to enable face recognition"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => {
            const emp = e.employee;
            return (
              <div key={e.id} className="card">
                <div className="flex items-start gap-3">
                  {e.faceImageUrl ? (
                    <img
                      src={`http://localhost:8080${e.faceImageUrl}`}
                      alt={emp?.firstName}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary-100
                                    flex items-center justify-center">
                      <span className="text-primary-700 font-bold">
                        {getInitials(emp?.firstName + ' ' + emp?.lastName)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">
                      {emp?.firstName} {emp?.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">{emp?.employeeId}</p>
                    {e.qualityScore && (
                      <p className="text-xs text-green-600 mt-1">
                        Quality: {(e.qualityScore * 100).toFixed(0)}%
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Enrolled: {formatDate(e.enrolledAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteId(emp.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enroll Modal */}
      <Modal
        isOpen={enrollModal}
        onClose={() => { setEnrollModal(false); setSelectedEmployee(''); }}
        title="Enroll Employee Face"
        size="lg"
      >
        {!selectedEmployee ? (
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Employee to Enroll
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="input-field"
            >
              <option value="">Choose Employee</option>
              {notEnrolled.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
            {notEnrolled.length === 0 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                All employees are already enrolled
              </p>
            )}
          </div>
        ) : (
          <FaceEnrollment
            employeeId={parseInt(selectedEmployee)}
            onSuccess={() => {
              setEnrollModal(false);
              setSelectedEmployee('');
              fetchData();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Enrollment"
        message="This will remove face recognition access for this employee."
      />
    </Layout>
  );
};

export default FaceEnrollments;