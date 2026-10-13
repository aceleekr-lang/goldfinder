import DayEditor from "@/components/admin/DayEditor";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <DayEditor date={date} />;
}
