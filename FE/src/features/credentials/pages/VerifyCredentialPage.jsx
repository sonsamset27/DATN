import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { credentialsApi } from '../services/credentials.api';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';
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

// ── Bulletproof Selective Disclosure Parser ───────────────────────────────────
function parseSelectiveDisclosure(raw) {
  if (!raw) return null;
  const str = String(raw).trim();

  // If raw JSON string
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      if (parsed && (parsed.revealed || parsed.merkleRoot)) return parsed;
    } catch {}
  }

  // Extract base64 candidate from URL or query
  let b64 = str;
  if (str.includes('sd=')) {
    try {
      const urlObj = new URL(str.startsWith('http') ? str : `http://dummy.com/${str}`);
      b64 = urlObj.searchParams.get('sd') || '';
    } catch {
      const match = str.match(/sd=([^&]+)/);
      if (match) b64 = match[1];
    }
  }

  if (!b64) return null;

  // Restore standard Base64 characters if spaces or URL-safe chars are present
  let cleanB64 = decodeURIComponent(b64).trim().replace(/ /g, '+');
  cleanB64 = cleanB64.replace(/-/g, '+').replace(/_/g, '/');
  while (cleanB64.length % 4 !== 0) {
    cleanB64 += '=';
  }

  // Try decoding UTF-8 bytes from binary string
  try {
    const binary = atob(cleanB64);
    try {
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const text = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(text);
      if (parsed && (parsed.revealed || parsed.merkleRoot)) return parsed;
    } catch {
      const parsed = JSON.parse(decodeURIComponent(escape(binary)));
      if (parsed && (parsed.revealed || parsed.merkleRoot)) return parsed;
    }
  } catch (e) {
    // Fallback: direct decodeURIComponent then JSON
    try {
      const parsed = JSON.parse(decodeURIComponent(str));
      if (parsed && (parsed.revealed || parsed.merkleRoot)) return parsed;
    } catch {}
  }

  return null;
}

// ── Load image file into an HTMLImageElement ──────────────────────────────────
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

// ── Multi-scale & Contrast-enhanced QR Scanner from Image ──────────────────────
async function scanQRFromImage(file) {
  // Pass 0: Native BarcodeDetector (hardware-accelerated ML Kit / Vision framework)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const img = await loadImage(file);
      const codes = await detector.detect(img);
      if (codes && codes.length > 0 && codes[0].rawValue) {
        return codes[0].rawValue;
      }
    } catch (e) {
      console.warn('Native BarcodeDetector detect failed, falling back:', e);
    }
  }

  // Pass 1: Multi-scale downsampling & contrast-enhanced jsQR
  try {
    const img = await loadImage(file);
    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    // Test multiple resolutions (downsampling eliminates screen moire patterns)
    const maxDims = [1000, 750, 500, 1400, Math.max(origW, origH)];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    for (const maxDim of maxDims) {
      const scale = Math.min(1, maxDim / Math.max(origW, origH));
      const w = Math.round(origW * scale);
      const h = Math.round(origH * scale);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);

      // Pass 1.1: Raw
      const res1 = jsQR(imgData.data, w, h, { inversionAttempts: 'attemptBoth' });
      if (res1?.data) return res1.data;

      // Pass 1.2: Grayscale & Contrast boost (resolves monitor glare)
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const val = gray > 125 ? Math.min(255, gray + 45) : Math.max(0, gray - 45);
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      }
      const res2 = jsQR(d, w, h, { inversionAttempts: 'attemptBoth' });
      if (res2?.data) return res2.data;

      // Pass 1.3: Hard binarization
      for (let i = 0; i < d.length; i += 4) {
        const val = d[i] > 128 ? 255 : 0;
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      }
      const res3 = jsQR(d, w, h, { inversionAttempts: 'attemptBoth' });
      if (res3?.data) return res3.data;
    }
  } catch (err) {
    console.warn('[scanQRFromImage] jsQR multi-scale pass failed, falling back:', err);
  }

  // Fallback to Html5Qrcode.scanFile
  try {
    const hiddenDiv = document.getElementById('qr-file-hidden');
    if (hiddenDiv) {
      const scanner = new Html5Qrcode('qr-file-hidden');
      const decoded = await scanner.scanFile(file, true);
      try { scanner.clear(); } catch {}
      if (decoded) return decoded;
    }
  } catch {}

  return null;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VerifyCredentialPage() {
  const [searchParams] = useSearchParams();
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
        scannerRef.current.stop().catch(() => { });
        scannerRef.current = null;
      }
    };
  }, []);

  // ── Verify Selective Disclosure API ──
  const handleVerifySelective = useCallback(async (payload) => {
    try {
      setIsVerifying(true);
      setVerifyResult(null);
      const res = await credentialsApi.verifySelectiveCredential(payload);
      setVerifyResult(res.data);
      if (res.data?.metadata?.credentialId) {
        setCredentialId(res.data.metadata.credentialId);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xác thực chứng chỉ';
      setVerifyResult({
        status: 'TAMPERED',
        isValid: false,
        isSelectiveDisclosure: true,
        metadata: { credentialId: payload?.credentialId || 'N/A' },
        revealedData: payload?.revealed || {},
        hiddenFields: Object.keys(payload?.hidden || {}),
        blockchainProof: {},
        error: msg,
      });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // ── Verify Standard API (or detect Selective Disclosure payload) ──
  const handleVerify = useCallback(async (idToVerify) => {
    const raw = (idToVerify ?? credentialId).trim();
    if (!raw) return toast.error('Vui lòng nhập Credential ID hoặc liên kết xác thực');

    // Case A: Selective Disclosure (URL or JSON or base64 string)
    const sdPayload = parseSelectiveDisclosure(raw);
    if (sdPayload) {
      return handleVerifySelective(sdPayload);
    }

    // Case B: Standard ID from URL (e.g. http://localhost:5173/verify?id=KMA-001)
    let targetId = raw;
    if (raw.includes('id=')) {
      try {
        const urlObj = new URL(raw.startsWith('http') ? raw : `http://dummy.com/${raw}`);
        const idParam = urlObj.searchParams.get('id');
        if (idParam) targetId = idParam;
      } catch (err) {
        console.error('Failed to parse ID URL:', err);
      }
    } else if (raw.startsWith('http')) {
      try {
        const urlObj = new URL(raw);
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts.length > 0 && parts[parts.length - 1] !== 'verify') {
          targetId = parts[parts.length - 1];
        }
      } catch {}
    }

    // Case C: Standard Credential ID verification
    try {
      setIsVerifying(true);
      setVerifyResult(null);
      const res = await credentialsApi.verifyCredential(targetId);
      setVerifyResult(res.data);
      setCredentialId(targetId);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Chứng chỉ không hợp lệ';
      setVerifyResult({
        status: 'INVALID',
        isValid: false,
        metadata: { credentialId: targetId },
        subjectData: {},
        blockchainProof: {},
        error: msg,
      });
    } finally {
      setIsVerifying(false);
    }
  }, [credentialId, handleVerifySelective]);

  // ── Auto-verify from URL Search Params ──
  useEffect(() => {
    const sdParam = searchParams.get('sd');
    const idParam = searchParams.get('id');
    if (sdParam) {
      const payload = parseSelectiveDisclosure(sdParam);
      if (payload) {
        handleVerifySelective(payload);
      } else {
        toast.error('Liên kết xác thực không hợp lệ');
      }
    } else if (idParam) {
      setCredentialId(idParam);
      handleVerify(idParam);
    }
  }, [searchParams, handleVerifySelective, handleVerify]);

  // ── QR Camera ──
  const startScanner = useCallback(async () => {
    // Check MediaDevices support upfront (especially for insecure HTTP contexts on mobile)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error('Trình duyệt không hỗ trợ mở camera trực tiếp (yêu cầu kết nối HTTPS hoặc localhost). Bạn có thể dùng tính năng Tải ảnh QR.');
      return;
    }

    setMode('scan');
    setVerifyResult(null);

    // Stop and clear any existing instance first
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }

    setTimeout(async () => {
      try {
        const qrElement = document.getElementById('qr-reader');
        if (!qrElement) return;

        const scanner = new Html5Qrcode('qr-reader', {
          formatsToSupport: [0], // QR_CODE only: maximizes CPU efficiency & speed
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true, // Native mobile GPU/hardware acceleration
          },
        });
        scannerRef.current = scanner;

        // html5-qrcode strictly requires cameraIdOrConfig object to have EXACTLY 1 key:
        // { facingMode: 'environment' } or { facingMode: 'user' }
        const primaryFacingMode = mobile ? 'environment' : 'user';
        const scanConfig = {
          fps: 15, // 15 FPS: optimal balance between responsiveness and smooth battery consumption
        };

        const handleSuccess = (decoded) => {
          if (decoded) {
            setCredentialId(decoded);
            stopScanner(scanner);
            handleVerify(decoded);
          }
        };

        try {
          await scanner.start(
            { facingMode: primaryFacingMode },
            scanConfig,
            handleSuccess,
            () => {} // silent on continuous frame non-match
          );
        } catch (firstErr) {
          console.warn('[Camera] Primary facingMode failed, falling back:', firstErr);
          // If environment camera failed or device has only 1 camera, fallback to user camera
          await scanner.start(
            { facingMode: 'user' },
            scanConfig,
            handleSuccess,
            () => {}
          );
        }
      } catch (err) {
        console.error('Camera start error:', err);
        setMode('idle');
        const errStr = String(err?.message || err || '');
        if (errStr.includes('Permission') || errStr.includes('NotAllowedError') || errStr.includes('denied')) {
          toast.error('Quyền truy cập camera bị từ chối. Vui lòng cho phép quyền camera trong cài đặt trình duyệt.');
        } else if (errStr.includes('NotFound') || errStr.includes('DevicesNotFoundError')) {
          toast.error('Không tìm thấy thiết bị camera.');
        } else if (errStr.includes('NotReadableError') || errStr.includes('TrackStartError')) {
          toast.error('Camera đang bị ứng dụng khác sử dụng.');
        } else {
          toast.error('Không thể mở camera: ' + (errStr || 'Vui lòng kiểm tra quyền thiết bị'));
        }
      }
    }, 250);
  }, [mobile, handleVerify]);

  const stopScanner = useCallback((instance = scannerRef.current) => {
    const target = instance || scannerRef.current;
    if (target) {
      target.stop().then(() => {
        try { target.clear(); } catch {}
        scannerRef.current = null;
        setMode('idle');
      }).catch(() => {
        try { target.clear(); } catch {}
        scannerRef.current = null;
        setMode('idle');
      });
    } else {
      setMode('idle');
    }
  }, []);

  // ── QR from file ──
  const handleFileQR = useCallback(async (file) => {
    setIsReadingQR(true);
    try {
      const decoded = await scanQRFromImage(file);
      if (!decoded) {
        throw new Error('Không tìm thấy mã QR trong ảnh');
      }
      setCredentialId(decoded);
      setMode('idle');
      handleVerify(decoded);
    } catch (err) {
      console.warn('QR image scan failed:', err);
      toast.error('Không thể đọc mã QR từ ảnh. Vui lòng căn chỉnh lại góc chụp hoặc độ nét.');
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
            Nhập Credential ID, quét mã QR bằng camera hoặc tải ảnh lên để kiểm tra tính hợp lệ trên Blockchain.
          </p>
        </div>
      </div>

      {/* ── Input Card ── */}
      {!verifyResult && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">

          {/* Camera scanner view */}
          {mode === 'scan' && (
            <div className="p-5 md:p-7 flex flex-col items-center gap-5">
              <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
                {/* Scanning animation overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_2s_linear_infinite]" />
                  {/* Corner brackets */}
                  {[['top-3 left-3', 'border-t-2 border-l-2'], ['top-3 right-3', 'border-t-2 border-r-2'],
                  ['bottom-3 left-3', 'border-b-2 border-l-2'], ['bottom-3 right-3', 'border-b-2 border-r-2']]
                    .map(([pos, bdr]) => (
                      <div key={pos} className={`absolute ${pos} w-7 h-7 ${bdr} border-primary rounded-sm`} />
                    ))}
                </div>
                <div id="qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-primary/40 shadow-inner bg-black" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <Camera size={14} className="inline mr-1.5 text-primary" />
                  {mobile ? 'Camera sau đang hoạt động' : 'Webcam đang hoạt động'}
                </p>
                <p className="text-xs text-gray-500">Giữ máy ổn định, hướng camera vào mã QR</p>
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
                      {mobile ? 'Camera sau trên điện thoại' : 'Webcam máy tính'}
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
                    <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP chứa mã QR</p>
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
