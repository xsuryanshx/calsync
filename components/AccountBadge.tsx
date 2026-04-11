export function AccountBadge({ email, color }: { email: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-full border border-slate-200 text-xs">
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono text-slate-700">{email}</span>
    </div>
  );
}
