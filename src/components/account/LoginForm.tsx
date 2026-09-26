"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, KeyRound } from "lucide-react";
import { sendOtp, verifyOtp } from "@/app/actions";

export default function LoginForm({ next = "/account", onDone }: { next?: string; onDone?: () => void }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    start(async () => {
      const r = await sendOtp(phone);
      if (!r.ok) return setErr(r.error);
      setDevCode(r.devCode);
      setStep("otp");
    });
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    start(async () => {
      const r = await verifyOtp(phone, code, name);
      if (!r.ok) return setErr(r.error);
      if (onDone) onDone();
      router.push(next);
      router.refresh();
    });
  }

  return step === "phone" ? (
    <form onSubmit={requestCode} className="space-y-4">
      <label className="block">
        <span className="text-[13px] font-semibold">Mobile number</span>
        <span className="mt-1.5 flex h-13 items-center rounded-xl border border-line bg-malai focus-within:border-ghee focus-within:bg-white">
          <span className="flex items-center gap-1.5 border-r border-line px-3.5 text-[15px] text-ink-2"><Phone size={15} /> +91</span>
          <input
            id="login-phone"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="98765 43210"
            className="h-full flex-1 bg-transparent px-3 text-[16px] tracking-wide outline-none"
          />
        </span>
      </label>
      {err && <p className="text-[13px] text-clay">{err}</p>}
      <button disabled={pending || phone.length !== 10} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-[15px] font-semibold text-white disabled:opacity-40">
        {pending ? "Sending…" : "Get OTP"} <ArrowRight size={17} />
      </button>
      <p className="text-center text-[12px] text-ink-3">We’ll send a 6-digit code to verify your number.</p>
    </form>
  ) : (
    <form onSubmit={confirm} className="space-y-4">
      <p className="text-[14px] text-ink-2">
        Code sent to <b>+91 {phone}</b>.{" "}
        <button type="button" className="font-semibold text-ghee-deep hover:underline" onClick={() => { setStep("phone"); setCode(""); }}>Change</button>
      </p>
      {devCode && (
        <p className="rounded-xl border border-dashed border-ghee bg-ghee-soft px-4 py-3 text-[13px] text-ghee-deep">
          Development mode: no SMS provider is connected, so your code is <b className="font-mono tracking-widest">{devCode}</b>
        </p>
      )}
      <label className="block">
        <span className="text-[13px] font-semibold">6-digit code</span>
        <span className="mt-1.5 flex h-13 items-center gap-2 rounded-xl border border-line bg-malai px-3.5 focus-within:border-ghee focus-within:bg-white">
          <KeyRound size={16} className="text-ink-3" />
          <input
            id="login-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="h-full flex-1 bg-transparent font-mono text-[18px] tracking-[0.4em] outline-none"
            autoFocus
          />
        </span>
      </label>
      <label className="block">
        <span className="text-[13px] font-semibold">Your name <span className="font-normal text-ink-3">(for new accounts)</span></span>
        <input id="login-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-1.5 h-12 w-full rounded-xl border border-line bg-malai px-3.5 text-[15px] outline-none focus:border-ghee focus:bg-white" />
      </label>
      {err && <p className="text-[13px] text-clay">{err}</p>}
      <button disabled={pending || code.length !== 6} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-tulsi py-3.5 text-[15px] font-semibold text-white disabled:opacity-40">
        {pending ? "Verifying…" : "Verify & continue"}
      </button>
    </form>
  );
}
