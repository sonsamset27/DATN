import { Hash, User, Building2, Tag, FileText, Shield, Activity, Fingerprint } from 'lucide-react';

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

export default function MetadataBlock({ metadata }) {
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
