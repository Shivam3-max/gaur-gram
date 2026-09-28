import { Bone, CardBone, Churning } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="container-x pb-10 pt-6">
      <div className="grid gap-6 lg:grid-cols-[210px_1fr] lg:gap-10 *:min-w-0">
        <aside className="-mx-5 flex gap-2 overflow-hidden px-5 lg:mx-0 lg:flex-col lg:gap-2 lg:px-0">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bone key={i} className="h-12 w-32 shrink-0 rounded-2xl lg:h-[60px] lg:w-full" />
          ))}
        </aside>
        <section>
          <header className="flex items-end justify-between gap-6 border-b border-line pb-5">
            <div className="flex-1">
              <Bone className="h-3 w-14 rounded-md" />
              <Bone className="mt-2 h-10 w-[min(320px,80%)] rounded-lg sm:h-12" />
              <Bone className="mt-3 h-4 w-[min(460px,90%)] rounded-md" />
              <div className="mt-5 flex gap-2">
                {[0, 1, 2].map((i) => <Bone key={i} className="h-8 w-28 rounded-full" />)}
              </div>
            </div>
            <Churning scene="carry" text="" className="shrink-0" />
          </header>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => <CardBone key={i} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
