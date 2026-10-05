export function SourceStatus({ status }: { status: 'verified' | 'license-verified' | 'pending' | 'unused' }) {
  const labels = {
    verified: 'موثّق',
    'license-verified': 'الترخيص موثّق',
    pending: 'قيد التحقق',
    unused: 'غير مستخدم داخل التطبيق',
  } as const;
  return <span className={`source-status source-status-${status}`}>{labels[status]}</span>;
}
