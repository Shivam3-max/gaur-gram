import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { labelTitle } from "@/lib/catalog";
import { rupees } from "@/lib/format";
import { toggleProduct } from "../../actions";
import PackShot from "@/components/PackShot";
import { Card, PageHead, Pill, Table, btn, btnSm, td } from "@/components/admin/ui";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  await adminPage("products");
  const products = await db.product.findMany({ include: { category: true, variants: { orderBy: { sort: "asc" } } }, orderBy: [{ category: { sort: "asc" } }, { sort: "asc" }] });
  return (
    <>
      <PageHead title="Products" sub={`${products.length} products · ${products.filter((p) => p.active).length} live`}>
        <Link href="/admin/products/new" className={btn}><Plus size={15} /> New product</Link>
      </PageHead>
      <Card pad={false}>
        <Table head={["", "Product", "Category", "Sizes & prices", "Stock", "Delivery", "Status", ""]}>
          {products.map((p) => (
            <tr key={p.id} className={p.active ? "" : "opacity-55"}>
              <td className={`${td} w-14`}>
                <span className="block h-14 w-11 overflow-hidden rounded-lg p-0.5" style={{ background: p.category.tint }}>
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-full w-full rounded object-cover" />
                  ) : (
                    <PackShot pack={p.pack} liquid={p.liquid} label={p.label} title={labelTitle(p.slug, p.category.hindi)} className="h-full w-full" />
                  )}
                </span>
              </td>
              <td className={td}><Link href={`/admin/products/${p.id}`} className="font-semibold hover:underline">{p.name}</Link><span className="block text-[12px] text-ink-3">/{p.slug}</span></td>
              <td className={td}>{p.category.name}</td>
              <td className={td}>{p.variants.map((v) => <span key={v.id} className="block text-[12.5px]">{v.label} · <b>{rupees(v.price)}</b>{v.subPrice ? <span className="text-ink-3"> · sub {rupees(v.subPrice)}</span> : null}</span>)}</td>
              <td className={td}>{p.variants.map((v) => <span key={v.id} className={`block text-[12.5px] tabular-nums ${v.stock < 15 ? "font-semibold text-clay" : ""}`}>{v.stock}</span>)}</td>
              <td className={td}><Pill tone={p.delivery === "FRESH" ? "warn" : "info"}>{p.delivery === "FRESH" ? "Tricity fresh" : "All India"}</Pill>{p.subscribable && <span className="mt-1 block"><Pill tone="good">Subscribable</Pill></span>}</td>
              <td className={td}>{p.active ? <Pill tone="good">Live</Pill> : <Pill>Hidden</Pill>}{p.featured && <span className="mt-1 block"><Pill tone="warn">Bestseller</Pill></span>}</td>
              <td className={`${td} text-right`}>
                <div className="inline-flex gap-1.5">
                  <Link href={`/admin/products/${p.id}`} className={btnSm}>Edit</Link>
                  <form action={toggleProduct}><input type="hidden" name="id" value={p.id} /><button className={btnSm}>{p.active ? "Hide" : "Show"}</button></form>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
