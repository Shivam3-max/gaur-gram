import { Bone, Churning } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="container-x pb-16 pt-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14 *:min-w-0">
        <div className="lg:mx-auto lg:w-[calc(min(620px,calc(100svh-230px))*0.8)] lg:max-w-full">
          <div className="arch skeleton relative mx-auto grid aspect-[1/1.02] max-h-[62vh] place-items-center sm:aspect-[4/5] sm:max-h-none">
            <Churning />
          </div>
          <div className="mt-3 flex gap-2">
            {[0, 1, 2, 3].map((i) => <Bone key={i} className="h-16 w-16 rounded-2xl" />)}
          </div>
        </div>
        <div>
          <Bone className="h-3 w-28 rounded-md" />
          <Bone className="mt-3 h-11 w-[85%] rounded-lg" />
          <Bone className="mt-2 h-6 w-32 rounded-md" />
          <Bone className="mt-5 h-4 w-40 rounded-md" />
          <Bone className="mt-6 h-4 w-full rounded-md" />
          <Bone className="mt-2 h-4 w-[92%] rounded-md" />
          <Bone className="mt-2 h-4 w-[70%] rounded-md" />
          <div className="mt-7 flex gap-2">
            {[0, 1, 2].map((i) => <Bone key={i} className="h-14 w-24 rounded-xl" />)}
          </div>
          <Bone className="mt-6 h-9 w-36 rounded-md" />
          <div className="mt-6 flex gap-3">
            <Bone className="h-14 flex-1 rounded-2xl" />
            <Bone className="h-14 flex-1 rounded-2xl" />
          </div>
          <Bone className="mt-6 h-28 w-full rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}
