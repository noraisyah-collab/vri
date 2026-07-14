import Link from "next/link";

const CARDS = [
  {
    href: "/takwim/2026",
    title: "Takwim 2026",
    desc: "Cuti umum & acara pejabat tahun 2026",
    className: "bg-vri-blue",
  },
  {
    href: "/takwim/2027",
    title: "Takwim 2027",
    desc: "Cuti umum & acara pejabat tahun 2027",
    className: "bg-vri-purple",
  },
  {
    href: "/tempahan",
    title: "Tempahan Bilik",
    desc: "Tempah Bilik Seminar Patologi, APDRTC & Mesyuarat MOFY",
    className: "bg-vri-terracotta",
  },
];

export default function HomePage() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {CARDS.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className={`${card.className} rounded-xl p-6 text-white shadow-sm transition hover:opacity-90`}
        >
          <h2 className="text-xl font-semibold">{card.title}</h2>
          <p className="mt-2 text-sm text-white/90">{card.desc}</p>
        </Link>
      ))}
    </div>
  );
}
