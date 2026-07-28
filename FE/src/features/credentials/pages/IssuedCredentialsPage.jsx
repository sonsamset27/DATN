import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import { Link } from 'react-router-dom';
import {
  Award, Plus, Search, X, Loader2, ChevronRight, RotateCcw,
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldX,
  Copy, Check, ExternalLink, Wallet, User, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    ACTIVE: { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', label: 'Hiệu lực' },
    REVOKED: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', label: 'Thu hồi' },
    EXPIRED: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', label: 'Hết hạn' },
  };
  const { cls, label } = cfg[status] || cfg.ACTIVE;
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${cls}`}>{label}</span>;
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );
}

// ─── Detail Sidebar ───────────────────────────────────────────────────────────
function DetailSidebar({ cred, onClose }) {
  const [tab, setTab] = useState('info');

  const { data: res, isLoading } = useQuery({
    queryKey: ['cred-detail-issuer', cred.credentialId],
    queryFn: () => credentialsApi.getCredentialById(cred.credentialId),
    staleTime: 60_000,
  });
  const detail = res?.data;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 w-full max-w-md flex flex-col shadow-2xl h-full">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-5 text-white shrink-0">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Award size={20} className="shrink-0" />
              <h2 className="font-bold text-base line-clamp-1" title={cred.templateName}>{cred.templateName || 'Chi tiết chứng chỉ'}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
          <p className="font-mono text-[11px] text-white/70 break-all">{cred.credentialId}</p>
          {detail && (
            <div className="mt-3">
              <StatusBadge status={detail.status} />
              {detail.isValid !== undefined && (
                <span className={`ml-2 text-[11px] font-semibold ${detail.isValid ? 'text-emerald-300' : 'text-red-300'}`}>
                  {detail.isValid ? '✓ Hash hợp lệ' : '✗ Hash không khớp'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
          {[{ id: 'info', label: 'Thông tin' }, { id: 'data', label: 'Nội dung' }, { id: 'proof', label: 'Blockchain' }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>
          ) : !detail ? (
            <p className="text-center text-gray-400 py-8 text-sm">Không thể tải dữ liệu</p>
          ) : (
            <>
              {tab === 'info' && (
                <div className="space-y-2.5">
                  {[
                    { label: 'Template', value: detail.metadata?.templateId },
                    { label: 'Issuer DID', value: detail.metadata?.issuerDid, mono: true },
                    { label: 'Holder DID', value: detail.metadata?.holderDid, mono: true },
                    { label: 'Ngày cấp', value: new Date(detail.metadata?.issuedAt).toLocaleString('vi-VN') },
                    { label: 'Hết hạn', value: detail.metadata?.expiresAt === 'Never' ? 'Không giới hạn' : new Date(detail.metadata?.expiresAt).toLocaleString('vi-VN') },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-start gap-2 py-2 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide shrink-0 w-24">{row.label}</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className={`text-xs text-right break-all ${row.mono ? 'font-mono text-gray-700 dark:text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>{row.value || '—'}</span>
                        {row.mono && row.value && <CopyBtn text={row.value} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'data' && (
                <div className="space-y-2">
                  {detail.subjectData && Object.keys(detail.subjectData).length > 0
                    ? Object.entries(detail.subjectData).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide capitalize shrink-0">{k}</span>
                        <span className="text-sm text-right text-gray-800 dark:text-gray-200 font-medium">{String(v)}</span>
                      </div>
                    ))
                    : <p className="text-center text-gray-400 py-6 text-sm">Không có nội dung</p>
                  }
                </div>
              )}
              {tab === 'proof' && (
                <div className="space-y-3">
                  {[
                    { label: 'TX Hash', value: detail.proof?.txHash },
                    { label: 'IPFS CID', value: detail.proof?.cid },
                    { label: 'Computed Hash', value: detail.proof?.computedHash },
                    { label: 'Blockchain Hash', value: detail.proof?.blockchainHash },
                  ].map(row => (
                    <div key={row.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{row.label}</span>
                        {row.value && <CopyBtn text={row.value} />}
                      </div>
                      <p className="font-mono text-[11px] text-gray-700 dark:text-gray-300 break-all">{row.value || '—'}</p>
                    </div>
                  ))}
                  {detail.proof?.txHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${detail.proof.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <ExternalLink size={12} /> Xem trên Etherscan
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reissue Modal ─────────────────────────────────────────────────────────────
function ReissueModal({ onClose }) {
  const [oldWallet, setOldWallet] = useState('');
  const [newWallet, setNewWallet] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => credentialsApi.reissueAll({ oldWalletAddress: oldWallet.trim(), newWalletAddress: newWallet.trim() }),
    onSuccess: (res) => {
      const result = res?.data;
      toast.success(result?.message || 'Cấp lại thành công!');
      queryClient.invalidateQueries({ queryKey: ['issued-credentials'] });
      onClose();
    },
    onError: () => { },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!oldWallet.trim() || !newWallet.trim()) return toast.error('Vui lòng nhập đủ địa chỉ ví');
    if (oldWallet.trim() === newWallet.trim()) return toast.error('Ví cũ và ví mới không được trùng nhau');
    mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.5)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <RotateCcw size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Cấp lại chứng chỉ</h2>
              <p className="text-white/70 text-sm">Chuyển toàn bộ chứng chỉ sang ví mới</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <Wallet size={14} /> Địa chỉ ví cũ
            </label>
            <input
              type="text"
              value={oldWallet}
              onChange={(e) => setOldWallet(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm font-mono focus:border-amber-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-all"
              placeholder="0x..."
            />
          </div>

          <div className="flex justify-center">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <ChevronRight size={18} className="text-amber-600 dark:text-amber-400 rotate-90" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <Wallet size={14} /> Địa chỉ ví mới
            </label>
            <input
              type="text"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm font-mono focus:border-amber-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-all"
              placeholder="0x..."
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
            ⚠️ Thao tác này sẽ thu hồi toàn bộ chứng chỉ do tổ chức của bạn cấp từ ví cũ và tạo mới cho ví mới. Không thể hoàn tác.
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</> : 'Xác nhận cấp lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IssuedCredentialsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [holderDid, setHolderDid] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCred, setSelectedCred] = useState(null);
  const [showReissue, setShowReissue] = useState(false);

  const { data: credsRes, isLoading } = useQuery({
    queryKey: ['issued-credentials', page, holderDid, statusFilter],
    queryFn: () => credentialsApi.getIssuedCredentials({
      page,
      limit: 10,
      holderDid: holderDid || undefined,
      status: statusFilter || undefined,
    }),
  });

  const credentials = credsRes?.data || [];
  const total = credsRes?.total || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setHolderDid(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-primary" /> Chứng chỉ đã cấp
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Tổng cộng <span className="font-semibold text-foreground">{total}</span> chứng chỉ đã phát hành
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowReissue(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium text-sm shadow-sm"
          >
            <RotateCcw size={16} /> Cấp lại chứng chỉ
          </button>
          <Link
            to="/issue-credential"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus size={16} /> Cấp mới
          </Link>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo Holder DID hoặc địa chỉ ví..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            Tìm
          </button>
          {holderDid && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setHolderDid(''); setPage(1); }}
              className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </form>

        <div className="flex gap-1.5">
          {['', 'ACTIVE', 'REVOKED', 'EXPIRED'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${statusFilter === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary'
                }`}
            >
              {s === '' ? 'Tất cả' : s === 'ACTIVE' ? 'Hiệu lực' : s === 'REVOKED' ? 'Thu hồi' : 'Hết hạn'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-5 py-4">Credential ID</th>
                <th className="px-5 py-4">Tên chứng chỉ</th>
                <th className="px-5 py-4">Holder DID</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Ngày cấp</th>
                <th className="px-5 py-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Award className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">Không có chứng chỉ nào</p>
                  </td>
                </tr>
              ) : credentials.map((cred) => (
                <tr
                  key={cred.credentialId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedCred(cred)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-primary font-medium">{cred.credentialId}</span>
                      <CopyBtn text={cred.credentialId} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {cred.templateName || 'Không rõ'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]" title={cred.holderDid}>
                        {cred.holderDid}
                      </span>
                      <CopyBtn text={cred.holderDid} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={cred.status} />
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                    {new Date(cred.issuedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedCred(cred); }}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      Xem <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Tổng: <span className="font-semibold text-foreground">{total}</span> chứng chỉ
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
            >
              ← Trước
            </button>
            <span className="px-3 py-1.5 text-xs text-gray-500">Trang {page}</span>
            <button
              disabled={credentials.length < 10}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* Detail Sidebar */}
      {selectedCred && <DetailSidebar cred={selectedCred} onClose={() => setSelectedCred(null)} />}

      {/* Reissue Modal */}
      {showReissue && <ReissueModal onClose={() => setShowReissue(false)} />}
    </div>
  );
}
