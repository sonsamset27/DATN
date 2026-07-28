import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { templatesApi } from '../../templates/services/templates.api';
import { credentialsApi } from '../services/credentials.api';
import { useAuthStore } from '../../auth/store/auth.store';
import toast from 'react-hot-toast';
import { ShieldPlus, FileKey, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

export default function IssueCredentialPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [holderAddress, setHolderAddress] = useState('');
  const [subjectData, setSubjectData] = useState({});
  const [expiresAt, setExpiresAt] = useState('');

  // Lấy các template do issuer này tạo
  const { data: templatesRes, isLoading: loadingTemplates } = useQuery({
    queryKey: ['issuer-templates', user?._id],
    queryFn: () => templatesApi.getIssuerTemplates(user?._id),
    enabled: !!user?._id
  });

  const templates = templatesRes?.data || [];

  const issueMutation = useMutation({
    mutationFn: credentialsApi.issueCredential,
    onSuccess: () => {
      toast.success('Phát hành chứng chỉ thành công!');
      navigate('/issued-credentials');
    }
  });

  const handleTemplateSelect = (e) => {
    const tpl = templates.find(t => t._id === e.target.value);
    setSelectedTemplate(tpl);
    // Reset subject data form
    const initData = {};
    if (tpl?.fields) {
      tpl.fields.forEach(field => {
        initData[field.name] = field.type === 'number' ? 0 : '';
      });
    }
    setSubjectData(initData);
  };

  const handleSubjectChange = (name, val) => {
    setSubjectData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTemplate) return toast.error('Vui lòng chọn mẫu chứng chỉ');
    if (!holderAddress) return toast.error('Vui lòng nhập địa chỉ ví của Holder');
    
    // Convert subjectData types based on schema
    const formattedSubject = {};
    (selectedTemplate.fields || []).forEach(field => {
      let val = subjectData[field.name];
      if (field.type === 'number') val = Number(val);
      if (field.type === 'boolean') val = Boolean(val);
      formattedSubject[field.name] = val;
    });

    const payload = {
      holderAddress: holderAddress.trim(),
      credentialTemplateId: selectedTemplate._id,
      credentialSubject: formattedSubject,
    };
    
    if (expiresAt) {
      payload.expiresAt = new Date(expiresAt).toISOString();
    }

    issueMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <ShieldPlus size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Cấp chứng chỉ mới</h1>
          <p className="text-gray-500">Tạo và phát hành chứng chỉ số lên Blockchain.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        {loadingTemplates ? (
          <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-primary" /></div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-danger">
            Bạn chưa tạo Mẫu chứng chỉ (Template) nào. Hãy tạo Template trước khi cấp phát.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-700 pb-2">1. Thông tin chung</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mẫu chứng chỉ (Template) *</label>
                <select
                  onChange={handleTemplateSelect}
                  value={selectedTemplate?._id || ''}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                  required
                >
                  <option value="" disabled>-- Chọn mẫu chứng chỉ --</option>
                  {templates.map(tpl => (
                    <option key={tpl._id} value={tpl._id}>{tpl.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ ví người nhận (Holder Address) *</label>
                <input
                  type="text"
                  value={holderAddress}
                  onChange={e => setHolderAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ngày hết hạn (Tuỳ chọn)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {selectedTemplate && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileKey className="text-secondary" size={20} /> 
                  2. Dữ liệu chứng chỉ ({selectedTemplate.name})
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                  {(selectedTemplate.fields || []).map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium mb-1">
                        {field.label || field.name} {field.required && <span className="text-danger">*</span>}
                        <span className="text-xs text-gray-400 lowercase ml-2">({field.type})</span>
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={subjectData[field.name] || ''}
                          onChange={(e) => handleSubjectChange(field.name, e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-secondary outline-none"
                          required={field.required}
                        >
                          <option value="" disabled>-- Chọn {field.label || field.name} --</option>
                          {(field.options || []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'boolean' ? (
                        <select
                          value={subjectData[field.name] === true ? 'true' : subjectData[field.name] === false ? 'false' : ''}
                          onChange={(e) => handleSubjectChange(field.name, e.target.value === 'true')}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-secondary outline-none"
                          required={field.required}
                        >
                          <option value="" disabled>-- Chọn True / False --</option>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          value={subjectData[field.name] || ''}
                          onChange={(e) => handleSubjectChange(field.name, e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-secondary outline-none"
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                  {(selectedTemplate.fields || []).length === 0 && (
                    <p className="text-sm text-gray-500 italic">Mẫu này không có trường dữ liệu cụ thể.</p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={issueMutation.isPending || !selectedTemplate}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors disabled:opacity-70 text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
              >
                {issueMutation.isPending ? <Loader2 className="animate-spin w-6 h-6" /> : 'Phát hành Chứng chỉ Số'}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                <ShieldCheck size={14}/> Giao dịch sẽ được ghi trực tiếp lên Blockchain, không thể đảo ngược.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
