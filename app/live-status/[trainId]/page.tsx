import LiveClient from "./LiveClient";

export const dynamic = 'force-dynamic';

export default async function LiveStatusPage({ params }: { params: Promise<{ trainId: string }> }) {
  const { trainId } = await params;
  return <LiveClient trainId={trainId} />;
}
