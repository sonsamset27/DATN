import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MerkleUtil } from '../../../lib/merkle.util';
import toast from 'react-hot-toast';
import {
  ShieldCheck, Eye, X, Copy, Check, Share2, Lock,
  Sparkles, CheckCircle2, ArrowRight, ExternalLink
} from 'lucide-react';

export default function SelectiveDisclosureModal({ cred, detail, onClose }) {
  const subjectData = detail?.subjectData || {};
  const salts = detail?.salts || {};
  const fieldKeys = useMemo(() => Object.keys(subjectData), [detail?.subjectData]);

  // Default: reveal all fields initially, user can uncheck sensitive ones
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(fieldKeys));
  const [generatedPackage, setGeneratedPackage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('select'); // 'select' | 'share'

  const toggleKey = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size <= 1) {
          toast.error('Phải hiển thị ít nhất một trường thông tin!');
          return prev;
        }
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedKeys(new Set(fieldKeys));
  const selectMinimal = () => {
    // Select only common name / major / degree fields if available
    const priority = ['name', 'studentName', 'fullName', 'degree', 'major', 'chuyenNganh', 'hoTen'];
    const chosen = fieldKeys.filter(k => priority.some(p => k.toLowerCase().includes(p.toLowerCase())));
    if (chosen.length > 0) {
      setSelectedKeys(new Set(chosen));
    } else if (fieldKeys.length > 0) {
      setSelectedKeys(new Set([fieldKeys[0]]));
    }
  };

  const handleGenerate = () => {
    try {
      const revealedKeys = Array.from(selectedKeys);
      // Generate package using MerkleUtil
      const sdPackage = MerkleUtil.generateSelectiveDisclosure(subjectData, salts, revealedKeys);
      
      const fullPayload = {
        credentialId: cred.credentialId,
        templateName: cred.templateName || detail?.templateName || 'Chứng chỉ số',
        issuerDid: cred.issuerDid,
        holderDid: detail?.metadata?.holderDid || cred.holderDid,
        issuedAt: cred.issuedAt,
        revealed: sdPackage.revealed,
        salts: sdPackage.salts,
        hidden: sdPackage.hidden,
        merkleRoot: sdPackage.merkleRoot,
      };

      setGeneratedPackage(fullPayload);
      setActiveTab('share');
      toast.success('Đã tạo liên kết chia sẻ thành công!');
    } catch (err) {
      toast.error('Không thể tạo liên kết chia sẻ: ' + err.message);
    }
  };

  const shareUrl = useMemo(() => {
    if (!generatedPackage) return '';
    const jsonStr = JSON.stringify(generatedPackage);
    // Base64 encode safe for URL
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return `${window.location.origin}/verify?sd=${encodeURIComponent(b64)}`;
  }, [generatedPackage]);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Đã sao chép liên kết!');
    setTimeout(() => setCopied(false), 2500);
  };

  const isMerkleCredential = Boolean(detail?.merkleRoot && detail?.salts && Object.keys(detail.salts).length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,25,0.75)', backdropFilter: 'blur(12px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-violet-100 dark:border-violet-900/40">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shadow-inner shrink-0">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold tracking-wide mb-1">
                <ShieldCheck size={12} /> Chia sẻ có chọn lọc
              </div>
              <h2 className="font-bold text-lg leading-tight">Tùy chọn chia sẻ chứng chỉ</h2>
            </div>
          </div>
          <p className="text-white/80 text-xs mt-2 leading-relaxed">
            Chọn các thông tin bạn muốn hiển thị hoặc ẩn đi. Người nhận vẫn đối soát được nguồn gốc chứng chỉ qua Merkle Tree trên blockchain.
          </p>
        </div>

        {!isMerkleCredential ? (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                <Lock size={16} />
              </div>
              <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Chứng chỉ thuộc đợt cấp trước
                </p>
                <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                  Mã xác thực của chứng chỉ này đã được lưu cố định trên blockchain từ trước, nên không thể bóc tách từng mục để ẩn riêng lẻ.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                Về tính tương thích của chứng chỉ
              </h4>
              <ul className="space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Chứng chỉ vẫn có hiệu lực bình thường:</strong> Bạn có thể sử dụng mã QR gốc để chia sẻ và xác minh đầy đủ nội dung.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Nguyên lý bảo mật:</strong> Dữ liệu đã ghi nhận trên blockchain không thể chỉnh sửa, nên chứng chỉ cũ không thể tạo mã nhánh cho từng mục riêng lẻ.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Để dùng tính năng này:</strong> Bạn có thể yêu cầu hoặc thực hiện cấp chứng chỉ mới trên hệ thống để được áp dụng Merkle Tree tự động.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors"
              >
                Đã hiểu và quay lại
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Controls */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
              <button
                onClick={() => setActiveTab('select')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'select'
                    ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 bg-white dark:bg-gray-900'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                1. Chọn thông tin hiển thị
              </button>
              <button
                onClick={() => { if (generatedPackage) setActiveTab('share'); else handleGenerate(); }}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'share'
                    ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 bg-white dark:bg-gray-900'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                2. Liên kết và mã QR
              </button>
            </div>

            {/* Body Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {activeTab === 'select' && (
            <>
              {/* Quick actions */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Chọn dữ liệu chia sẻ:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={selectMinimal}
                    className="text-xs px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 font-medium transition-colors"
                  >
                    Chỉ tên & ngành
                  </button>
                </div>
              </div>

              {/* Field Checkbox List */}
              <div className="space-y-2.5">
                {fieldKeys.map((key) => {
                  const isChecked = selectedKeys.has(key);
                  const val = subjectData[key];
                  return (
                    <div
                      key={key}
                      onClick={() => toggleKey(key)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-violet-500/80 bg-violet-50/40 dark:bg-violet-950/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                            {key}
                          </p>
                          <p className={`text-xs truncate ${isChecked ? 'text-violet-700 dark:text-violet-300 font-medium' : 'text-gray-400 line-through'}`}>
                            {String(val)}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold">
                        {isChecked ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Eye size={14} /> Hiển thị
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Lock size={14} /> Đã ẩn
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Privacy Notice Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
                <Lock size={16} className="text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Các thông tin không được chọn sẽ được ẩn đi. Người nhận chỉ có thể xác thực tính toàn vẹn qua Merkle Tree mà không xem được nội dung chi tiết của các mục này.
                </div>
              </div>
            </>
          )}

          {activeTab === 'share' && generatedPackage && (
            <div className="space-y-6 text-center">
              {/* QR display */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg inline-block mx-auto">
                <div className="bg-white p-3 rounded-2xl shadow-inner">
                  <QRCodeSVG
                    value={shareUrl}
                    size={210}
                    bgColor="#ffffff"
                    fgColor="#1e1b4b"
                    level="M"
                  />
                </div>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-500" /> Quét mã để xác thực chứng chỉ
                </p>
              </div>

              {/* Summary of Disclosure */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Thông tin hiển thị • {Object.keys(generatedPackage.revealed).length} mục
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200 font-semibold mt-1">
                    {Object.keys(generatedPackage.revealed).join(', ')}
                  </p>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Thông tin đã ẩn • {Object.keys(generatedPackage.hidden).length} mục
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
                    {Object.keys(generatedPackage.hidden).join(', ') || 'Không có'}
                  </p>
                </div>
              </div>

              {/* Share link input with copy button */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Liên kết xác thực:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3.5 py-2.5 text-xs font-mono bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-600 dark:text-gray-300 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-violet-600/25"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              {/* Direct Open Link */}
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline"
              >
                Mở trang xác thực <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
          {activeTab === 'select' ? (
            <button
              onClick={handleGenerate}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition-all"
            >
              Tạo liên kết chia sẻ <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('select')}
                className="px-5 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl transition-colors"
              >
                Chỉnh sửa lại
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? 'Đã sao chép liên kết' : 'Sao chép liên kết chia sẻ'}
              </button>
            </>
          )}
        </div>
          </>
        )}

      </div>
    </div>
  );
}
