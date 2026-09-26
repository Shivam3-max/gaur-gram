"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cx } from "@/lib/format";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
  loop?: boolean;
  onTime?: (t: number) => void;
};

/**
 * Muted inline video that plays only while on screen. The poster sits underneath as a real
 * image, so a still frame always shows on slow connections, in low-power mode or with reduced motion.
 */
const AutoVideo = forwardRef<HTMLVideoElement | null, Props>(function AutoVideo({ src, poster, className, label, loop = true, onTime }, fwd) {
  const ref = useRef<HTMLVideoElement>(null);
  useImperativeHandle(fwd, () => ref.current as HTMLVideoElement);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <div className={cx("absolute inset-0", className)}>
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        autoPlay
        playsInline
        loop={loop}
        preload="metadata"
        aria-label={label}
        onTimeUpdate={onTime ? (e) => onTime((e.target as HTMLVideoElement).currentTime) : undefined}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
});

export default AutoVideo;
