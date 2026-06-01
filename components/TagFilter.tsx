"use client";

export type TagFilterValue = "all" | "personal" | "work";

interface Props {
  value: TagFilterValue;
  onChange: (v: TagFilterValue) => void;
}

const OPTIONS: { value: TagFilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "personal", label: "개인" },
  { value: "work", label: "업무" },
];

export function TagFilter({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border border-neutral-300 bg-white p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            "rounded px-3 py-1 text-sm transition " +
            (value === opt.value
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
