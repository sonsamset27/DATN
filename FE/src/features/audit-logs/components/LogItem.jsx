import { useState } from 'react';
import { Clock, User } from 'lucide-react';
import { getActionCfg } from '../constants';
import MetadataBlock from './MetadataBlock';

export default function LogItem({ log, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = getActionCfg(log.action);
  const Icon = cfg.icon;
  const hasMetadata = log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0;

  const fmtDate = (v) => {
    try {
      const d = new Date(v);
      return {
        date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch { return { date: '—', time: '—' }; }
  };

  const { date, time } = fmtDate(log.timestamp);

  return (
    <div className="flex gap-3 group">
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-gray-800 ${cfg.dot} bg-opacity-20`}
          style={{ background: 'white' }}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${cfg.dot}`}>
            <Icon size={10} className="text-white" />
          </div>
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 dark:bg-gray-700 mt-1" />}
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all group-hover:shadow-md group-hover:border-gray-200 dark:group-hover:border-gray-600 ${hasMetadata ? 'cursor-pointer' : ''}`}
        onClick={() => hasMetadata && setExpanded(e => !e)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-3.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${cfg.color}`}>
              {log.action}
            </span>
            <span className="text-xs text-gray-500 font-medium hidden sm:block">{cfg.label}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1 justify-end">
              <Clock size={10} className="text-gray-400" />
              {time}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>

        {/* Actor */}
        <div className="px-3.5 pb-3">
          <div className="flex items-center gap-2">
            <User size={12} className="text-gray-400 shrink-0" />
            <span className="text-[11px] text-gray-400">Actor:</span>
            <span className="font-mono text-[11px] text-gray-600 dark:text-gray-300 break-all truncate">
              {log.actorDid || '—'}
            </span>
          </div>
        </div>

        {/* Metadata (expandable) */}
        {hasMetadata && (
          <div className="px-3.5 pb-3.5">
            {expanded ? (
              <MetadataBlock metadata={log.metadata} action={log.action} />
            ) : (
              <button className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1">
                Xem chi tiết...
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
