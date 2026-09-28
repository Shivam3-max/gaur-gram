import { Bone, Churning } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="container-x pb-16 pt-8">
      <Bone className="h-3 w-24 rounded-md" />
      <Bone className="mt-3 h-10 w-[min(420px,80%)] rounded-lg sm:h-12" />
      <Bone className="mt-3 h-4 w-[min(560px,90%)] rounded-md" />
      <Churning className="py-14 sm:py-20" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <Bone key={i} className="h-40 rounded-[24px]" />)}
      </div>
    </div>
  );
}
