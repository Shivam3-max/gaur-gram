import Link from "next/link";
import { ShieldCheck, Recycle, FlaskConical, Sunrise } from "lucide-react";
import Logo from "../Logo";
import { Frieze } from "../folk/Folk";
import type { Settings } from "@/lib/settings";

const COLS = [
  { title: "Shop", links: [["Bilona ghee", "/shop?c=ghee"], ["Fresh milk", "/shop?c=milk"], ["Dahi & lassi", "/shop?c=dahi"], ["Kheer", "/shop?c=kheer"], ["Raw honey", "/shop?c=honey"], ["Cold-pressed oils", "/shop?c=oils"]] },
  { title: "Gaurgram", links: [["Our goshala", "/goshala"], ["How we make it", "/making"], ["Lab reports", "/lab-reports"], ["Daily subscription", "/subscribe"], ["Delivery areas", "/delivery"]] },
  { title: "Help", links: [["My account", "/account"], ["Shipping & delivery", "/policies/shipping"], ["Returns & refunds", "/policies/refunds"], ["Privacy policy", "/policies/privacy"], ["Terms of use", "/policies/terms"]] },
];

export default function Footer({ s }: { s: Settings }) {
  return (
    <footer className="khadi mt-24 border-t border-line">
      <div className="container-x pt-10 sm:pt-12">
        <p className="text-center font-deva text-[20px] text-ghee">गौशाला से घर तक</p>
        <p className="mt-1 text-center text-[13px] text-ink-3">Every jar and bottle, from our cows to your door</p>
        <Frieze labels className="mx-auto mt-6 max-w-[1100px]" />
      </div>
      <div className="container-x grid grid-cols-2 gap-x-3 gap-y-5 border-b border-line py-8 lg:grid-cols-4 lg:gap-4">
        {[
          [Sunrise, "Milked at 4 AM", "At your door by 7 in the Tricity"],
          [Recycle, "Glass, never plastic", "Returnable bottles, clay kulhads"],
          [FlaskConical, "Lab-tested batches", "Every report published online"],
          [ShieldCheck, "FSSAI licensed", `Lic. No. ${s.fssai}`],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Sunrise;
          return (
            <div key={t as string} className="flex items-start gap-2.5 sm:items-center sm:gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ghee sm:h-11 sm:w-11"><I size={18} /></span>
              <span>
                <b className="block text-[13px] font-semibold sm:text-[14px]">{t as string}</b>
                <span className="block break-words text-[12px] text-ink-3 sm:text-[13px]">{d as string}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-3 sm:py-14 lg:grid-cols-[1.4fr_repeat(3,1fr)] *:min-w-0">
        <div className="col-span-2 max-w-sm space-y-4 sm:col-span-3 lg:col-span-1">
          <Logo />
          <p className="text-[14px] leading-relaxed text-ink-2">
            Ghee, milk, dahi, honey and cold-pressed oils from our own goshala and the farmers around it. No middleman, nothing mixed in, packed in glass.
          </p>
          <div className="space-y-1 text-[13px] text-ink-3">
            <p>{s.address}</p>
            <p>WhatsApp <span className="select-all text-ink-2">{s.whatsapp}</span> · <span className="select-all text-ink-2">{s.email}</span></p>
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="eyebrow mb-4">{c.title}</h3>
            <ul className="space-y-2.5 text-[14px]">
              {c.links.map(([l, h]) => (
                <li key={h}><Link href={h} className="text-ink-2 hover:text-ghee-deep">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 pb-24 pt-5 text-[12px] text-ink-3 sm:flex-row sm:items-center sm:justify-between lg:pb-5">
          <p>© {new Date().getFullYear()} Gaurgram. FSSAI Lic. No. {s.fssai}</p>
          <p className="font-deva text-[14px] text-ghee">गौशाला से घर तक</p>
        </div>
      </div>
    </footer>
  );
}
