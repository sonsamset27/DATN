import { Loader2 } from 'lucide-react';

export default function StatCard({ gradient, icon: Icon, label, value, sub, loading }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} text-white shadow-lg`}>
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
      <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">{label}</p>
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 shrink-0" />
            <p className="text-2xl font-bold truncate">{value}</p>
          </div>
          {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
}
