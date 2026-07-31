import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import { Award, X, Loader2, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';
import CopyBtn from './CopyBtn';

export default function DetailSidebar({ cred, onClose }) {
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
              className={`flex-1 py-3 text-xs font-semibold transition-colors whitespace-nowrap px-1 ${tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
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
