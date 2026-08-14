// src/pages/admin/ESignaturePad.jsx
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'react-toastify';
import {
  FiEdit3, FiRefreshCw, FiCheckCircle,
  FiCopy, FiSend
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import signatureService from '../../services/signatureService';
import { formatDate, getStatusBadge } from '../../utils/helpers';
import { useEffect } from 'react';

const ESignaturePad = () => {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [signModal, setSignModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const sigCanvasRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await signatureService.getAll();
      setSignatures(res.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const onRequest = async (data) => {
    setSubmitting(true);
    try {
      await signatureService.request({
        signerName: data.signerName,
        signerEmail: data.signerEmail,
        documentType: data.documentType,
        signatureData: 'PENDING',
      });
      toast.success('Signature request created');
      setRequestModal(false);
      reset();
      fetchAll();
    } catch {
      toast.error('Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSign = async () => {
    if (sigCanvasRef.current.isEmpty()) {
      toast.error('Please provide a signature');
      return;
    }
    setSubmitting(true);
    try {
      const signatureData = sigCanvasRef.current.toDataURL('image/png');
      await signatureService.sign(signModal.verificationToken, signatureData);
      toast.success('Document signed successfully');
      setSignModal(null);
      fetchAll();
    } catch {
      toast.error('Sign failed');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = (token) => {
    const link = `${window.location.origin}/sign/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Sign link copied to clipboard');
  };

  return (
    <Layout>
      <PageHeader
        title="E-Signature Management"
        subtitle="Request and manage digital signatures"
        action={
          <button onClick={() => setRequestModal(true)} className="btn-primary">
            <FiSend /> Request Signature
          </button>
        }
      />

      {loading ? (
        <Loader fullScreen={false} />
      ) : signatures.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiEdit3}
            title="No Signature Requests"
            description="Send your first signature request"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signatures.map(sig => (
            <div key={sig.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <FiEdit3 className="h-6 w-6 text-purple-600" />
                </div>
                <span className={getStatusBadge(sig.status)}>
                  {sig.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-800">{sig.signerName}</h3>
              <p className="text-sm text-gray-500">{sig.signerEmail}</p>
              <p className="text-xs text-gray-400 mt-2">
                Type: {sig.documentType}
              </p>

              {sig.status === 'SIGNED' && sig.signatureData && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <img src={sig.signatureData}
                       alt="Signature"
                       className="max-h-16 mx-auto" />
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Signed on {formatDate(sig.signedAt)}
                  </p>
                </div>
              )}

              {sig.status === 'PENDING' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => copyLink(sig.verificationToken)}
                    className="btn-secondary text-xs flex-1 justify-center"
                  >
                    <FiCopy /> Copy Link
                  </button>
                  <button
                    onClick={() => setSignModal(sig)}
                    className="btn-primary text-xs flex-1 justify-center"
                  >
                    <FiEdit3 /> Sign Now
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={requestModal}
        onClose={() => { setRequestModal(false); reset(); }}
        title="Request Signature"
      >
        <form onSubmit={handleSubmit(onRequest)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Signer Name *
            </label>
            <input
              {...register('signerName', { required: 'Required' })}
              className={`input-field ${
                errors.signerName ? 'input-error' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Signer Email *
            </label>
            <input
              type="email"
              {...register('signerEmail', { required: 'Required' })}
              className={`input-field ${
                errors.signerEmail ? 'input-error' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Document Type
            </label>
            <select {...register('documentType')} className="input-field">
              <option value="OFFER_LETTER">Offer Letter</option>
              <option value="APPOINTMENT_LETTER">Appointment Letter</option>
              <option value="NDA">NDA</option>
              <option value="CONTRACT">Contract</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setRequestModal(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Sign Modal */}
      <Modal
        isOpen={!!signModal}
        onClose={() => setSignModal(null)}
        title="Draw Your Signature"
        size="lg"
      >
        {signModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Signing for: <strong>{signModal.signerName}</strong>
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300
                            rounded-lg overflow-hidden">
              <SignatureCanvas
                ref={sigCanvasRef}
                canvasProps={{
                  className: 'w-full h-64 bg-white',
                }}
              />
            </div>

            <p className="text-xs text-gray-500 text-center">
              Draw your signature in the box above
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => sigCanvasRef.current.clear()}
                className="btn-secondary flex-1 justify-center"
              >
                <FiRefreshCw /> Clear
              </button>
              <button
                onClick={handleSign}
                disabled={submitting}
                className="btn-primary flex-1 justify-center"
              >
                <FiCheckCircle /> {submitting ? 'Signing...' : 'Sign'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ESignaturePad;