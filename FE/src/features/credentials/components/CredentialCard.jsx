import { Calendar, ChevronRight, Award } from 'lucide-react';
import StatusBadge from './StatusBadge';

const GRADIENTS = [
  'from-violet-600 to-indigo-600',
  'from-blue-600 to-cyan-500',
  'from-emerald-600 to-teal-500',
  'from-rose-600 to-pink-500',
  'from-amber-600 to-orange-500',
  'from-slate-700 to-slate-900',
];

export default function CredentialCard({ cred, index, onClick }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div
      onClick={() => onClick(cred)}
      className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Gradient front face */}
      <div className={`bg-gradient-to-br ${gradient} p-6 pt-7 pb-10 text-white`}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10" />

        <div className="relative">
          {/* Status + Icon row */}
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
              <Award size={24} className="text-white" />
            </div>
            <StatusBadge status={cred.status} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold leading-tight line-clamp-2 mb-6">
            {cred.templateName || 'Chứng chỉ số'}
          </h3>

          {/* Info row */}
          <div className="flex items-center justify-between text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(cred.issuedAt).toLocaleDateString('vi-VN')}
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] bg-white/20 px-2 py-1 rounded-full">
              {cred.credentialId?.slice(0, 18)}…
            </span>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-white dark:bg-gray-800 px-6 py-3 flex justify-between items-center border-t border-black/5 dark:border-white/5">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[60%] font-mono">
          {cred.issuerDid?.slice(0, 30)}…
        </span>
        <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}
