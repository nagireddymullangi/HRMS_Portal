// src/pages/employee/MyPolicies.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiFileText, FiCheckCircle, FiAlertCircle,
  FiEye, FiClock
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import policyService from '../../services/policyService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const MyPolicies = () => {
  const { user } = useAuth();
  const [activePolicies, setActivePolicies] = useState([]);
  const [pendingPolicies, setPendingPolicies] = useState([]);
  const [viewModal, setViewModal] = useState(null);
  const [ackModal, setAckModal] = useState(null);
  const [signature, setSignature] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('PENDING');

  useEffect(() => {
    if (user?.employeeId) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [activeRes, pendingRes] = await Promise.all([
        policyService.getActive(),
        policyService.getPending(user.employeeId),
      ]);
      setActivePolicies(activeRes.data.data || []);
      setPendingPolicies(pendingRes.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!signature.trim()) {
      toast.error('Please provide your signature');
      return;
    }
    try {
      await policyService.acknowledge(ackModal.id, {
        employeeId: user.employeeId,
        signature,
        comments,
      });
      toast.success('Policy acknowledged ✓');
      setAckModal(null);
      setSignature('');
      setComments('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const displayPolicies = tab === 'PENDING' ? pendingPolicies : activePolicies;

  return (
    <Layout>
      <PageHeader
        title="HR Policies"
        subtitle="Review and acknowledge company policies"
      />

      {pendingPolicies.length > 0 && (
        <div className="card bg-gradient-to-r from-orange-500 to-red-500
                        text-white mb-6">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="h-8 w-8" />
            <div>
              <h3 className="font-bold">Action Required</h3>
              <p className="text-sm opacity-90">
                You have {pendingPolicies.length} pending
                {pendingPolicies.length === 1 ? ' policy' : ' policies'}
                to acknowledge
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('PENDING')}
          className={`px-4 py-2 text-sm font-medium border-b-2
            ${tab === 'PENDING'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500'}`}
        >
          Pending Acknowledgment ({pendingPolicies.length})
        </button>
        <button
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 text-sm font-medium border-b-2
            ${tab === 'ALL'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500'}`}
        >
          All Active Policies ({activePolicies.length})
        </button>
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : displayPolicies.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiCheckCircle}
            title={tab === 'PENDING' ? 'All Caught Up!' : 'No Policies'}
            description={tab === 'PENDING'
              ? 'You have acknowledged all pending policies'
              : 'No active policies at this time'}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayPolicies.map(p => (
            <div key={p.id} className={`card ${
              tab === 'PENDING' ? 'border-l-4 border-orange-500' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-400 font-mono">
                    {p.policyCode} • v{p.version}
                  </p>
                  <h3 className="font-bold text-gray-800 mt-1">{p.title}</h3>
                </div>
                {p.isMandatory && (
                  <span className="badge-danger text-xs">Mandatory</span>
                )}
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                {p.description}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <span className="badge-info text-xs">
                  {p.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  Effective: {formatDate(p.effectiveDate)}
                </span>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setViewModal(p)}
                  className="btn-secondary flex-1 justify-center"
                >
                  <FiEye /> Read Policy
                </button>
                {tab === 'PENDING' && (
                  <button
                    onClick={() => setAckModal(p)}
                    className="btn-success flex-1 justify-center"
                  >
                    <FiCheckCircle /> Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title=""
        size="xl"
      >
        {viewModal && (
          <div>
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 font-mono">
                {viewModal.policyCode} • v{viewModal.version}
              </p>
              <h2 className="text-2xl font-bold mt-1">{viewModal.title}</h2>
              <p className="text-gray-500 mt-1">{viewModal.description}</p>
            </div>
            <div className="mt-4 prose max-w-none"
                 dangerouslySetInnerHTML={{ __html: viewModal.content }} />
            {pendingPolicies.find(p => p.id === viewModal.id) && (
              <button
                onClick={() => {
                  setAckModal(viewModal);
                  setViewModal(null);
                }}
                className="btn-success w-full justify-center mt-4"
              >
                <FiCheckCircle /> Acknowledge This Policy
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Acknowledgment Modal */}
      <Modal
        isOpen={!!ackModal}
        onClose={() => { setAckModal(null); setSignature(''); setComments(''); }}
        title="Acknowledge Policy"
      >
        {ackModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{ackModal.title}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                By acknowledging, you confirm you have read and understood
                this policy.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Type your full name as signature *
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="input-field"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setAckModal(null); setSignature(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={handleAcknowledge}
                      className="btn-success flex-1 justify-center">
                <FiCheckCircle /> I Acknowledge
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default MyPolicies;