export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`text-paper-50 font-medium tracking-tight ${className}`}
      style={{ letterSpacing: "-0.02em" }}
    >
      dinari<span style={{ color: "var(--color-gold-400)" }}>.</span>sample
    </span>
  );
}
