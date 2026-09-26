"use client";

import { useState, useTransition } from "react";
import { saveAddress, type AddressInput } from "@/app/actions";

const field = "h-12 w-full rounded-xl border border-line bg-malai px-3.5 text-[15px] outline-none focus:border-ghee focus:bg-white";

export default function AddressForm({ defaultName = "", onSaved, onCancel }: { defaultName?: string; onSaved: (id: string, fresh: boolean, a: AddressInput) => void; onCancel?: () => void }) {
  const [a, setA] = useState<AddressInput>({ label: "Home", name: defaultName, line1: "", line2: "", landmark: "", city: "", state: "", pincode: "" });
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setA((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErr("");
        start(async () => {
          const r = await saveAddress(a);
          if (!r.ok) return setErr(r.error);
          onSaved(r.id, r.fresh, a);
        });
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <label className="sm:col-span-2">
        <span className="text-[13px] font-semibold">Full name</span>
        <input id="addr-name" required value={a.name} onChange={set("name")} autoComplete="name" className={`${field} mt-1`} />
      </label>
      <label className="sm:col-span-2">
        <span className="text-[13px] font-semibold">House / flat, street</span>
        <input id="addr-line1" required value={a.line1} onChange={set("line1")} autoComplete="address-line1" className={`${field} mt-1`} />
      </label>
      <label>
        <span className="text-[13px] font-semibold">Area / sector</span>
        <input id="addr-line2" value={a.line2} onChange={set("line2")} autoComplete="address-line2" className={`${field} mt-1`} />
      </label>
      <label>
        <span className="text-[13px] font-semibold">Landmark</span>
        <input id="addr-landmark" value={a.landmark} onChange={set("landmark")} className={`${field} mt-1`} />
      </label>
      <label>
        <span className="text-[13px] font-semibold">City</span>
        <input id="addr-city" required value={a.city} onChange={set("city")} autoComplete="address-level2" className={`${field} mt-1`} />
      </label>
      <label>
        <span className="text-[13px] font-semibold">Pincode</span>
        <input id="addr-pincode" required inputMode="numeric" maxLength={6} value={a.pincode} onChange={(e) => setA((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "") }))} autoComplete="postal-code" className={`${field} mt-1`} />
      </label>
      <label>
        <span className="text-[13px] font-semibold">State</span>
        <input id="addr-state" value={a.state} onChange={set("state")} autoComplete="address-level1" className={`${field} mt-1`} />
      </label>
      <label>
        <span className="text-[13px] font-semibold">Save as</span>
        <select id="addr-label" value={a.label} onChange={set("label")} className={`${field} mt-1`}>
          <option>Home</option>
          <option>Work</option>
          <option>Parents</option>
          <option>Other</option>
        </select>
      </label>
      {err && <p className="text-[13px] text-clay sm:col-span-2">{err}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={pending} className="h-12 rounded-xl bg-ink px-6 text-[14px] font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : "Save address"}</button>
        {onCancel && <button type="button" onClick={onCancel} className="h-12 rounded-xl px-4 text-[14px] font-medium text-ink-2 hover:bg-malai">Cancel</button>}
      </div>
    </form>
  );
}
