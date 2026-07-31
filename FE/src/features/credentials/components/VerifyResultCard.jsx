import { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, ShieldAlert, ShieldCheck,
  FileText, Hash, Clock, User, Calendar, ExternalLink, RefreshCw,
  BadgeCheck, Fingerprint, Building2
} from 'lucide-react';
import CopyBtn from './CopyBtn';
import InfoRow from './InfoRow';

const STATUS_CONFIG = {
  VERIFIED: {
    valid: true,
    title: 'CHỨNG CHỈ HỢP LỆ',
    subtitle: 'Dữ liệu toàn vẹn, đã được xác minh thành công trên Blockchain.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    gradientLight: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    ring: 'ring-emerald-400/30',
    badgeCls: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500',
    watermark: '✓',
    watermarkCls: 'text-emerald-400/15',
  },
  REVOKED: {
    valid: false,
    title: 'CHỨNG CHỈ ĐÃ BỊ THU HỒI',
    subtitle: 'Chứng chỉ này đã bị tổ chức phát hành thu hồi và KHÔNG còn hiệu lực pháp lý.',
    gradient: 'from-red-500 via-rose-500 to-pink-600',
    gradientLight: 'from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30',
    border: 'border-red-200 dark:border-red-800',
    ring: 'ring-red-400/30',
    badgeCls: 'bg-red-500/20 text-red-200 border-red-400/40',
    icon: XCircle,
    iconBg: 'bg-red-500',
    watermark: '✕',
    watermarkCls: 'text-red-400/12',
  },
  EXPIRED: {
    valid: false,
    title: 'CHỨNG CHỈ HẾT HẠN',
    subtitle: 'Chứng chỉ này đã quá thời hạn hiệu lực và không còn giá trị sử dụng.',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    gradientLight: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    ring: 'ring-amber-400/30',
    badgeCls: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    icon: AlertTriangle,
    iconBg: 'bg-amber-500',
    watermark: '⏰',
    watermarkCls: 'text-amber-400/15',
  },
  TAMPERED: {
    valid: false,
    title: 'DỮ LIỆU BỊ CAN THIỆP',
    subtitle: 'Phát hiện dữ liệu chứng chỉ đã bị thay đổi trái phép — Hash không khớp với Blockchain.',
    gradient: 'from-red-700 via-red-600 to-rose-700',
    gradientLight: 'from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30',
    border: 'border-red-300 dark:border-red-700',
    ring: 'ring-red-400/30',
    badgeCls: 'bg-red-600/20 text-red-200 border-red-500/40',
    icon: ShieldAlert,
    iconBg: 'bg-red-700',
    watermark: '⚠',
    watermarkCls: 'text-red-400/12',
  },
  INVALID: {
    valid: false,
    title: 'KHÔNG THỂ XÁC MINH',
    subtitle: 'Không tìm thấy chứng chỉ hoặc có lỗi trong quá trình xác minh.',
    gradient: 'from-gray-500 via-slate-500 to-gray-700',
    gradientLight: 'from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/30',
    border: 'border-gray-200 dark:border-gray-700',
    ring: 'ring-gray-400/20',
    badgeCls: 'bg-gray-500/20 text-gray-300 border-gray-400/40',
    icon: ShieldAlert,
    iconBg: 'bg-gray-500',
    watermark: '?',
    watermarkCls: 'text-gray-400/12',
  },
};

export default function VerifyResultCard({ result, onReset }) {
  const [tab, setTab] = useState('info');
  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.INVALID;
  const StatusIcon = cfg.icon;

  const metadata = result.metadata || {};
  const subjectData = result.subjectData || {};
  const proof = result.blockchainProof || {};

  const fmtDate = (v) => {
    if (!v || v === 'Never') return null;
    try { return new Date(v).toLocaleString('vi-VN', { dateStyle: 'long', timeStyle: 'short' }); }
    catch { return v; }
  };

  return (
    <div
      className={`rounded-3xl border-2 overflow-hidden shadow-2xl ${cfg.border} animate-in fade-in slide-in-from-bottom-6 duration-500`}
      style={{ boxShadow: '0 25px 60px -15px rgba(0,0,0,0.18)' }}
    >
      {/* ── Premium Header ── */}
      <div className={`bg-gradient-to-br ${cfg.gradient} relative overflow-hidden`}>
        {/* Watermark text */}
        <div className={`absolute -top-4 -right-4 text-[140px] font-black leading-none select-none pointer-events-none ${cfg.watermarkCls}`}>
          {cfg.watermark}
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative p-6 md:p-8">
          {/* Status icon + title */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg shrink-0 ring-1 ring-white/30">
              <StatusIcon size={32} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-2 ${cfg.badgeCls}`}>
                {cfg.valid ? <BadgeCheck size={11} /> : <XCircle size={11} />}
                {cfg.valid ? 'Hợp lệ' : 'Không hợp lệ'}
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                {cfg.title}
              </h2>
              <p className="text-white/75 text-sm mt-1.5 leading-relaxed">{cfg.subtitle}</p>
            </div>
          </div>

          {/* Template name */}
          {result.templateName && (
            <div className="mt-4 flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3.5 py-2.5 w-fit">
              <FileText size={14} className="text-white/80 shrink-0" />
              <span className="text-sm font-semibold text-white">{result.templateName}</span>
            </div>
          )}

          {/* Credential ID strip */}
          {metadata.credentialId && (
            <div className="mt-3 flex items-center gap-2 bg-black/25 backdrop-blur-sm rounded-xl px-3.5 py-2.5">
              <Hash size={13} className="text-white/50 shrink-0" />
              <span className="font-mono text-xs text-white/70 truncate flex-1">{metadata.credentialId}</span>
              <CopyBtn text={metadata.credentialId} />
            </div>
          )}

          {/* INVALID: show error message */}
          {result.error && (
            <div className="mt-3 flex items-start gap-2 bg-black/30 rounded-xl px-3.5 py-2.5">
              <AlertTriangle size={14} className="text-white/60 shrink-0 mt-0.5" />
              <span className="text-xs text-white/70">{result.error}</span>
            </div>
          )}
        </div>

        {/* Divider wave */}
        <div className="h-4 bg-gradient-to-b from-transparent to-white/5" />
      </div>

      {/* ── REVOKED / EXPIRED Alert Banner ── */}
      {(result.status === 'REVOKED' || result.status === 'EXPIRED') && (
        <div className={`px-6 py-4 flex items-center gap-3 text-sm font-semibold ${
          result.status === 'REVOKED'
            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-b-2 border-red-200 dark:border-red-800'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-b-2 border-amber-200 dark:border-amber-800'
        }`}>
          <div className={`p-2 rounded-lg ${result.status === 'REVOKED' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
            {result.status === 'REVOKED' ? <XCircle size={18} /> : <Clock size={18} />}
          </div>
          <div>
            <p className="font-bold">{result.status === 'REVOKED' ? '⚠️ Chứng chỉ đã bị thu hồi' : '⏰ Chứng chỉ đã hết hạn'}</p>
            <p className={`text-xs font-normal mt-0.5 ${result.status === 'REVOKED' ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'}`}>
              {result.status === 'REVOKED'
                ? 'Chứng chỉ này không còn giá trị pháp lý. Vui lòng liên hệ tổ chức phát hành để biết thêm thông tin.'
                : `Hết hiệu lực${metadata.expiresAt && metadata.expiresAt !== 'Never' ? ` từ ${fmtDate(metadata.expiresAt)}` : ''}.`
              }
            </p>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800/80">
        {[
          { id: 'info', label: 'Thông tin', icon: FileText },
          { id: 'data', label: 'Nội dung', icon: User },
          { id: 'proof', label: 'Blockchain', icon: Hash },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === t.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.slice(0, 4)}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Body ── */}
      <div className="bg-white dark:bg-gray-800/80">
        {/* INFO tab */}
        {tab === 'info' && (
          <div className="p-5 md:p-6 space-y-0.5">
            <InfoRow icon={Hash}       label="Credential ID"  value={metadata.credentialId}  mono copyable />
            <InfoRow icon={Building2}  label="Issuer DID"     value={metadata.issuerDid}     mono copyable />
            <InfoRow icon={Fingerprint} label="Holder DID"    value={metadata.holderDid}     mono copyable />
            <InfoRow icon={FileText}   label="Loại chứng chỉ" value={result.templateName} />
            <InfoRow icon={Calendar}   label="Ngày cấp"       value={fmtDate(metadata.issuedAt)} />
            <InfoRow
              icon={Clock}
              label="Hiệu lực đến"
              value={metadata.expiresAt === 'Never' ? 'Không giới hạn' : fmtDate(metadata.expiresAt)}
            />
            {/* Status chip */}
            <div className="pt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                result.status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                  : result.status === 'REVOKED'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-700'
                  : result.status === 'EXPIRED'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
              }`}>
                <ShieldCheck size={13} />
                Trạng thái: {metadata.status || result.status}
              </span>
            </div>
          </div>
        )}

        {/* DATA tab */}
        {tab === 'data' && (
          <div className="p-5 md:p-6">
            {Object.keys(subjectData).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(subjectData).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-4 py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 hover:border-primary/30 transition-colors">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider capitalize shrink-0 mt-0.5 min-w-[80px]">{k}</span>
                    <span className="text-sm text-right text-gray-800 dark:text-gray-200 font-semibold break-all">{String(v)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={40} className="mx-auto text-gray-200 dark:text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">Không có dữ liệu nội dung</p>
              </div>
            )}
          </div>
        )}

        {/* PROOF tab */}
        {tab === 'proof' && (
          <div className="p-5 md:p-6 space-y-3">
            {[
              { label: 'TX Hash', value: proof.txHash },
              { label: 'IPFS CID', value: proof.cid },
              { label: 'Computed Hash', value: proof.credentialHash },
              { label: 'Blockchain Hash', value: proof.blockchainHash },
            ].map(row => (
              <div key={row.label} className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{row.label}</span>
                  {row.value && <CopyBtn text={row.value} />}
                </div>
                <p className="font-mono text-[11px] text-gray-600 dark:text-gray-300 break-all leading-relaxed">
                  {row.value || <span className="text-gray-300 dark:text-gray-600 italic">Không có dữ liệu</span>}
                </p>
              </div>
            ))}

            {/* Hash match indicator */}
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold border ${
              proof.isHashValid
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
            }`}>
              <div className={`p-1.5 rounded-lg ${proof.isHashValid ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                {proof.isHashValid ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </div>
              <div>
                <p>{proof.isHashValid ? 'Hash khớp — Dữ liệu toàn vẹn' : 'Hash KHÔNG khớp — Dữ liệu đã bị can thiệp'}</p>
                <p className="text-xs font-normal mt-0.5 opacity-70">
                  {proof.isHashValid ? 'Dữ liệu chứng chỉ chưa bị thay đổi kể từ khi phát hành.' : 'Cảnh báo: nội dung chứng chỉ có thể đã bị chỉnh sửa.'}
                </p>
              </div>
            </div>

            {proof.txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${proof.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary/30 text-primary hover:bg-primary/5 transition-colors text-sm font-semibold"
              >
                <ExternalLink size={15} />
                Xem giao dịch trên Etherscan
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Footer Reset ── */}
      <div className="px-5 pb-5 pt-1 bg-white dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50">
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 hover:border-primary/40 hover:text-primary group"
        >
          <RefreshCw size={15} className="group-hover:rotate-180 transition-transform duration-500" />
          Xác minh chứng chỉ khác
        </button>
      </div>
    </div>
  );
}
