export function SpoonTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="spoon-tip" role="note">
      <span className="spoon-tip-label">Spoon-fed</span>
      <p>{children}</p>
    </div>
  );
}
