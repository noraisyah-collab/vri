"use client";

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "terracotta";
}) {
  const base = "rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const variants: Record<string, string> = {
    primary: "bg-vri-blue text-white hover:opacity-90",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    terracotta: "bg-vri-terracotta text-white hover:opacity-90",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
