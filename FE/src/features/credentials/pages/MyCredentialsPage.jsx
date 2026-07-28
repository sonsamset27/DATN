import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Award, Share2, Calendar, ShieldCheck, ShieldX, Clock,
  X, ExternalLink, Hash, Fingerprint, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, Loader2, FileText,
  Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    ACTIVE:  { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Hiệu lực' },
    REVOKED: { icon: XCircle,      cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Đã thu hồi' },
    EXPIRED: { icon: AlertTriangle,cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'Hết hạn' },
  };
  const { icon: Icon, cls, label } = cfg[status] || cfg.ACTIVE;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon size={11} /> {label}
    </span>
  );
}

// ─── Credential Card ───────────────────────────────────────────────────────────
const GRADIENTS = [
  'from-violet-600 to-indigo-600',
  'from-blue-600 to-cyan-500',
  'from-emerald-600 to-teal-500',
  'from-rose-600 to-pink-500',
  'from-amber-600 to-orange-500',
  'from-slate-700 to-slate-900',
];

function CredentialCard({ cred, index, onClick }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div
      onClick={() => onClick(cred)}
      className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Gradient front face */}
      <div className={`bg-gradient-to-br ${gradient} p-6 pt-7 pb-10 text-white`}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10" />

        <div className="relative">
          {/* Status + Icon row */}
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
              <Award size={24} className="text-white" />
            </div>
            <StatusBadge status={cred.status} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold leading-tight line-clamp-2 mb-6">
            {cred.templateName || 'Chứng chỉ số'}
          </h3>

          {/* Info row */}
          <div className="flex items-center justify-between text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(cred.issuedAt).toLocaleDateString('vi-VN')}
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] bg-white/20 px-2 py-1 rounded-full">
              {cred.credentialId?.slice(0, 18)}…
            </span>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-white dark:bg-gray-800 px-6 py-3 flex justify-between items-center border-t border-black/5 dark:border-white/5">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[60%] font-mono">
          {cred.issuerDid?.slice(0, 30)}…
        </span>
        <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-primary">
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ cred, onClose }) {
  const [tab, setTab] = useState('info');
  const [showQR, setShowQR] = useState(false);

  const { data: detailRes, isLoading } = useQuery({
    queryKey: ['credential-detail', cred.credentialId],
    queryFn: () => credentialsApi.getCredentialById(cred.credentialId),
    staleTime: 60_000,
  });

  const detail = detailRes?.data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,20,0.7)', backdropFilter: 'blur(12px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg leading-tight line-clamp-1">{cred.templateName || 'Chứng chỉ số'}</h2>
            </div>
          </div>
          <div className="mt-4">
            <StatusBadge status={detail?.status || cred.status} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
          {[
            { id: 'info', label: 'Thông tin' },
            { id: 'data', label: 'Dữ liệu' },
            { id: 'proof', label: 'Blockchain' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              {tab === 'info' && (
                <div className="space-y-3">
                  {[
                    { label: 'Credential ID', value: detail?.metadata?.credentialId || cred.credentialId, mono: true },
                    { label: 'Ngày cấp', value: new Date(cred.issuedAt).toLocaleString('vi-VN') },
                    { label: 'Hết hạn', value: cred.expiresAt === 'Never' ? 'Không giới hạn' : new Date(cred.expiresAt).toLocaleString('vi-VN') },
                    { label: 'Issuer DID', value: cred.issuerDid, mono: true },
                    { label: 'Holder DID', value: detail?.metadata?.holderDid || '—', mono: true },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0 w-28">{row.label}</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className={`text-xs text-right break-all ${row.mono ? 'font-mono text-gray-700 dark:text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                          {row.value}
                        </span>
                        {row.mono && row.value && <CopyBtn text={row.value} />}
                      </div>
                    </div>
                  ))}

                  {detail && (
                    <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                      detail.isValid
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {detail.isValid ? <ShieldCheck size={18} /> : <ShieldX size={18} />}
                      {detail.isValid ? 'Chứng chỉ hợp lệ — đã được xác minh trên blockchain' : 'Chứng chỉ KHÔNG hợp lệ'}
                    </div>
                  )}
                </div>
              )}

              {tab === 'data' && (
                <div className="space-y-2">
                  {detail?.subjectData && Object.keys(detail.subjectData).length > 0 ? (
                    Object.entries(detail.subjectData).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0 capitalize">{k}</span>
                        <span className="text-sm text-right text-gray-800 dark:text-gray-200 font-medium">{String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-6 text-sm">Không có dữ liệu</p>
                  )}
                </div>
              )}

              {tab === 'proof' && (
                <div className="space-y-3">
                  {[
                    { label: 'TX Hash', value: detail?.proof?.txHash || cred.txHash },
                    { label: 'IPFS CID', value: detail?.proof?.cid || cred.cid },
                    { label: 'Computed Hash', value: detail?.proof?.computedHash },
                    { label: 'Blockchain Hash', value: detail?.proof?.blockchainHash },
                  ].map(row => (
                    <div key={row.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{row.label}</span>
                        {row.value && <CopyBtn text={row.value} />}
                      </div>
                      <p className="font-mono text-[11px] text-gray-700 dark:text-gray-300 break-all leading-relaxed">{row.value || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 shrink-0">
          <button
            onClick={() => setShowQR(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Share2 size={16} /> Chia sẻ QR
          </button>
          {cred.txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${cred.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* QR popup */}
      {showQR && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.5)' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowQR(false); }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center shadow-2xl w-80 relative">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-1">Mã QR chứng chỉ</h3>
            <p className="text-xs text-gray-500 mb-6 line-clamp-2">{cred.templateName || 'Chứng chỉ số'}</p>
            <div className="bg-white p-3 rounded-2xl inline-block shadow-inner mx-auto mb-4">
              <QRCodeSVG
                value={cred.credentialId}
                size={200}
                bgColor="#ffffff"
                fgColor="#1a1a2e"
                level="Q"
              />
            </div>
            <p className="text-[10px] text-gray-400 font-mono break-all bg-gray-50 dark:bg-gray-900 p-2 rounded-xl">
              {cred.credentialId}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MyCredentialsPage() {
  const [selectedCred, setSelectedCred] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: credsRes, isLoading } = useQuery({
    queryKey: ['my-credentials', statusFilter],
    queryFn: () => credentialsApi.getOwnCredentials({ limit: 50, status: statusFilter || undefined }),
  });

  const credentials = credsRes?.data || [];
  const total = credsRes?.total || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Award className="text-primary shrink-0" /> Chứng chỉ của tôi
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Tổng cộng <span className="font-semibold text-foreground">{total}</span> chứng chỉ đã được cấp
          </p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'ACTIVE', 'REVOKED', 'EXPIRED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary'
              }`}
            >
              {s === '' ? 'Tất cả' : s === 'ACTIVE' ? 'Hiệu lực' : s === 'REVOKED' ? 'Thu hồi' : 'Hết hạn'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <Award className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-gray-500">
            {statusFilter ? `Không có chứng chỉ ${statusFilter}` : 'Bạn chưa có chứng chỉ nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {credentials.map((cred, i) => (
            <CredentialCard key={cred.credentialId} cred={cred} index={i} onClick={setSelectedCred} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCred && (
        <DetailModal cred={selectedCred} onClose={() => setSelectedCred(null)} />
      )}
    </div>
  );
}
