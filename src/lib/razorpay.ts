import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

/** When keys are missing the store runs in demo mode and payments are simulated. */
export const razorpayEnabled = () => Boolean(KEY_ID && KEY_SECRET);
export const razorpayKeyId = () => KEY_ID;

export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"),
    },
    body: JSON.stringify({ amount: Math.round(amountRupees * 100), currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
  return (await res.json()) as { id: string; amount: number; currency: string };
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const expected = createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function fetchRazorpayOrder(orderId: string) {
  const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64") },
  });
  if (!res.ok) throw new Error(`Razorpay lookup failed (${res.status})`);
  return (await res.json()) as { id: string; amount: number; amount_paid: number; status: string; receipt: string };
}
