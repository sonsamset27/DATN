import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../services/audit-logs.api';
import {
  Activity, ShieldAlert, Key, UserPlus, Fingerprint, FileText,
  Search, X, Award, Clock, ChevronLeft, ChevronRight,
  Hash, User, Building2, Tag, RotateCcw, Shield, LogIn, Loader2
} from 'lucide-react';

// ─── Action Config ─────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  ISSUE_CREDENTIAL: {
    label: 'Cấp chứng chỉ',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    icon: Award,
    iconColor: 'text-emerald-500',
  },
  REVOKE_CREDENTIAL: {
    label: 'Thu hồi chứng chỉ',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
    icon: ShieldAlert,
    iconColor: 'text-red-500',
  },
  VERIFY_CREDENTIAL: {
    label: 'Xác minh chứng chỉ',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
    icon: Shield,
    iconColor: 'text-blue-500',
  },
  REGISTER_DID: {
    label: 'Đăng ký DID',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    dot: 'bg-purple-500',
    icon: Fingerprint,
    iconColor: 'text-purple-500',
  },
  LOGIN: {
    label: 'Đăng nhập',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    dot: 'bg-sky-500',
    icon: LogIn,
    iconColor: 'text-sky-500',
  },
  PROMOTE_USER: {
    label: 'Nâng quyền',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
    icon: UserPlus,
    iconColor: 'text-amber-500',
  },
  DEMOTE_USER: {
    label: 'Hạ quyền',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    dot: 'bg-orange-500',
    icon: UserPlus,
    iconColor: 'text-orange-500',
  },
  REISSUE_CREDENTIAL: {
    label: 'Cấp lại chứng chỉ',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    dot: 'bg-teal-500',
    icon: RotateCcw,
    iconColor: 'text-teal-500',
  },
  TEMPLATE_CREATE: {
    label: 'Tạo mẫu chứng chỉ',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    dot: 'bg-indigo-500',
    icon: FileText,
    iconColor: 'text-indigo-500',
  },
  TEMPLATE_UPDATE: {
    label: 'Cập nhật mẫu',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    dot: 'bg-cyan-500',
    icon: FileText,
    iconColor: 'text-cyan-500',
  },
  TEMPLATE_DELETE: {
    label: 'Xóa mẫu chứng chỉ',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    dot: 'bg-rose-500',
    icon: FileText,
    iconColor: 'text-rose-500',
  },
};

function getActionCfg(action = '') {
  // Try exact match first
  if (ACTION_CONFIG[action]) return ACTION_CONFIG[action];
  // Fuzzy match
  for (const [key, cfg] of Object.entries(ACTION_CONFIG)) {
    if (action.includes(key) || key.includes(action)) return cfg;
  }
  // Partial keyword match
  if (action.includes('ISSUE') && !action.includes('RE')) return ACTION_CONFIG.ISSUE_CREDENTIAL;
  if (action.includes('REVOKE')) return ACTION_CONFIG.REVOKE_CREDENTIAL;
  if (action.includes('VERIFY')) return ACTION_CONFIG.VERIFY_CREDENTIAL;
  if (action.includes('LOGIN')) return ACTION_CONFIG.LOGIN;
  if (action.includes('DID')) return ACTION_CONFIG.REGISTER_DID;
  if (action.includes('PROMOTE')) return ACTION_CONFIG.PROMOTE_USER;
  if (action.includes('DEMOTE')) return ACTION_CONFIG.DEMOTE_USER;
  if (action.includes('REISSUE') || action.includes('RE_ISSUE')) return ACTION_CONFIG.REISSUE_CREDENTIAL;
  if (action.includes('CREATE') && action.includes('TEMPLATE')) return ACTION_CONFIG.TEMPLATE_CREATE;
  if (action.includes('UPDATE') && action.includes('TEMPLATE')) return ACTION_CONFIG.TEMPLATE_UPDATE;
  if (action.includes('DELETE') && action.includes('TEMPLATE')) return ACTION_CONFIG.TEMPLATE_DELETE;
  return {
    label: action,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    dot: 'bg-gray-400',
    icon: Activity,
    iconColor: 'text-gray-400',
  };
}

// ─── Metadata Renderer ──────────────────────────────────────────────────────────
function MetadataRow({ icon: Icon, label, value, mono = false }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon size={12} className="text-gray-400 mt-0.5 shrink-0" />
      <span className="text-[11px] text-gray-400 shrink-0 w-20">{label}:</span>
      <span className={`text-[11px] break-all leading-relaxed ${mono ? 'font-mono text-gray-600 dark:text-gray-300' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
        {value}
      </span>
    </div>
  );
}

function MetadataBlock({ metadata, action }) {
  if (!metadata || typeof metadata !== 'object') return null;
  const entries = Object.entries(metadata);
  if (entries.length === 0) return null;

  // Map metadata keys to human-readable labels
  const labelMap = {
    credentialId:   { label: 'Credential ID', mono: true,  icon: Hash },
    holderDid:      { label: 'Holder DID',    mono: true,  icon: User },
    issuerDid:      { label: 'Issuer DID',    mono: true,  icon: Building2 },
    templateId:     { label: 'Template ID',   mono: true,  icon: Tag },
    templateName:   { label: 'Tên mẫu',       mono: false, icon: FileText },
    oldWalletAddress: { label: 'Ví cũ',       mono: true,  icon: Hash },
    newWalletAddress: { label: 'Ví mới',       mono: true,  icon: Hash },
    targetUserId:   { label: 'User ID',        mono: true,  icon: User },
    targetUserDid:  { label: 'Target DID',     mono: true,  icon: User },
    role:           { label: 'Vai trò',        mono: false, icon: Shield },
    ip:             { label: 'IP',             mono: true,  icon: Activity },
    userAgent:      { label: 'User Agent',     mono: false, icon: Activity },
    count:          { label: 'Số lượng',       mono: false, icon: Hash },
    did:            { label: 'DID',            mono: true,  icon: Fingerprint },
    walletAddress:  { label: 'Địa chỉ ví',     mono: true,  icon: Hash },
    txHash:         { label: 'TX Hash',        mono: true,  icon: Hash },
    reason:         { label: 'Lý do',          mono: false, icon: FileText },
  };

  return (
    <div className="mt-2 space-y-1 bg-gray-50 dark:bg-gray-900/60 rounded-lg px-3 py-2.5 border border-gray-100 dark:border-gray-700/60">
      {entries.map(([key, val]) => {
        if (val === null || val === undefined || val === '') return null;
        const cfg = labelMap[key];
        const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return (
          <MetadataRow
            key={key}
            icon={cfg?.icon || Tag}
            label={cfg?.label || key}
            value={displayVal}
            mono={cfg?.mono ?? false}
          />
        );
      })}
    </div>
  );
}

// ─── Log Item ───────────────────────────────────────────────────────────────────
function LogItem({ log, isLast }) {
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
                {Object.keys(log.metadata).length} trường chi tiết — nhấn để xem
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Action Filter Tabs ─────────────────────────────────────────────────────────
const FILTER_TABS = [
  { value: '',                 label: 'Tất cả' },
  { value: 'ISSUE',           label: 'Cấp chứng chỉ' },
  { value: 'REVOKE',          label: 'Thu hồi' },
  { value: 'VERIFY',          label: 'Xác minh' },
  { value: 'REGISTER_DID',   label: 'DID' },
  { value: 'TEMPLATE_CREATE', label: 'Tạo mẫu' },
  { value: 'TEMPLATE_UPDATE', label: 'Cập nhật mẫu' },
  { value: 'TEMPLATE_DELETE', label: 'Xóa mẫu' },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [actorDid, setActorDid] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actorDid, actionFilter],
    queryFn: () => auditLogsApi.getLogs({
      page,
      limit: 15,
      actorDid: actorDid || undefined,
      action: actionFilter || undefined,
    }),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setActorDid(searchInput.trim());
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput('');
    setActorDid('');
    setPage(1);
  };

  const handleFilterTab = (val) => {
    setActionFilter(val);
    setPage(1);
  };

  const logs = logsRes?.data || [];
  const total = logsRes?.total || 0;
  const totalPages = Math.ceil(total / 15) || 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="text-primary" /> Nhật ký hệ thống
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Lịch sử mọi hành động thay đổi trạng thái trong hệ thống.
          {total > 0 && <span className="ml-2 font-semibold text-foreground">{total} bản ghi</span>}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo Actor DID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium">
            Tìm
          </button>
          {actorDid && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Action Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleFilterTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                actionFilter === tab.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm text-gray-400">Đang tải nhật ký...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Activity size={44} className="mx-auto text-gray-200 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">
              {actorDid || actionFilter ? 'Không tìm thấy bản ghi nào phù hợp.' : 'Chưa có bản ghi nào.'}
            </p>
            {(actorDid || actionFilter) && (
              <button
                onClick={() => { handleClear(); setActionFilter(''); }}
                className="mt-3 text-xs text-primary hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="pl-0">
            {logs.map((log, idx) => (
              <LogItem key={log._id} log={log} isLast={idx === logs.length - 1} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Trang <span className="font-semibold text-foreground">{page}</span> / {totalPages} &nbsp;·&nbsp; Tổng {total} bản ghi
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <button
              disabled={page >= totalPages || logs.length < 15}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
