export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Play</h1>
      <p className="mt-2 text-sm text-neutral-600">Story id: {id}</p>
      <p className="mt-2 text-sm text-neutral-600">
        Placeholder for migrated Player content.
      </p>
    </main>
  );
}
