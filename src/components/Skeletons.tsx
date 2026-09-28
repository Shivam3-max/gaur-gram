import Folk from "./folk/Folk";
import type { SceneKey } from "./folk/scenes";
import { cx } from "@/lib/format";

/** A placeholder block. Size it with className; hidden from assistive tech. */
export function Bone({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("skeleton rounded-xl", className)} />;
}

/** A small churning scene with a line of Hindi, announced politely to screen readers. */
export function Churning({ scene = "bilona", text = "ताज़ा ला रहे हैं…", className }: { scene?: SceneKey; text?: string; className?: string }) {
  return (
    <div role="status" className={cx("flex flex-col items-center gap-2", className)}>
      <Folk scene={scene} h="h-[64px] sm:h-[76px]" />
      {text && <span className="font-deva text-[14px] text-ghee-deep">{text}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Mirrors ProductCard so the grid does not jump when products arrive. */
export function CardBone() {
  return (
    <div aria-hidden="true" className="flex flex-col rounded-[20px] border border-line bg-white p-2.5">
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="flex flex-col gap-2 px-1 pb-1 pt-3">
        <Bone className="h-3 w-3/4 rounded-md" />
        <Bone className="h-4 w-full rounded-md" />
        <Bone className="h-3 w-1/3 rounded-md" />
        <div className="mt-3 flex items-end justify-between">
          <Bone className="h-5 w-14 rounded-md" />
          <Bone className="h-9 w-[72px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
