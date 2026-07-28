import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../services/templates.api';
import { useAuthStore } from '../../auth/store/auth.store';
import toast from 'react-hot-toast';
import { FileBadge, Plus, Trash2, Edit } from 'lucide-react';

export default function TemplatesListPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  
  // Modal state
  const [formData, setFormData] = useState({ title: '', description: '', schema: [] });
  const [schemaField, setSchemaField] = useState({ name: '', type: 'string', required: true });

  const { data: templatesRes, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.getAllTemplates({ limit: 50 })
  });

  const createMutation = useMutation({
    mutationFn: templatesApi.createTemplate,
    onSuccess: () => {
      toast.success('Tạo mẫu chứng chỉ thành công!');
      setShowModal(false);
      setFormData({ title: '', description: '', schema: [] });
      queryClient.invalidateQueries(['templates']);
    }
  });

  const handleAddField = () => {
    if (!schemaField.name) return;
    if (formData.schema.some(f => f.name === schemaField.name)) {
      return toast.error('Trường này đã tồn tại');
    }
    setFormData({
      ...formData,
      schema: [...formData.schema, schemaField]
    });
    setSchemaField({ name: '', type: 'string', required: true });
  };

  const handleRemoveField = (idx) => {
    const newSchema = [...formData.schema];
    newSchema.splice(idx, 1);
    setFormData({ ...formData, schema: newSchema });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || formData.schema.length === 0) {
      return toast.error('Vui lòng nhập tên mẫu và ít nhất 1 trường dữ liệu');
    }
    createMutation.mutate(formData);
  };

  const templates = templatesRes?.data || [];
  const isIssuer = user?.role === 'ISSUER' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBadge className="text-primary" /> Mẫu chứng chỉ
          </h1>
          <p className="text-gray-500 mt-1">Quản lý các loại chứng chỉ số được cấp phát trong hệ thống.</p>
        </div>
        {isIssuer && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} /> Tạo Mẫu mới
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">Đang tải danh sách mẫu...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          Không có mẫu chứng chỉ nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tpl => (
            <div key={tpl._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-foreground mb-2">{tpl.title}</h3>
              <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden line-clamp-2">{tpl.description}</p>
              
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase">Cấu trúc dữ liệu ({tpl.schema.length} trường):</p>
                <div className="flex flex-wrap gap-2">
                  {tpl.schema.map((field, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {field.name}: <span className="text-primary">{field.type}</span> {field.required && '*'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center">
                <span>Tạo bởi: {tpl.issuerId?.userName || 'Issuer'}</span>
                <span>{new Date(tpl.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo Mẫu */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6">Tạo Mẫu Chứng Chỉ Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên Mẫu (VD: Bằng Cử Nhân IT)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                    rows="3"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-semibold">Cấu trúc dữ liệu (Schema)</h3>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs mb-1">Tên trường (VD: gpa, major)</label>
                    <input
                      type="text"
                      value={schemaField.name}
                      onChange={(e) => setSchemaField({...schemaField, name: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none"
                    />
                  </div>
                  <div className="w-1/4">
                    <label className="block text-xs mb-1">Kiểu</label>
                    <select
                      value={schemaField.type}
                      onChange={(e) => setSchemaField({...schemaField, type: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                  <div className="w-1/6 flex items-center justify-center pb-2">
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={schemaField.required}
                        onChange={(e) => setSchemaField({...schemaField, required: e.target.checked})}
                      /> Bắt buộc
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddField}
                    className="px-4 py-2 bg-secondary text-white rounded text-sm hover:bg-secondary/90"
                  >
                    Thêm
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {formData.schema.map((field, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                      <span className="text-sm">
                        <span className="font-semibold">{field.name}</span> ({field.type}) - {field.required ? 'Bắt buộc' : 'Tuỳ chọn'}
                      </span>
                      <button type="button" onClick={() => handleRemoveField(idx)} className="text-danger p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.schema.length === 0 && <p className="text-sm text-gray-500 italic">Chưa có trường dữ liệu nào</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">Huỷ</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-70">
                  {createMutation.isPending ? 'Đang lưu...' : 'Lưu Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
