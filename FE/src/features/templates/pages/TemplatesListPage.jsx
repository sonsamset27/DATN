import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../services/templates.api';
import { useAuthStore } from '../../auth/store/auth.store';
import toast from 'react-hot-toast';
import { FileBadge, Plus, Trash2, Edit, X, Eye, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TemplatesListPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailTemplate, setDetailTemplate] = useState(null); // template detail to show
  const [deleteConfirm, setDeleteConfirm] = useState(null);   // template id to delete
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  // ---- Fetch Templates (Admin: all, Issuer: by issuerId) ----
  const { data: templatesRes, isLoading } = useQuery({
    queryKey: ['templates', page, searchTerm, isAdmin],
    queryFn: () => {
      const params = { page, limit, ...(searchTerm ? { search: searchTerm } : {}) };
      if (isAdmin) {
        return templatesApi.getAllTemplates(params);
      }
      return templatesApi.getIssuerTemplates(user._id, params);
    }
  });

  // ---- Fetch Detail ----
  const { data: detailRes, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['template-detail', detailTemplate?._id],
    queryFn: () => templatesApi.getTemplateById(detailTemplate._id),
    enabled: !!detailTemplate?._id,
  });

  // ---- Create ----
  const [formData, setFormData] = useState({ name: '', description: '', fields: [] });
  const [fieldForm, setFieldForm] = useState({ name: '', label: '', type: 'string', required: true, options: [] });
  const [optionInput, setOptionInput] = useState('');
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);

  const createMutation = useMutation({
    mutationFn: templatesApi.createTemplate,
    onSuccess: () => {
      toast.success('Tạo mẫu chứng chỉ thành công!');
      setShowCreateModal(false);
      resetForm();
      queryClient.invalidateQueries(['templates']);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Tạo mẫu thất bại');
    }
  });

  // ---- Delete ----
  const deleteMutation = useMutation({
    mutationFn: templatesApi.deleteTemplate,
    onSuccess: () => {
      toast.success('Đã xoá mẫu chứng chỉ!');
      setDeleteConfirm(null);
      setDetailTemplate(null);
      queryClient.removeQueries({ queryKey: ['template-detail'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Xoá thất bại');
    }
  });

  // ---- Update ----
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => templatesApi.updateTemplate(id, data),
    onSuccess: () => {
      toast.success('Cập nhật mẫu chứng chỉ thành công!');
      setShowCreateModal(false);
      resetForm();
      queryClient.removeQueries({ queryKey: ['template-detail'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
    }
  });

  // ---- Form Helpers ----
  const resetForm = () => {
    setFormData({ name: '', description: '', fields: [] });
    setFieldForm({ name: '', label: '', type: 'string', required: true, options: [] });
    setOptionInput('');
    setEditingId(null);
    setEditingFieldIndex(null);
  };

  const handleOpenEdit = (tpl) => {
    setFormData({ name: tpl.name, description: tpl.description, fields: tpl.fields });
    setEditingId(tpl._id);
    setDetailTemplate(null);
    setShowCreateModal(true);
  };

  const handleAddField = () => {
    if (!fieldForm.name || !fieldForm.label) return toast.error('Nhập tên và nhãn trường');
    
    const duplicate = formData.fields.findIndex(f => f.name === fieldForm.name);
    if (duplicate !== -1 && duplicate !== editingFieldIndex) return toast.error('Tên trường đã tồn tại');
    
    if (fieldForm.type === 'select' && fieldForm.options.length === 0) return toast.error('Trường select cần ít nhất 1 option');
    
    if (editingFieldIndex !== null) {
      const updatedFields = [...formData.fields];
      updatedFields[editingFieldIndex] = { ...fieldForm };
      setFormData({ ...formData, fields: updatedFields });
      setEditingFieldIndex(null);
    } else {
      setFormData({ ...formData, fields: [...formData.fields, { ...fieldForm }] });
    }
    
    setFieldForm({ name: '', label: '', type: 'string', required: true, options: [] });
    setOptionInput('');
  };

  const handleEditField = (idx) => {
    setFieldForm({ ...formData.fields[idx] });
    setEditingFieldIndex(idx);
    setOptionInput('');
  };

  const handleRemoveField = (idx) => {
    const updated = [...formData.fields];
    updated.splice(idx, 1);
    setFormData({ ...formData, fields: updated });
  };

  const handleAddOption = () => {
    if (!optionInput.trim()) return;
    setFieldForm({ ...fieldForm, options: [...fieldForm.options, optionInput.trim()] });
    setOptionInput('');
  };

  const handleRemoveOption = (idx) => {
    const opts = [...fieldForm.options];
    opts.splice(idx, 1);
    setFieldForm({ ...fieldForm, options: opts });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fieldForm.name || fieldForm.label) {
      return toast.error('Bạn đang nhập dở 1 trường dữ liệu. Vui lòng bấm "+ Thêm trường" trước khi lưu!');
    }
    if (!formData.name || formData.fields.length === 0) {
      return toast.error('Vui lòng nhập tên mẫu và ít nhất 1 trường dữ liệu');
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const templates = templatesRes?.data || [];
  const total = templatesRes?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;
  const detail = detailRes?.data || detailTemplate;

  // ---- Type Badge Color ----
  const typeBadge = (type) => {
    const map = {
      string: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      number: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      date: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      boolean: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      select: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    };
    return map[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBadge className="text-primary" /> Mẫu chứng chỉ
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin ? 'Tất cả mẫu chứng chỉ trong hệ thống.' : 'Các mẫu chứng chỉ bạn đã tạo.'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium cursor-pointer"
        >
          <Plus size={20} /> Tạo Mẫu mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên mẫu, mã hoặc tên tổ chức..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Template List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FileBadge className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Không tìm thấy mẫu nào phù hợp.' : 'Chưa có mẫu chứng chỉ nào.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map(tpl => (
              <motion.div
                key={tpl._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                onClick={() => setDetailTemplate(tpl)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {tpl.name}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {tpl.fields?.length || 0} trường
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10 line-clamp-2">
                  {tpl.description || 'Không có mô tả'}
                </p>

                {/* Preview fields */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(tpl.fields || []).slice(0, 4).map((field, idx) => (
                    <span key={idx} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeBadge(field.type)}`}>
                      {field.label || field.name}
                    </span>
                  ))}
                  {(tpl.fields || []).length > 4 && (
                    <span className="text-[11px] text-gray-400 px-2 py-0.5">
                      +{tpl.fields.length - 4}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-end gap-2">
                  <div className="flex flex-col gap-0.5 truncate flex-1">
                    {isAdmin && (
                      <span className="truncate text-[11px]" title={tpl.issuerId?.organizationName || tpl.issuerId?.userName}>
                        Tổ chức: <span className="font-medium text-foreground">{tpl.issuerId?.organizationName || tpl.issuerId?.userName || 'N/A'}</span>
                        {tpl.issuerId?.organizationCode && ` (${tpl.issuerId.organizationCode})`}
                      </span>
                    )}
                    <span className="truncate text-[11px]" title={tpl.issuerId?.did || tpl.issuerId?.walletAddress}>
                      Người tạo: <span className="font-mono">{tpl.issuerId?.did ? (tpl.issuerId.did.length > 20 ? tpl.issuerId.did.slice(0, 12) + '...' + tpl.issuerId.did.slice(-8) : tpl.issuerId.did) : (tpl.issuerId?.walletAddress || 'N/A')}</span>
                    </span>
                  </div>
                  <span className="shrink-0 mb-0.5">{new Date(tpl.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-500 px-3">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ========== DETAIL MODAL ========== */}
      <AnimatePresence>
        {detailTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetailTemplate(null); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              {isLoadingDetail ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
              ) : detail ? (
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-foreground">{detail.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{detail.description}</p>
                    </div>
                    <button onClick={() => setDetailTemplate(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0 cursor-pointer">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {isAdmin && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700 col-span-2">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Tổ chức cấp</p>
                        <p className="font-medium">
                          {detail.issuerId?.organizationName || detail.issuerId?.userName || 'N/A'}
                          {detail.issuerId?.organizationCode && ` (${detail.issuerId.organizationCode})`}
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Người tạo (DID)</p>
                      <p className="font-medium font-mono text-xs break-all">{detail.issuerId?.did || detail.issuerId?.walletAddress || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Ngày tạo</p>
                      <p className="font-medium">{new Date(detail.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div>
                    <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-3">
                      Cấu trúc dữ liệu ({detail.fields?.length || 0} trường)
                    </h3>
                    <div className="space-y-2">
                      {(detail.fields || []).map((field, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${typeBadge(field.type)}`}>
                              {field.type}
                            </span>
                            <span className="font-semibold text-sm truncate">{field.label}</span>
                            <span className="text-xs text-gray-400 font-mono truncate">({field.name})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs shrink-0">
                            {field.required && (
                              <span className="text-red-500 font-semibold">Bắt buộc</span>
                            )}
                            {field.type === 'select' && field.options?.length > 0 && (
                              <span className="text-gray-400">
                                [{field.options.join(', ')}]
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleOpenEdit(detail)}
                      className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                    >
                      <Edit size={16} /> Sửa
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(detail._id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                    >
                      <Trash2 size={16} /> Xoá
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== DELETE CONFIRM ========== */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 dark:border-gray-700 text-center space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                <Trash2 size={24} />
              </div>
              <h3 className="font-bold text-lg">Xác nhận xoá</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bạn có chắc chắn muốn xoá mẫu chứng chỉ này? Hành động không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm cursor-pointer">
                  Huỷ
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-70 cursor-pointer"
                >
                  {deleteMutation.isPending ? 'Đang xoá...' : 'Xoá'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== CREATE MODAL ========== */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editingId ? 'Sửa Mẫu Chứng Chỉ' : 'Tạo Mẫu Chứng Chỉ Mới'}</h2>
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên Mẫu <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      placeholder="VD: Bằng Cử Nhân CNTT"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                    <textarea
                      placeholder="Mô tả ngắn gọn về mẫu chứng chỉ..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Schema Builder */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="font-semibold text-sm">Cấu trúc dữ liệu (Schema)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tên trường (name) <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="VD: gpa"
                        value={fieldForm.name}
                        onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nhãn hiển thị (label) <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="VD: Điểm trung bình"
                        value={fieldForm.label}
                        onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Kiểu dữ liệu</label>
                      <select
                        value={fieldForm.type}
                        onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value, options: [] })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                        <option value="select">Select (Dropdown)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
                        <input
                          type="checkbox"
                          checked={fieldForm.required}
                          onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                          className="rounded"
                        />
                        Bắt buộc
                      </label>
                    </div>
                  </div>

                  {/* Options for select type */}
                  {fieldForm.type === 'select' && (
                    <div className="space-y-2 pl-1">
                      <label className="block text-xs text-gray-500">Options cho Select</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Nhập option..."
                          value={optionInput}
                          onChange={(e) => setOptionInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }}
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none"
                        />
                        <button type="button" onClick={handleAddOption} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap">
                          Thêm
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fieldForm.options.map((opt, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-2 py-1 rounded-full">
                            {opt}
                            <button type="button" onClick={() => handleRemoveOption(idx)} className="hover:text-red-500 cursor-pointer">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddField}
                    className={`w-full px-4 py-2 text-white rounded-lg text-sm transition-colors font-medium cursor-pointer ${editingFieldIndex !== null ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-secondary hover:bg-secondary/90'}`}
                  >
                    {editingFieldIndex !== null ? 'Cập nhật trường này' : '+ Thêm trường'}
                  </button>

                  {/* Added fields preview */}
                  <div className="space-y-2 mt-3">
                    {formData.fields.map((field, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${typeBadge(field.type)}`}>
                            {field.type}
                          </span>
                          <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{field.label}</span>
                          <span className="text-xs text-gray-400 font-mono hidden sm:inline">({field.name})</span>
                          {field.required && <span className="text-[10px] text-red-400 font-bold shrink-0">*</span>}
                          {field.type === 'select' && field.options?.length > 0 && <span className="text-[10px] text-gray-400 hidden sm:inline">[{field.options.join(', ')}]</span>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => handleEditField(idx)} className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer">
                            <Edit size={14} />
                          </button>
                          <button type="button" onClick={() => handleRemoveField(idx)} className="text-red-400 hover:text-red-600 p-1 cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.fields.length === 0 && (
                      <p className="text-sm text-gray-400 italic text-center py-2">Chưa có trường dữ liệu nào</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm cursor-pointer">
                    Huỷ
                  </button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 bg-primary text-white rounded-xl disabled:opacity-70 hover:bg-primary/90 transition-colors text-sm font-medium cursor-pointer">
                    {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : (editingId ? 'Cập nhật Template' : 'Lưu Template')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
