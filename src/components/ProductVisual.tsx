import PackShot from "./PackShot";
import { cx } from "@/lib/format";

type Props = {
  pack: string;
  liquid: string;
  label: string;
  labelTitle: string;
  sub?: string;
  image?: string | null;
  name: string;
  className?: string;
  sizes?: string;
};

/** Uploaded photo when present, otherwise the illustrated pack shot. */
export default function ProductVisual({ pack, liquid, label, labelTitle, sub, image, name, className }: Props) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name} className={cx("h-full w-full object-cover", className)} loading="lazy" />;
  }
  return <PackShot pack={pack} liquid={liquid} label={label} title={labelTitle} sub={sub} className={cx("h-full w-full", className)} />;
}
