"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Potli } from "../folk/icons";
import { confirmTopUp, startTopUp } from "@/app/actions";
import { openRazorpay } from "../razorpay";
import { cx, rupees } from "@/lib/format";

type Txn = { id: string; amount: number; kind: string; note: string; balance: number; at: string };

export default function WalletCard({ balance, dailySpend, txns, live }: { balance: number; dailySpend: number; txns: Txn[]; live: boolean }) {
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const [all, setAll] = useState(false);
  const router = useRouter();
  const days = dailySpend > 0 ? Math.floor(balance / dailySpend) : null;

  function topUp() {
    setMsg("");
    start(async () => {
      const r = await startTopUp(amount);
      if (!r.ok) return setMsg(r.error);
      if (r.demo) {
        setMsg(`Added ${rupees(amount)} (demo payment, no money charged).`);
        router.refresh();
        return;
      }
      if (r.razorpay) {
        await openRazorpay({
          ...r.razorpay,
          description: "Wallet top-up",
          onSuccess: async (res) => {
            const c = await confirmTopUp(res.razorpay_order_id, res.razorpay_payment_id, res.razorpay_signature);
            setMsg(c.ok ? `Added ${rupees(amount)} to your wallet.` : c.error);
            router.refresh();
          },
        });
      }
    });
  }

  return (
    <section className="rounded-[26px] border border-line bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="eyebrow flex items-center gap-2"><Potli size={15} /> Gaurgram wallet</span>
          <p className={cx("mt-2 font-display text-[48px] leading-none tabular-nums", balance < 0 && "text-clay")}>{rupees(balance)}</p>
          <p className="mt-1.5 text-[13px] text-ink-3">
            {days === null ? "No daily deliveries scheduled" : days < 3 ? <span className="font-semibold text-clay">Low balance: about {days} {days === 1 ? "day" : "days"} left</span> : <>Covers about {days} days of deliveries</>}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[500, 1000, 2000, 3000].map((a) => (
          <button key={a} type="button" onClick={() => setAmount(a)} className={cx("h-10 rounded-xl border px-4 text-[13.5px] font-semibold tabular-nums", amount === a ? "border-tulsi bg-tulsi-soft text-tulsi" : "border-line hover:border-ink/30")}>
            {rupees(a)}
          </button>
        ))}
      </div>
      <button type="button" disabled={pending} onClick={topUp} className="mt-3 h-12 w-full rounded-xl bg-tulsi text-[14.5px] font-semibold text-white hover:bg-tulsi-deep disabled:opacity-50">
        {pending ? "Opening payment…" : `Add ${rupees(amount)} with UPI / card`}
      </button>
      {!live && <p className="mt-2 text-center text-[11.5px] text-ink-3">Demo mode until Razorpay keys are added</p>}
      {msg && <p className="mt-2 text-center text-[13px] text-tulsi">{msg}</p>}

      <h4 className="eyebrow mt-6">Recent activity</h4>
      <ul className="mt-2 divide-y divide-line">
        {(all ? txns : txns.slice(0, 6)).map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2.5">
            <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full", t.amount > 0 ? "bg-tulsi-soft text-tulsi" : "bg-malai text-ink-3")}>
              {t.amount > 0 ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px]">{t.note}</span>
              <span className="text-[11.5px] text-ink-3">{t.at}</span>
            </span>
            <span className={cx("text-[13.5px] font-semibold tabular-nums", t.amount > 0 && "text-tulsi")}>{t.amount > 0 ? "+" : "−"}{rupees(Math.abs(t.amount))}</span>
          </li>
        ))}
      </ul>
      {txns.length > 6 && (
        <button type="button" onClick={() => setAll(!all)} className="mt-2 text-[13px] font-semibold text-ghee-deep hover:underline">{all ? "Show less" : `Show all ${txns.length}`}</button>
      )}
    </section>
  );
}
