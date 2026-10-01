import { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, ShieldAlert, ShieldCheck,
  FileText, Hash, Clock, User, Calendar, ExternalLink, RefreshCw,
  BadgeCheck, Fingerprint, Building2
} from 'lucide-react';
import CopyBtn from './CopyBtn';
import InfoRow from './InfoRow';

const STATUS_CONFIG = {
  ACTIVE: {
    valid: true,
    title: 'Chứng chỉ hợp lệ',
    subtitle: 'Dữ liệu toàn vẹn, đã được xác minh thành công trên blockchain Sepolia.',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    gradientLight: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    ring: 'ring-emerald-400/30',
    badgeCls: 'bg-white/20 text-white border-white/30',
    icon: CheckCircle2,
  },
  VERIFIED_SELECTIVE: {
    valid: true,
    title: 'Xác thực thành công',
    subtitle: 'Chứng chỉ hợp lệ trên blockchain. Các trường riêng tư đã được ẩn và các trường còn lại khớp chính xác với dữ liệu gốc.',
    gradient: 'from-violet-600 via-indigo-600 to-purple-700',
    gradientLight: 'from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/30',
    border: 'border-violet-300 dark:border-violet-700',
    ring: 'ring-violet-400/30',
    badgeCls: 'bg-white/20 text-white border-white/30',
    icon: ShieldCheck,
  },
  VERIFIED: {
    valid: true,
    title: 'Chứng chỉ hợp lệ',
    subtitle: 'Dữ liệu toàn vẹn, đã được xác minh thành công trên blockchain Sepolia.',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    gradientLight: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    ring: 'ring-emerald-400/30',
    badgeCls: 'bg-white/20 text-white border-white/30',
    icon: CheckCircle2,
  },
  REVOKED: {
    valid: false,
    title: 'Chứng chỉ đã bị thu hồi',
    subtitle: 'Chứng chỉ này đã bị đơn vị cấp thu hồi và không còn giá trị sử dụng.',
    gradient: 'from-rose-600 via-red-600 to-pink-700',
    gradientLight: 'from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800',
    ring: 'ring-rose-400/30',
    badgeCls: 'bg-white/20 text-white border-white/30',
    icon: XCircle,
  },
  EXPIRED: {
    valid: false,
    title: 'Chứng chỉ đã hết hạn',
    subtitle: 'Chứng chỉ này đã quá thời hạn hiệu lực.',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    gradientLight: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    ring: 'ring-amber-400/30',
    badgeCls: 'bg-white/20 text-white border-white/30',
    icon: AlertTriangle,
  },
  TAMPERED: {
    valid: false,
    title: 'Dữ liệu không khớp',
    subtitle: 'Mã xác thực của chứng chỉ không trùng khớp với bản ghi lưu trên blockchain.',
    gradient: 'from-red-700 via-red-600 to-rose-800',
    gradientLight: 'from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30',
    border: 'border-red-300 dark:border-red-700',
    ring: 'ring-red-400/30',
    badgeCls: 'bg-white/20 text-white border-white/30',
    icon: ShieldAlert,
  },
  INVALID: {
    valid: false,
    title: 'Không thể xác minh',
    subtitle: 'Không tìm thấy chứng chỉ hoặc dữ liệu kiểm tra không hợp lệ.',
    gradient: 'from-slate-600 via-gray-600 to-zinc-700',
    gradientLight: 'from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/30',
    border: 'border-gray-200 dark:border-gray-700',
    ring: 'ring-gray-400/20',
    badgeCls: 'bg-white/20 text-white border-white/30',
    icon: ShieldAlert,
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
      className={`rounded-3xl border overflow-hidden shadow-xl ${cfg.border} animate-in fade-in slide-in-from-bottom-4 duration-400 bg-white dark:bg-slate-900`}
    >
      {/* ── Header ── */}
      <div className={`bg-gradient-to-br ${cfg.gradient} relative overflow-hidden`}>
        {/* Decorative subtle ambient lights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/15 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative p-6 md:p-8">
          {/* Status icon + title */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md shadow-md shrink-0 border border-white/25">
              <StatusIcon size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wide mb-2 ${cfg.badgeCls}`}>
                {cfg.valid ? <BadgeCheck size={12} /> : <XCircle size={12} />}
                {result.isSelectiveDisclosure ? 'Chia sẻ có chọn lọc' : (cfg.valid ? 'Hợp lệ' : 'Không hợp lệ')}
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
                {cfg.title}
              </h2>
              <p className="text-white/85 text-xs md:text-sm mt-1.5 leading-relaxed max-w-xl">{cfg.subtitle}</p>
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
            <p className="font-bold">{result.status === 'REVOKED' ? 'Chứng chỉ đã bị thu hồi' : 'Chứng chỉ đã hết hạn'}</p>
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
            <InfoRow icon={Hash}       label="Mã chứng chỉ"  value={metadata.credentialId}  mono copyable />
            <InfoRow icon={Building2}  label="Đơn vị cấp"     value={metadata.issuerDid}     mono copyable />
            <InfoRow icon={Fingerprint} label="Người nhận"    value={metadata.holderDid}     mono copyable />
            <InfoRow icon={FileText}   label="Loại chứng chỉ" value={result.templateName} />
            <InfoRow icon={Calendar}   label="Ngày cấp"       value={fmtDate(metadata.issuedAt)} />
            <InfoRow
              icon={Clock}
              label="Thời hạn"
              value={metadata.expiresAt === 'Never' ? 'Không thời hạn' : fmtDate(metadata.expiresAt)}
            />
            {/* Status chip */}
            <div className="pt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                result.status === 'VERIFIED' || result.status === 'VERIFIED_SELECTIVE'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                  : result.status === 'REVOKED'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-700'
                  : result.status === 'EXPIRED'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
              }`}>
                {result.status === 'VERIFIED' || result.status === 'VERIFIED_SELECTIVE' ? (
                  <ShieldCheck size={13} />
                ) : result.status === 'EXPIRED' ? (
                  <Clock size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                Trạng thái:{' '}
                {result.status === 'VERIFIED' || result.status === 'VERIFIED_SELECTIVE'
                  ? 'Còn hiệu lực'
                  : result.status === 'REVOKED'
                  ? 'Đã thu hồi'
                  : result.status === 'EXPIRED'
                  ? 'Đã hết hạn'
                  : result.status === 'TAMPERED'
                  ? 'Dữ liệu không khớp'
                  : 'Không hợp lệ'}
              </span>
            </div>
          </div>
        )}

        {/* DATA tab */}
        {tab === 'data' && (
          <div className="p-5 md:p-6 space-y-4">
            {/* Selective Disclosure Info Banner */}
            {result.isSelectiveDisclosure && (
              cfg.valid ? (
                <div className="p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/60 text-xs text-violet-900 dark:text-violet-200 flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="leading-relaxed">
                    Người sở hữu đã chọn ẩn một số mục riêng tư. Các thông tin hiển thị còn lại đều khớp chính xác với dữ liệu gốc trên blockchain.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2.5">
                  <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="leading-relaxed font-semibold">
                    Cảnh báo: Dữ liệu chia sẻ đã bị can thiệp hoặc không khớp với mã băm trên Blockchain. Các thông tin hiển thị dưới đây KHÔNG CÓ GIÁ TRỊ XÁC THỰC!
                  </span>
                </div>
              )
            )}

            {/* List with clean border & divider (shadcn card list) */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {Object.keys(result.revealedData || subjectData).map((k) => {
                const val = (result.revealedData || subjectData)[k];
                return (
                  <div key={k} className="flex items-center justify-between py-3.5 px-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{k}</span>
                      {result.isSelectiveDisclosure && (
                        cfg.valid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            Công khai
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                            Không xác thực
                          </span>
                        )
                      )}
                    </div>
                    <span className={`text-sm font-semibold break-all ${cfg.valid ? 'text-slate-900 dark:text-slate-100' : 'text-rose-700 dark:text-rose-400 line-through opacity-75'}`}>
                      {String(val)}
                    </span>
                  </div>
                );
              })}

              {/* Hidden Fields if Selective Disclosure */}
              {result.hiddenFields && result.hiddenFields.map((k) => (
                <div key={k} className="flex items-center justify-between py-3.5 px-4 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{k}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80">
                      Đã ẩn
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tracking-widest select-none">••••••••••••</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <ShieldCheck size={12} className="text-slate-500 shrink-0" />
                      Đã ẩn
                    </span>
                  </div>
                </div>
              ))}

              {!Object.keys(result.revealedData || subjectData).length && (!result.hiddenFields || !result.hiddenFields.length) && (
                <div className="text-center py-12">
                  <FileText size={40} className="mx-auto text-gray-200 dark:text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm">Không có dữ liệu nội dung</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROOF tab */}
        {tab === 'proof' && (
          <div className="p-5 md:p-6 space-y-3">
            {[
              { label: 'Mã giao dịch', value: proof.txHash },
              { label: 'Mã lưu trữ IPFS', value: proof.cid },
              { label: result.isSelectiveDisclosure ? 'Mã gốc Merkle' : 'Mã băm dữ liệu', value: proof.merkleRoot || proof.credentialHash },
              { label: 'Mã lưu trên blockchain', value: proof.blockchainHash },
            ].filter(r => r.value !== undefined).map(row => (
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
                <p>{proof.isHashValid ? (result.isSelectiveDisclosure ? 'Khớp mã gốc, dữ liệu toàn vẹn' : 'Khớp mã băm, dữ liệu toàn vẹn') : 'Dữ liệu không khớp với bản ghi trên blockchain'}</p>
                <p className="text-xs font-normal mt-0.5 opacity-70">
                  {proof.isHashValid ? (result.isSelectiveDisclosure ? 'Dữ liệu được đối soát thành công qua Merkle Tree từ các trường công khai và các nhánh ẩn.' : 'Nội dung chứng chỉ khớp hoàn toàn với bản gốc đã phát hành.') : 'Nội dung chứng chỉ không trùng khớp với dữ liệu đã lưu.'}
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
