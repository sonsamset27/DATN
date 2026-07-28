import { useState, useRef, useEffect, useCallback } from 'react';
import { credentialsApi } from '../services/credentials.api';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import {
  ShieldCheck, ScanLine, XCircle, FileText, CheckCircle2, ShieldAlert,
  Loader2, Upload, Copy, Check, ExternalLink,
  Calendar, Building2, Hash, Clock, AlertTriangle, User,
  ImageUp, Camera, RefreshCw, BadgeCheck, Fingerprint,
} from 'lucide-react';



// ─── Detect mobile/tablet ──────────────────────────────────────────────────────
function isMobileOrTablet() {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors shrink-0"
      title="Sao chép"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

// ─── Status Config ─────────────────────────────────────────────────────────────
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

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono = false, copyable = false }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-0.5">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm break-all leading-relaxed ${mono ? 'font-mono text-gray-600 dark:text-gray-300 text-xs' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
            {value}
          </span>
          {copyable && value && <CopyBtn text={value} />}
        </div>
      </div>
    </div>
  );
}

// ─── Result Card ───────────────────────────────────────────────────────────────
function VerifyResultCard({ result, onReset }) {
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

// ─── Upload QR Drop Zone ───────────────────────────────────────────────────────
function UploadDropZone({ onFile, isLoading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 group ${
        dragging
          ? 'border-primary bg-primary/10 scale-[1.01]'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
      {isLoading ? (
        <Loader2 size={36} className="text-primary animate-spin" />
      ) : (
        <div className={`p-4 rounded-2xl transition-colors ${dragging ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-primary/10'}`}>
          <ImageUp size={32} className={`transition-colors ${dragging ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
        </div>
      )}
      <div className="text-center">
        <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">
          {isLoading ? 'Đang đọc mã QR...' : dragging ? 'Thả ảnh vào đây' : 'Kéo thả hoặc nhấn để chọn ảnh QR'}
        </p>
        {!isLoading && (
          <p className="text-xs text-gray-400 mt-1">Hỗ trợ PNG, JPG, WEBP chứa mã QR</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function VerifyCredentialPage() {
  const [credentialId, setCredentialId] = useState('');
  const [mode, setMode] = useState('idle'); // 'idle' | 'scan' | 'upload'
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isReadingQR, setIsReadingQR] = useState(false);

  const scannerRef = useRef(null);
  const mobile = isMobileOrTablet();

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  // ── Verify API ──
  const handleVerify = useCallback(async (idToVerify) => {
    const trimmed = (idToVerify ?? credentialId).trim();
    if (!trimmed) return toast.error('Vui lòng nhập Credential ID');
    try {
      setIsVerifying(true);
      setVerifyResult(null);
      const res = await credentialsApi.verifyCredential(trimmed);
      setVerifyResult(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Chứng chỉ không hợp lệ';
      setVerifyResult({
        status: 'INVALID',
        isValid: false,
        metadata: { credentialId: trimmed },
        subjectData: {},
        blockchainProof: {},
        error: msg,
      });
    } finally {
      setIsVerifying(false);
    }
  }, [credentialId]);

  // ── QR Camera ──
  const startScanner = useCallback(async () => {
    setMode('scan');
    setVerifyResult(null);
    // Wait for DOM element
    setTimeout(() => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;
        // Mobile/tablet → rear cam, Desktop → front cam
        const facingMode = mobile ? 'environment' : 'user';
        scanner.start(
          { facingMode },
          { fps: 12, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          (decoded) => {
            setCredentialId(decoded);
            stopScanner(scanner);
            handleVerify(decoded);
          },
          () => {}
        ).catch(err => {
          setMode('idle');
          toast.error('Không thể mở camera: ' + (err?.message || err));
        });
      } catch (err) {
        setMode('idle');
        toast.error('Lỗi khởi tạo camera');
      }
    }, 200);
  }, [mobile, handleVerify]);

  const stopScanner = useCallback((instance = scannerRef.current) => {
    if (instance) {
      instance.stop().then(() => {
        scannerRef.current = null;
        setMode('idle');
      }).catch(() => setMode('idle'));
    } else {
      setMode('idle');
    }
  }, []);

  // ── QR from file ──
  const handleFileQR = useCallback(async (file) => {
    setIsReadingQR(true);
    try {
      // Use a temporary div (not in the DOM) via Html5Qrcode.scanFile
      const tmp = new Html5Qrcode('qr-file-hidden');
      const decoded = await tmp.scanFile(file, true);
      tmp.clear();
      setCredentialId(decoded);
      handleVerify(decoded);
    } catch {
      toast.error('Không thể đọc mã QR từ ảnh. Vui lòng chọn ảnh QR rõ nét hơn.');
    } finally {
      setIsReadingQR(false);
    }
  }, [handleVerify]);

  const handleReset = () => {
    setVerifyResult(null);
    setCredentialId('');
    setMode('idle');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* ── Page Header ── */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/30 mb-1">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Xác minh Chứng chỉ</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed max-w-lg mx-auto">
            Nhập Credential ID, quét mã QR bằng camera hoặc tải ảnh QR lên để kiểm tra tính hợp lệ trên Blockchain.
          </p>
        </div>
      </div>

      {/* ── Input Card ── */}
      {!verifyResult && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">

          {/* Camera scanner view */}
          {mode === 'scan' && (
            <div className="p-5 md:p-7 flex flex-col items-center gap-5">
              <div className="relative w-full max-w-xs mx-auto">
                {/* Scanning animation overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_2s_linear_infinite]" />
                  {/* Corner brackets */}
                  {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'],
                    ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']]
                    .map(([pos, bdr]) => (
                      <div key={pos} className={`absolute ${pos} w-6 h-6 ${bdr} border-primary rounded-sm`} />
                    ))}
                </div>
                <div id="qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-primary/40 shadow-inner" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <Camera size={14} className="inline mr-1.5 text-primary" />
                  {mobile ? 'Camera sau đang hoạt động' : 'Webcam đang hoạt động'}
                </p>
                <p className="text-xs text-gray-400">Đưa mã QR vào khung hình để quét tự động</p>
              </div>
              <button
                onClick={() => stopScanner()}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-2 font-semibold transition-colors shadow-md shadow-red-500/25 text-sm"
              >
                <XCircle size={17} /> Hủy quét
              </button>
            </div>
          )}

          {/* Upload QR view */}
          {mode === 'upload' && (
            <div className="p-5 md:p-7 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
                  <ImageUp size={17} className="text-primary" />
                  Tải ảnh chứa mã QR
                </h3>
                <button
                  onClick={() => setMode('idle')}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XCircle size={17} />
                </button>
              </div>
              <UploadDropZone onFile={handleFileQR} isLoading={isReadingQR} />
            </div>
          )}

          {/* Default input view */}
          {mode === 'idle' && (
            <div className="p-5 md:p-7 space-y-5">
              {/* Text input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Credential ID
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={credentialId}
                    onChange={e => setCredentialId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVerify()}
                    placeholder="VD: HUCE-20260728-XXXX..."
                    className="flex-1 px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-mono text-foreground placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  />
                  <button
                    onClick={() => handleVerify()}
                    disabled={isVerifying || !credentialId.trim()}
                    className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 shrink-0 text-sm"
                  >
                    {isVerifying
                      ? <><Loader2 size={17} className="animate-spin" /> Đang kiểm tra...</>
                      : <><ShieldCheck size={17} /> Xác minh</>
                    }
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">hoặc</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Scan QR button */}
                <button
                  onClick={startScanner}
                  className="flex items-center gap-3.5 px-5 py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:bg-primary/5 transition-all group text-left"
                >
                  <div className="p-2.5 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-xl group-hover:from-violet-200 group-hover:to-indigo-200 dark:group-hover:from-violet-900/50 dark:group-hover:to-indigo-900/50 transition-colors shrink-0">
                    <ScanLine size={22} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">Quét QR bằng Camera</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {mobile ? '📷 Camera sau (rear camera)' : '💻 Webcam máy tính'}
                    </p>
                  </div>
                </button>

                {/* Upload QR button */}
                <button
                  onClick={() => setMode('upload')}
                  className="flex items-center gap-3.5 px-5 py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary hover:bg-primary/5 transition-all group text-left"
                >
                  <div className="p-2.5 bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-900/30 dark:to-cyan-900/30 rounded-xl group-hover:from-sky-200 group-hover:to-cyan-200 dark:group-hover:from-sky-900/50 dark:group-hover:to-cyan-900/50 transition-colors shrink-0">
                    <Upload size={22} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">Tải ảnh QR lên</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">📁 PNG, JPG, WEBP chứa mã QR</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden element required by Html5Qrcode.scanFile */}
      <div id="qr-file-hidden" className="hidden" />

      {/* ── Loading State ── */}
      {isVerifying && (
        <div className="flex flex-col items-center justify-center py-14 gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck size={26} className="text-primary" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-foreground">Đang xác minh...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kiểm tra dữ liệu trên IPFS và Blockchain</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Result Card ── */}
      {verifyResult && !isVerifying && (
        <VerifyResultCard result={verifyResult} onReset={handleReset} />
      )}

      {/* ── Tips (only on idle) ── */}
      {!verifyResult && !isVerifying && mode === 'idle' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          {[
            { icon: Hash, label: 'Nhập thủ công', desc: 'Dán Credential ID vào ô nhập liệu' },
            { icon: ScanLine, label: 'Quét QR', desc: mobile ? 'Camera sau cho kết quả tốt nhất' : 'Dùng webcam máy tính' },
            { icon: ImageUp, label: 'Tải ảnh lên', desc: 'Ảnh chụp màn hình hoặc ảnh QR' },
          ].map(tip => (
            <div key={tip.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
              <div className="p-2 rounded-xl bg-primary/10">
                <tip.icon size={18} className="text-primary" />
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{tip.label}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
