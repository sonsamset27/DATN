import {
  Activity, ShieldAlert, UserPlus, Fingerprint, FileText,
  Award, RotateCcw, Shield, LogIn
} from 'lucide-react';

export const ACTION_CONFIG = {
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

export function getActionCfg(action = '') {
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
