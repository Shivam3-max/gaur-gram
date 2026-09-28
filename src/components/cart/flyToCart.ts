"use client";

/** Small glass shapes that fly to the cart. Mirrors the pack shots: bottle, jar, kulhad, matka, oil, honey. */
function miniPack(pack: string, liquid: string) {
  const glass = `stroke="#1c1a15" stroke-opacity=".25" stroke-width="1.2"`;
  switch (pack) {
    case "bottle":
      return `<path d="M10 3h8v5c0 2 5 3 5 7v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V15c0-4 5-5 5-7z" fill="${liquid}" ${glass}/><rect x="9.5" y="1" width="9" height="4" rx="1" fill="#1c1a15"/>`;
    case "oil":
      return `<path d="M12 2h4v7c0 2 5 3 5 6v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V15c0-3 5-4 5-6z" fill="${liquid}" ${glass}/><rect x="11.5" y="0" width="5" height="4" rx="1" fill="#a0703f"/>`;
    case "kulhad":
    case "matka":
      return `<path d="M5 9h18l-3 18a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" fill="#b8683f"/><ellipse cx="14" cy="9" rx="9" ry="2.5" fill="${liquid}"/>`;
    default:
      return `<path d="M6 9h16v17a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="${liquid}" ${glass}/><rect x="5" y="4" width="18" height="6" rx="1.5" fill="#c9a24f"/>`;
  }
}

export function flyToCart(from: HTMLElement, liquid: string, pack: string) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Prefer the last visible target: on phones that is the sticky basket bar, nearer the thumb
  const target = [...document.querySelectorAll<HTMLElement>("[data-cart-target]")].reverse().find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
  });
  if (!target) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const sx = a.left + a.width / 2;
  const sy = a.top + a.height / 2;
  const dx = b.left + b.width / 2 - sx;
  const dy = b.top + b.height / 2 - sy;

  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;width:30px;height:32px;margin:-16px 0 0 -15px;z-index:100;pointer-events:none;filter:drop-shadow(0 6px 8px rgba(60,40,10,.3))`;
  el.innerHTML = `<svg viewBox="0 0 28 30" width="30" height="32">${miniPack(pack, liquid)}</svg>`;
  document.body.appendChild(el);

  const lift = Math.min(140, Math.abs(dy) * 0.5 + 60);
  const anim = el.animate(
    [
      { transform: "translate(0,0) scale(.6) rotate(0deg)", opacity: 0 },
      { transform: "translate(0,-10px) scale(1.15) rotate(-6deg)", opacity: 1, offset: 0.12 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - lift}px) scale(1) rotate(-14deg)`, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.35) rotate(10deg)`, opacity: 0.6 },
    ],
    { duration: 820, easing: "cubic-bezier(.45,0,.35,1)" },
  );
  anim.onfinish = () => {
    el.remove();
    target.animate([{ transform: "scale(1)" }, { transform: "scale(1.14)" }, { transform: "scale(.96)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
  };
}
