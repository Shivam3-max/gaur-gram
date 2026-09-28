export default function Loading() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="skeleton h-9 w-56 rounded-lg" />
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div aria-hidden="true" className="overflow-hidden rounded-2xl border border-line bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
            <div className="skeleton h-4 w-24 rounded-md" />
            <div className="skeleton h-4 flex-1 rounded-md" />
            <div className="skeleton h-4 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
