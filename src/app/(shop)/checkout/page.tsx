import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { razorpayEnabled } from "@/lib/razorpay";
import LoginForm from "@/components/account/LoginForm";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="container-x py-14">
        <div className="mx-auto max-w-md">
          <span className="eyebrow flex items-center gap-2"><Lock size={13} /> Checkout</span>
          <h1 className="mt-2 font-display text-[42px] leading-none">Sign in to place your order</h1>
          <p className="mb-8 mt-3 text-[15px] text-ink-2">Your basket is saved. Verify your mobile number and you’ll come straight back here.</p>
          <LoginForm next="/checkout" />
        </div>
      </div>
    );
  }

  const [addresses, pins] = await Promise.all([
    db.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.pincode.findMany({ where: { active: true }, select: { code: true } }),
  ]);
  const fresh = new Set(pins.map((p) => p.code));

  return (
    <div className="container-x py-10">
      <span className="eyebrow flex items-center gap-2"><Lock size={13} /> Secure checkout</span>
      <h1 className="mb-6 mt-2 font-display text-[34px] leading-none min-[400px]:text-[40px] sm:mb-8 sm:text-[54px]">Almost there, {user.name.split(" ")[0] || "friend"}</h1>
      <CheckoutClient
        userName={user.name}
        wallet={user.wallet}
        razorpayLive={razorpayEnabled()}
        addresses={addresses.map((a) => ({ id: a.id, label: a.label, name: a.name, line1: a.line1, line2: a.line2, city: a.city, pincode: a.pincode, fresh: fresh.has(a.pincode) }))}
      />
    </div>
  );
}
