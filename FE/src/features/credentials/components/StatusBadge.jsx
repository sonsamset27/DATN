import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const cfg = {
    ACTIVE:  { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Hiệu lực' },
    REVOKED: { icon: XCircle,      cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Đã thu hồi' },
    EXPIRED: { icon: AlertTriangle,cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'Hết hạn' },
  };
  const { icon: Icon, cls, label } = cfg[status] || cfg.ACTIVE;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon size={11} /> {label}
    </span>
  );
}
