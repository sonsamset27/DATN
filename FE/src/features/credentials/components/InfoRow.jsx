import CopyBtn from './CopyBtn';

export default function InfoRow({ icon: Icon, label, value, mono = false, copyable = false }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-0.5">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm break-all leading-relaxed ${mono ? 'font-mono text-gray-600 dark:text-gray-300 text-xs' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
            {value}
          </span>
          {copyable && value && <CopyBtn text={value} />}
        </div>
      </div>
    </div>
  );
}
