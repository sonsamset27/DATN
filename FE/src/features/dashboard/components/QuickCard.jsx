import { Link } from 'react-router-dom';

export default function QuickCard({ label, icon: Icon, color, href, action }) {
  const cls = "flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer";
  const inner = (
    <>
      <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </>
  );
  if (href) return <Link to={href} className={cls}>{inner}</Link>;
  return <button onClick={action} className={`${cls} w-full`}>{inner}</button>;
}
