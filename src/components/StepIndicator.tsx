type Step = { key: string; label: string };

const steps: Step[] = [
  { key: "entity", label: "Create entity" },
  { key: "kyc", label: "Identity (KYC)" },
  { key: "account", label: "Link wallet" },
];

export function StepIndicator({ current }: { current: string }) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-3 text-sm">
      {steps.map((s, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        const color = isCurrent
          ? "var(--color-gold-400)"
          : isDone
            ? "var(--color-paper-50)"
            : "var(--color-ink-500)";
        return (
          <li key={s.key} className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs"
              style={{ borderColor: color, color }}
            >
              {i + 1}
            </span>
            <span style={{ color }}>{s.label}</span>
            {i < steps.length - 1 && (
              <span
                className="w-8 h-px"
                style={{ background: "var(--color-ink-600)" }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
