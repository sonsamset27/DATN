import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { didsApi } from '../services/dids.api';
import { DID_REGISTRY_ADDRESS, DID_REGISTRY_ABI } from '../../../lib/contracts/DIDRegistry';
import toast from 'react-hot-toast';
import { Fingerprint, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

export default function MyDIDPage() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Lấy trạng thái DID từ Backend
  const { data: myDidData, isLoading, error } = useQuery({
    queryKey: ['my-did'],
    queryFn: didsApi.getMyDid,
    retry: false
  });

  const { writeContractAsync } = useWriteContract();

  const handleRegisterDID = async () => {
    try {
      setIsProcessing(true);
      
      // 1. Prepare data
      toast.loading('Chuẩn bị dữ liệu...', { id: 'did' });
      const prepareRes = await didsApi.prepareCreateDid();
      const { did, publicKey, algorithm } = prepareRes.data;

      // 2. Gọi Smart Contract
      toast.loading('Vui lòng xác nhận trên ví...', { id: 'did' });
      const txHash = await writeContractAsync({
        address: DID_REGISTRY_ADDRESS,
        abi: DID_REGISTRY_ABI,
        functionName: 'registerDID',
        args: [did, publicKey, algorithm],
      });

      // 3. Đăng ký txHash lên BE
      toast.loading('Đang ghi nhận trên hệ thống...', { id: 'did' });
      await didsApi.registerDid(txHash);

      toast.success('Đăng ký DID thành công!', { id: 'did' });
      queryClient.invalidateQueries(['my-did']);
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra: ' + (err?.message || 'Transaction failed'), { id: 'did' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  // Nếu Backend trả 404 => Chưa có DID
  const hasDID = !!myDidData?.data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Fingerprint size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Định danh kỹ thuật số (DID)</h1>
          <p className="text-gray-500">Quản lý định danh cá nhân phi tập trung của bạn.</p>
        </div>
      </div>

      {!hasDID ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-400">
            <Fingerprint size={40} />
          </div>
          <h2 className="text-xl font-semibold">Bạn chưa có DID</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Decentralized Identifier (DID) là yếu tố cốt lõi để bạn sở hữu và xác minh các chứng chỉ số. Hãy đăng ký ngay!
          </p>
          <button
            onClick={handleRegisterDID}
            disabled={isProcessing}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mx-auto"
          >
            {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : 'Đăng ký DID trên Blockchain'}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-green-200 dark:border-green-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex items-center gap-1 text-xs font-medium text-success bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-100 dark:border-green-800">
              <CheckCircle2 size={14} /> ACTIVE
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-success" />
            Định danh đã được đăng ký
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Decentralized Identifier (DID)</p>
              <p className="font-mono text-sm break-all text-primary font-medium">{myDidData.data.did}</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1"><KeyRound size={12}/> Public Key (Address)</p>
              <p className="font-mono text-sm break-all">{myDidData.data.publicKey}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
