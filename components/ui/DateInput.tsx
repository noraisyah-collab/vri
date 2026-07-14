"use client";

function formatDDMMYYYY(value: string): string {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

export default function DateInput({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800">
        {formatDDMMYYYY(value) || "hh/bb/tttt"}
      </div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
