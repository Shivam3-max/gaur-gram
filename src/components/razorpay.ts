"use client";

type Opts = {
  key: string;
  orderId: string;
  amount: number;
  name: string;
  phone: string;
  description: string;
  onSuccess: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (o: Record<string, unknown>) => { open: () => void };
  }
}

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(s);
  });
}

export async function openRazorpay(o: Opts) {
  await loadScript();
  if (!window.Razorpay) throw new Error("Razorpay unavailable");
  const rzp = new window.Razorpay({
    key: o.key,
    order_id: o.orderId,
    amount: o.amount,
    currency: "INR",
    name: "Gaurgram",
    description: o.description,
    prefill: { name: o.name, contact: o.phone },
    theme: { color: "#3d6b3a" },
    handler: o.onSuccess,
    modal: { ondismiss: o.onDismiss },
  });
  rzp.open();
}
