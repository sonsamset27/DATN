import { useState, useRef } from 'react';
import { credentialsApi } from '../services/credentials.api';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { ShieldCheck, ScanLine, XCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function VerifyCredentialPage() {
  const [credentialId, setCredentialId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Tham chiếu đến scanner instance để stop khi cần
  const scannerRef = useRef(null);

  const startScanner = async () => {
    try {
      setScanning(true);
      setVerifyResult(null);
      // Wait cho UI render div 'reader'
      setTimeout(() => {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Khi quét thành công
            setCredentialId(decodedText);
            stopScanner(scanner);
            handleVerify(decodedText); // Tự động verify luôn
          },
          (errorMessage) => {
            // Bỏ qua lỗi quét mỗi frame
          }
        ).catch(err => {
          setScanning(false);
          toast.error("Không thể mở camera: " + err.message);
        });
      }, 100);
    } catch (error) {
      toast.error('Lỗi khi khởi tạo camera');
    }
  };

  const stopScanner = (scannerInstance = scannerRef.current) => {
    if (scannerInstance) {
      scannerInstance.stop().then(() => {
        setScanning(false);
      }).catch(err => console.error(err));
    }
  };

  const handleVerify = async (idToVerify = credentialId) => {
    if (!idToVerify) return toast.error('Vui lòng nhập Credential ID');
    try {
      setIsVerifying(true);
      setVerifyResult(null);
      const res = await credentialsApi.verifyCredential(idToVerify);
      setVerifyResult(res.data);
      toast.success('Xác minh hoàn tất');
    } catch (err) {
      // Interceptor đã hiện toast
      setVerifyResult({ status: 'INVALID', error: err?.message || 'Chứng chỉ không hợp lệ' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Xác minh Chứng chỉ</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Nhập mã ID hoặc quét mã QR để kiểm tra tính hợp lệ và toàn vẹn của chứng chỉ số trên Blockchain.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8">
        {!scanning ? (
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text"
              value={credentialId}
              onChange={e => setCredentialId(e.target.value)}
              placeholder="Nhập ID chứng chỉ (VD: DID-1234...)"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all text-lg"
            />
            <button 
              onClick={() => handleVerify(credentialId)}
              disabled={isVerifying || !credentialId}
              className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isVerifying ? 'Đang xác minh...' : 'Xác minh'}
            </button>
            <button 
              onClick={startScanner}
              className="px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <ScanLine size={20} /> Quét QR
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div id="reader" className="w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-primary"></div>
            <button 
              onClick={() => stopScanner()}
              className="px-6 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 flex items-center gap-2"
            >
              <XCircle size={20} /> Hủy quét
            </button>
          </div>
        )}
      </div>

      {/* Kết quả trả về */}
      {verifyResult && (
        <div className={`rounded-2xl border p-6 md:p-8 shadow-sm ${
          verifyResult.status === 'VERIFIED' || verifyResult.status === 'ACTIVE'
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-4">
            {verifyResult.status === 'VERIFIED' || verifyResult.status === 'ACTIVE' ? (
              <div className="p-3 bg-success rounded-full text-white shrink-0 shadow-lg shadow-success/30">
                <CheckCircle2 size={32} />
              </div>
            ) : (
              <div className="p-3 bg-danger rounded-full text-white shrink-0 shadow-lg shadow-danger/30">
                <ShieldAlert size={32} />
              </div>
            )}
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className={`text-2xl font-bold ${verifyResult.status === 'VERIFIED' || verifyResult.status === 'ACTIVE' ? 'text-success' : 'text-danger'}`}>
                  {verifyResult.status === 'VERIFIED' || verifyResult.status === 'ACTIVE' ? 'CHỨNG CHỈ HỢP LỆ' : 'CHỨNG CHỈ KHÔNG HỢP LỆ'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {verifyResult.status === 'VERIFIED' || verifyResult.status === 'ACTIVE' 
                    ? 'Dữ liệu toàn vẹn, khớp với bản ghi trên Blockchain.' 
                    : verifyResult.error || 'Dữ liệu đã bị thay đổi hoặc chứng chỉ bị thu hồi.'}
                </p>
              </div>

              {(verifyResult.status === 'VERIFIED' || verifyResult.status === 'ACTIVE') && verifyResult.subjectData && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="font-bold flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
                    <FileText size={18} className="text-primary"/> Thông tin chứng chỉ
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(verifyResult.subjectData).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <span className="text-gray-500 font-semibold block uppercase text-xs mb-1">{key}</span>
                        <span className="font-medium text-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
