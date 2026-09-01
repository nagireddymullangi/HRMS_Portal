// src/pages/admin/ApplicationsPipeline.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiArrowLeft, FiUser, FiCalendar,
  FiCheck, FiX, FiEye
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import recruitmentService from '../../services/recruitmentService';
import { formatDate, getInitials } from '../../utils/helpers';

const STAGES = [
  { key: 'APPLIED', label: 'Applied', color: 'bg-gray-100' },
  { key: 'SCREENING', label: 'Screening', color: 'bg-blue-100' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-purple-100' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview', color: 'bg-yellow-100' },
  { key: 'INTERVIEWED', label: 'Interviewed', color: 'bg-indigo-100' },
  { key: 'OFFERED', label: 'Offered', color: 'bg-orange-100' },
  { key: 'HIRED', label: 'Hired', color: 'bg-green-100' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-red-100' },
];

const ApplicationsPipeline = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (jobId) fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const [appsRes, jobRes] = await Promise.all([
        recruitmentService.getApplicationsByJob(jobId),
        recruitmentService.getJob(jobId),
      ]);
      setApplications(appsRes.data.data || []);
      setJob(jobRes.data.data);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (appId, newStage) => {
    try {
      await recruitmentService.updateApplicationStage(appId, newStage);
      toast.success('Stage updated');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const getAppsByStage = (stage) =>
    applications.filter(a => a.stage === stage);

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/admin/jobs')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
      >
        <FiArrowLeft /> Back to Jobs
      </button>

      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{job?.title}</h1>
        <p className="text-gray-500">
          {job?.department?.name} • {applications.length} total applications
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STAGES.map(stage => {
          const stageApps = getAppsByStage(stage.key);
          return (
            <div key={stage.key} className="min-w-[280px]">
              <div className={`${stage.color} p-3 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">{stage.label}</h3>
                  <span className="text-xs font-bold bg-white/60 px-2 py-1
                                   rounded-full">
                    {stageApps.length}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-2 rounded-b-lg min-h-[400px]
                              max-h-[600px] overflow-y-auto space-y-2">
                {stageApps.map(app => (
                  <div key={app.id}
                       className="bg-white p-3 rounded-lg shadow-sm
                                  hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => setSelected(app)}>
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br
                                      from-purple-400 to-pink-400 flex
                                      items-center justify-center text-white
                                      text-xs font-bold flex-shrink-0">
                        {getInitials(app.candidate?.firstName + ' ' +
                                     app.candidate?.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {app.candidate?.currentDesignation}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(app.appliedDate)}
                        </p>
                      </div>
                    </div>
                    {app.rating && (
                      <div className="mt-2 text-xs">
                        ⭐ {app.rating}/5
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Application Details"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br
                              from-purple-500 to-pink-500 flex items-center
                              justify-center text-white text-xl font-bold">
                {getInitials(selected.candidate?.firstName + ' ' +
                             selected.candidate?.lastName)}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {selected.candidate?.firstName} {selected.candidate?.lastName}
                </h3>
                <p className="text-gray-500">{selected.candidate?.email}</p>
                <p className="text-xs text-gray-400">
                  #{selected.applicationNumber}
                </p>
              </div>
            </div>

            {selected.coverLetter && (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Cover Letter</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">
                  {selected.coverLetter}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">
                Update Stage
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STAGES.map(s => (
                  <button
                    key={s.key}
                    onClick={() => handleStageChange(selected.id, s.key)}
                    className={`p-2 rounded-lg text-sm font-medium
                      ${selected.stage === s.key
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ApplicationsPipeline;