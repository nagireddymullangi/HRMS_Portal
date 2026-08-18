// src/pages/admin/BiometricDevices.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiWifi,
  FiHardDrive, FiRefreshCw, FiCopy, FiCheckCircle
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import biometricDeviceService from '../../services/biometricDeviceService';
import { formatDate } from '../../utils/helpers';

const BiometricDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(null);

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => { fetchDevices(); }, []);

  const fetchDevices = async () => {
    try {
      const res = await biometricDeviceService.getAll();
      setDevices(res.data.data || []);
    } catch {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (device = null) => {
    setEditing(device);
    if (device) {
      Object.keys(device).forEach(k => setValue(k, device[k]));
    } else {
      reset({
        deviceType: 'FINGERPRINT',
        port: 4370,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await biometricDeviceService.update(editing.id, data);
        toast.success('Device updated');
      } else {
        await biometricDeviceService.create(data);
        toast.success('Device added');
      }
      setIsModalOpen(false);
      reset();
      fetchDevices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await biometricDeviceService.delete(deleteId);
      toast.success('Device deleted');
      fetchDevices();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleTest = async (id) => {
    setTesting(id);
    try {
      const res = await biometricDeviceService.testConnection(id);
      const data = res.data.data;
      if (data.success) {
        toast.success('✅ Device is reachable');
      } else {
        toast.error('❌ ' + data.message);
      }
    } catch {
      toast.error('Test failed');
    } finally {
      setTesting(null);
    }
  };

  const copyApiKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied');
  };

  return (
    <Layout>
      <PageHeader
        title="Biometric Devices"
        subtitle="Manage fingerprint & face recognition devices"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> Add Device
          </button>
        }
      />

      {loading ? (
        <Loader fullScreen={false} />
      ) : devices.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiHardDrive}
            title="No Devices"
            description="Add your first biometric device"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <div key={device.id} className="card hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${device.isActive
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-100 text-gray-400'}`}>
                  <FiHardDrive className="h-6 w-6" />
                </div>
                <span className={device.isActive
                  ? 'badge-success' : 'badge-danger'}>
                  {device.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-bold text-gray-800">{device.deviceName}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {device.manufacturer} • {device.model}
              </p>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="badge-info">{device.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IP</span>
                  <span className="font-mono text-xs">
                    {device.ipAddress}:{device.port}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="text-xs">{device.location || '-'}</span>
                </div>
                {device.lastSync && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Sync</span>
                    <span className="text-xs">
                      {formatDate(device.lastSync)}
                    </span>
                  </div>
                )}
              </div>

              {device.apiKey && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">API Key</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono truncate flex-1">
                      {device.apiKey}
                    </code>
                    <button
                      onClick={() => copyApiKey(device.apiKey)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <FiCopy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleTest(device.id)}
                  disabled={testing === device.id}
                  className="btn-secondary text-xs flex-1 justify-center"
                >
                  <FiWifi />
                  {testing === device.id ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={() => openModal(device)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => setDeleteId(device.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title={editing ? 'Edit Device' : 'Add Biometric Device'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Device Name *
              </label>
              <input
                {...register('deviceName', { required: 'Required' })}
                className={`input-field ${
                  errors.deviceName ? 'input-error' : ''}`}
                placeholder="Main Entrance Device"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Device Type *
              </label>
              <select
                {...register('deviceType', { required: true })}
                className="input-field"
              >
                <option value="FINGERPRINT">Fingerprint</option>
                <option value="FACE">Face Recognition</option>
                <option value="RFID">RFID Card</option>
                <option value="HYBRID">Hybrid (Multiple)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Manufacturer
              </label>
              <input
                {...register('manufacturer')}
                className="input-field"
                placeholder="ZKTeco / Essl / Suprema"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                {...register('model')}
                className="input-field"
                placeholder="e.g., K40 Pro"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Serial Number
            </label>
            <input
              {...register('serialNumber')}
              className="input-field"
              placeholder="Device serial number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                IP Address
              </label>
              <input
                {...register('ipAddress')}
                className="input-field"
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Port</label>
              <input
                type="number"
                {...register('port')}
                className="input-field"
                placeholder="4370"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              {...register('location')}
              className="input-field"
              placeholder="e.g., Main Entrance, 1st Floor"
            />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isActive')} defaultChecked />
            <span className="text-sm">Device Active</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button"
                    onClick={() => { setIsModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' :
                editing ? 'Update Device' : 'Add Device'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Device"
        message="This device will be permanently removed."
      />
    </Layout>
  );
};

export default BiometricDevices;