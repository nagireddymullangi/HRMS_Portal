import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiFileText,
  FiDownload, FiEye
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import documentTemplateService from '../../services/documentTemplateService';
import employeeService from '../../services/employeeService';

const DOC_TYPES = [
  'OFFER_LETTER', 'APPOINTMENT_LETTER', 'EXPERIENCE_LETTER',
  'RELIEVING_LETTER', 'SALARY_CERTIFICATE', 'WARNING_LETTER',
  'PROMOTION_LETTER', 'TRANSFER_LETTER', 'TERMINATION_LETTER',
  'NOC', 'OTHER'
];

const AVAILABLE_VARIABLES = [
  '{{employeeName}}', '{{employeeId}}', '{{designation}}',
  '{{email}}', '{{department}}', '{{dateOfJoining}}',
  '{{lastWorkingDate}}', '{{currentDate}}', '{{companyName}}'
];

const DocumentTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generated, setGenerated] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const { register, handleSubmit, reset, setValue, watch,
          formState: { errors } } = useForm();

  const contentValue = watch('content');

  useEffect(() => {
    fetchAll();
    fetchEmployees();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await documentTemplateService.getAll();
      setTemplates(res.data.data || []);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.data || []);
    } catch {
      console.error('Failed to load');
    }
  };

  const openModal = (template = null) => {
    setEditing(template);
    if (template) {
      Object.keys(template).forEach((k) => setValue(k, template[k]));
    } else {
      reset({ type: 'OFFER_LETTER', isActive: true });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await documentTemplateService.update(editing.id, data);
        toast.success('Template updated');
      } else {
        await documentTemplateService.create(data);
        toast.success('Template created');
      }
      setIsModalOpen(false);
      reset();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    try {
      const res = await documentTemplateService.generate({
        templateId: selectedTemplate.id,
        employeeId: parseInt(selectedEmployee),
      });
      setGenerated(res.data.data);
      setGenerateModal(false);
      setPreviewModal(true);
      toast.success('Document generated');
    } catch {
      toast.error('Generation failed');
    }
  };

  const handleDownload = async () => {
    if (!generated) return;
    try {
      const res = await documentTemplateService.downloadPdf({
        content: generated.content,
        title: generated.subject,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${generated.documentNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async () => {
    try {
      await documentTemplateService.delete(deleteId);
      toast.success('Deleted');
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  const insertVariable = (variable) => {
    const current = contentValue || '';
    setValue('content', current + ' ' + variable);
  };

  return (
    <Layout>
      <PageHeader
        title="Document Templates"
        subtitle="Manage HR document templates with dynamic variables"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Template
          </button>
        }
      />

      {loading ? (
        <Loader fullScreen={false} />
      ) : templates.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiFileText}
            title="No Templates"
            description="Create your first document template"
            action={
              <button onClick={() => openModal()} className="btn-primary">
                <FiPlus /> New Template
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FiFileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex gap-1">
                  {t.isDefault && (
                    <span className="badge-info text-xs">Default</span>
                  )}
                  {t.isActive ? (
                    <span className="badge-success text-xs">Active</span>
                  ) : (
                    <span className="badge-danger text-xs">Inactive</span>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-gray-800">{t.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {t.type.replace(/_/g, ' ')}
              </p>
              {t.subject && (
                <p className="text-sm text-gray-600 mt-2 truncate">
                  {t.subject}
                </p>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedTemplate(t);
                    setGenerateModal(true);
                  }}
                  className="btn-primary text-xs flex-1 justify-center"
                >
                  <FiFileText /> Generate
                </button>
                <button
                  onClick={() => openModal(t)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => setDeleteId(t.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title={editing ? 'Edit Template' : 'New Template'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Template Name *
              </label>
              <input
                {...register('name', { required: 'Required' })}
                className={`input-field ${errors.name ? 'input-error' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                {...register('type', { required: 'Required' })}
                className="input-field"
              >
                {DOC_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              {...register('subject')}
              className="input-field"
              placeholder="e.g., Employment Offer - {{position}}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Available Variables (click to insert)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {AVAILABLE_VARIABLES.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1
                             rounded hover:bg-blue-100 font-mono"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Content (HTML supported) *
            </label>
            <textarea
              {...register('content', { required: 'Required' })}
              rows={12}
              className={`input-field font-mono text-sm resize-y
                          ${errors.content ? 'input-error' : ''}`}
              placeholder="<p>Dear {{employeeName}},</p>..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isActive')} defaultChecked />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isDefault')} />
              <span className="text-sm">Set as Default</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); reset(); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generate Modal */}
      <Modal
        isOpen={generateModal}
        onClose={() => setGenerateModal(false)}
        title="Generate Document"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Generating: <strong>{selectedTemplate?.name}</strong>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="input-field"
            >
              <option value="">Select Employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setGenerateModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="btn-primary flex-1 justify-center"
            >
              Generate
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal}
        onClose={() => setPreviewModal(false)}
        title="Document Preview"
        size="xl"
      >
        {generated && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Document Number</p>
              <p className="font-mono font-semibold">
                {generated.documentNumber}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6
                            max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: generated.content }} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewModal(false)}
                className="btn-secondary flex-1"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary flex-1 justify-center"
              >
                <FiDownload /> Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="This template will be permanently deleted."
      />
    </Layout>
  );
};

export default DocumentTemplates;