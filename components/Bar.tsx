export function Bar({
  value,
  total,
  className = "",
  height = 6,
}: {
  value: number;
  total: number;
  className?: string;
  height?: number;
}) {
  const p = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div
      className={`bar ${className}`}
      style={{ height }}
      data-full={p === 100}
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${value} de ${total} concluídos`}
    >
      <span style={{ width: `${p}%` }} />
    </div>
  );
}
