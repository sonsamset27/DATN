import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import { QRCodeSVG } from 'qrcode.react';
import { Award, Share2, Calendar, ShieldCheck, FileKey, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyCredentialsPage() {
  const [shareModal, setShareModal] = useState({ open: false, credentialId: null, title: '' });
  
  const { data: credsRes, isLoading } = useQuery({
    queryKey: ['my-credentials'],
    queryFn: () => credentialsApi.getOwnCredentials({ limit: 50 })
  });

  const credentials = credsRes?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="text-primary" /> Chứng chỉ của tôi
        </h1>
        <p className="text-gray-500 mt-1">Danh sách các chứng chỉ số đã được cấp phát cho bạn.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Đang tải chứng chỉ...</div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <Award className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-gray-500">Bạn chưa có chứng chỉ nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {credentials.map(cred => (
            <div key={cred._id} className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group p-6">
              <div className="absolute top-0 right-0 p-4">
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
                  cred.status === 'ACTIVE' 
                    ? 'text-success bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' 
                    : 'text-danger bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
                }`}>
                  {cred.status}
                </span>
              </div>
              
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <FileKey size={24} />
              </div>

              <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
                {cred.templateId?.title || 'Chứng chỉ số'}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-1">{cred.issuerId?.organizationName || 'Tổ chức'}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                  <span className="font-semibold w-24">ID:</span>
                  <span className="truncate">{cred.credentialId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                  <span className="font-semibold w-24">Ngày cấp:</span>
                  <span>{new Date(cred.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShareModal({ open: true, credentialId: cred.credentialId, title: cred.templateId?.title })}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium transition-colors"
                >
                  <Share2 size={16} /> Chia sẻ QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl relative">
            <button 
              onClick={() => setShareModal({ open: false, credentialId: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-2">Quét mã QR</h2>
            <p className="text-sm text-gray-500 mb-8 line-clamp-2">{shareModal.title}</p>
            
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto">
              <QRCodeSVG 
                value={shareModal.credentialId}
                size={220}
                bgColor="#ffffff"
                fgColor="#000000"
                level="Q"
                includeMargin={false}
              />
            </div>
            
            <p className="text-xs text-gray-400 mt-8 break-all font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
              {shareModal.credentialId}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
