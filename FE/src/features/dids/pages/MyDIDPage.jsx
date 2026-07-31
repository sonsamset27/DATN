import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWriteContract, usePublicClient } from 'wagmi';
import { didsApi } from '../services/dids.api';
import { DID_REGISTRY_ADDRESS, DID_REGISTRY_ABI } from '../../../lib/contracts/DIDRegistry';
import toast from 'react-hot-toast';
import { Fingerprint, Loader2, KeyRound, ShieldCheck, Link as LinkIcon, AlertCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressStep from '../components/ProgressStep';

export default function MyDIDPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0); // 0: initial, 1: prepare, 2: signing, 3: blockchain_wait, 4: backend_register
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch DID status from Backend
  const { data: myDidData, isLoading } = useQuery({
    queryKey: ['my-did'],
    queryFn: didsApi.getMyDid,
    retry: false
  });

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const handleRegisterDID = async () => {
    try {
      setErrorMsg(null);
      setStep(1);

      // 1. Prepare data
      const prepareRes = await didsApi.prepareCreateDid();
      const { did, publicKey, algorithm } = prepareRes.data;

      // 2. Call Smart Contract
      setStep(2);
      const txHash = await writeContractAsync({
        address: DID_REGISTRY_ADDRESS,
        abi: DID_REGISTRY_ABI,
        functionName: 'registerDID',
        args: [did, publicKey, algorithm],
      });

      // 3. Wait for blockchain confirmation
      setStep(3);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status !== 'success') {
        throw new Error('Giao dịch thất bại trên Blockchain');
      }

      // 4. Register on BE
      setStep(4);
      await didsApi.registerDid(txHash);

      toast.success('Đăng ký DID thành công!', { id: 'did' });
      setStep(0);
      queryClient.invalidateQueries(['my-did']);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || 'Quá trình đăng ký thất bại');
      toast.error('Có lỗi xảy ra: ' + (err?.message || 'Transaction failed'), { id: 'did' });
      setStep(0);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  const hasDID = !!myDidData?.data;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Fingerprint size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Định danh Kỹ thuật số (DID)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Trung tâm quản lý danh tính phi tập trung của bạn
            </p>
          </div>
        </div>
      </div>

      {!hasDID ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden relative"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

          <div className="text-center max-w-2xl mx-auto space-y-8 relative z-10">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-gray-400 shadow-inner">
              <ShieldCheck size={48} className={step > 0 ? "text-primary animate-pulse" : ""} />
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Bạn chưa sở hữu DID</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                Decentralized Identifier (DID) là tấm thẻ căn cước số của bạn trên không gian Web3.
                Nó cho phép bạn sở hữu, lưu trữ và xác minh các chứng chỉ một cách an toàn và riêng tư tuyệt đối.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/50">
                <AlertCircle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 0 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegisterDID}
                className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-3 mx-auto text-lg cursor-pointer"
              >
                <Fingerprint size={24} />
                Khởi tạo DID ngay
              </motion.button>
            ) : (
              <div className="space-y-6 max-w-md mx-auto text-left">
                <div className="text-center font-semibold text-lg text-primary mb-6">Đang xử lý khởi tạo DID...</div>

                <ProgressStep
                  isActive={step === 1}
                  isCompleted={step > 1}
                  title="Chuẩn bị dữ liệu"
                  description="Khởi tạo thông tin định danh từ hệ thống"
                />
                <ProgressStep
                  isActive={step === 2}
                  isCompleted={step > 2}
                  title="Ký xác nhận trên Ví"
                  description="Mở ví Metamask và xác nhận giao dịch"
                />
                <ProgressStep
                  isActive={step === 3}
                  isCompleted={step > 3}
                  title="Chờ Blockchain xác nhận"
                  description="Giao dịch đang được lưu vào mạng lưới (có thể mất vài giây đến vài phút)"
                />
                <ProgressStep
                  isActive={step === 4}
                  isCompleted={step > 4}
                  title="Đồng bộ hệ thống"
                  description="Đang cập nhật trạng thái định danh của bạn"
                />
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          {/* ID Card section */}
          <div>
            <div className="bg-white dark:bg-[#151522] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300 group">
              {/* Subtle background decoration */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Shiny effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%] pointer-events-none"></div>

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="font-semibold text-xl tracking-wide text-gray-900 dark:text-white">Web3 Identity</span>
                </div>
                <div className="w-fit px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold border border-green-200/60 dark:border-green-500/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></span>
                  ACTIVE
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Decentralized Identifier</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 group/item hover:border-primary/30 transition-colors">
                    <Fingerprint className="text-primary/70 shrink-0 hidden sm:block" size={20} />
                    <p className="font-mono text-xs sm:text-sm break-all text-gray-700 dark:text-gray-300">{myDidData.data.did}</p>
                    <button onClick={() => copyToClipboard(myDidData.data.did, "DID")} className="p-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-lg transition-colors text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary shrink-0 cursor-pointer self-end sm:self-auto">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Public Key / Address</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 group/item hover:border-primary/30 transition-colors">
                    <KeyRound className="text-primary/70 shrink-0 hidden sm:block" size={20} />
                    <p className="font-mono text-xs sm:text-sm break-all text-gray-700 dark:text-gray-300">{myDidData.data.publicKey}</p>
                    <button onClick={() => copyToClipboard(myDidData.data.publicKey, "Public Key")} className="p-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-lg transition-colors text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary shrink-0 cursor-pointer self-end sm:self-auto">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Network watermark */}
              <div className="absolute bottom-4 right-4 text-gray-100 dark:text-gray-800/40 flex items-center gap-1 font-bold text-4xl select-none pointer-events-none">
                <LinkIcon size={40} /> ETH
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
