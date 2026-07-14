import { notFound } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";
import { CALENDAR_YEARS } from "@/lib/constants";

export function generateStaticParams() {
  return CALENDAR_YEARS.map((year) => ({ year: String(year) }));
}

export default async function TakwimYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);
  if (!CALENDAR_YEARS.includes(year as (typeof CALENDAR_YEARS)[number])) {
    notFound();
  }

  return <CalendarView year={year} />;
}
