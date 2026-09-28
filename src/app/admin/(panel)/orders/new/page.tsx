import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings, num } from "@/lib/settings";
import { getHolidays } from "@/lib/holidays";
import { nextDeliveryDate } from "@/lib/schedule";
import PhoneOrderForm from "@/components/admin/PhoneOrderForm";
import { PageHead } from "@/components/admin/ui";

export const metadata = { title: "New phone order" };

export default async function NewPhoneOrder() {
  await adminPage("orders");
  const [variants, s, holidays] = await Promise.all([
    db.variant.findMany({ where: { product: { active: true } }, include: { product: true }, orderBy: [{ product: { sort: "asc" } }, { sort: "asc" }] }),
    getSettings(),
    getHolidays(),
  ]);
  return (
    <>
      <PageHead title="New phone order" sub={<Link href="/admin/orders" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft size={13} /> Orders</Link>} />
      <PhoneOrderForm
        earliest={nextDeliveryDate(num(s.cutoffHour), holidays.set)}
        variants={variants.map((v) => ({ id: v.id, name: v.product.name, label: v.label, price: v.price, stock: v.stock, fresh: v.product.delivery === "FRESH" }))}
      />
    </>
  );
}
