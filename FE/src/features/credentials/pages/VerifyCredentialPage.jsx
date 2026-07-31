import { useState, useRef, useEffect, useCallback } from 'react';
import { credentialsApi } from '../services/credentials.api';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import {
  ShieldCheck, ScanLine, XCircle, Loader2, ImageUp, Camera, Upload, Hash
} from 'lucide-react';

import UploadDropZone from '../components/UploadDropZone';
import VerifyResultCard from '../components/VerifyResultCard';



// ─── Detect mobile/tablet ──────────────────────────────────────────────────────
function isMobileOrTablet() {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
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
      } catch {
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
