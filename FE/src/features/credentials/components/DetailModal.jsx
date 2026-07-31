import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import { QRCodeSVG } from 'qrcode.react';
import { Award, Share2, ShieldCheck, ShieldX, X, ExternalLink, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import CopyBtn from './CopyBtn';

export default function DetailModal({ cred, onClose }) {
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
