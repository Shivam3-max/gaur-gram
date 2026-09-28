import Link from "next/link";
import { adminPage } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { parseJSON } from "@/lib/format";
import { saveProduct } from "../../../actions";
import MediaField from "@/components/admin/MediaField";
import GalleryField from "@/components/admin/GalleryField";
import { Card, Field, PageHead, btn, btnGhost, input, textarea } from "@/components/admin/ui";

export const metadata = { title: "Edit product" };

const PACKS = [["jar", "Glass jar (ghee, makhan, paneer)"], ["bottle", "Glass milk bottle"], ["oil", "Tall oil bottle"], ["honey", "Honey jar with cloth cap"], ["kulhad", "Clay kulhad"], ["matka", "Clay matka"]];

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await adminPage("products");
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const [p, categories] = await Promise.all([
    isNew ? null : db.product.findUnique({ where: { id }, include: { variants: { orderBy: { sort: "asc" } } } }),
    db.category.findMany({ orderBy: { sort: "asc" } }),
  ]);
  if (!isNew && !p) notFound();
  const variants = [...(p?.variants ?? []), { id: "", label: "", price: 0, mrp: 0, subPrice: null as number | null, stock: 100 }, { id: "", label: "", price: 0, mrp: 0, subPrice: null as number | null, stock: 100 }];

  return (
    <form action={saveProduct}>
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <PageHead title={isNew ? "New product" : p!.name} sub={<Link href="/admin/products" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft size={13} /> All products</Link>}>
        {p && <Link href={`/product/${p.slug}`} target="_blank" className={btnGhost}><ExternalLink size={14} /> View on store</Link>}
        <button className={btn}>Save product</button>
      </PageHead>
      {saved && <p className="mb-5 rounded-xl bg-tulsi-soft px-4 py-3 text-[13.5px] font-medium text-tulsi">Saved. Changes are live on the store.</p>}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] *:min-w-0">
        <div className="space-y-6">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><input name="name" required defaultValue={p?.name} className={input} /></Field>
              <Field label="Hindi name"><input name="hindi" defaultValue={p?.hindi} className={`${input} font-deva`} /></Field>
              <Field label="URL slug" hint="Lowercase, words joined by dashes"><input name="slug" required defaultValue={p?.slug} className={input} /></Field>
              <Field label="Category">
                <select name="categoryId" defaultValue={p?.categoryId} className={input}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Tagline" className="sm:col-span-2"><input name="tagline" defaultValue={p?.tagline} className={input} /></Field>
              <Field label="Description" className="sm:col-span-2"><textarea name="description" rows={4} defaultValue={p?.description} className={textarea} /></Field>
              <Field label="Highlights" hint="One per line" className="sm:col-span-2"><textarea name="highlights" rows={4} defaultValue={parseJSON<string[]>(p?.highlights ?? "[]", []).join("\n")} className={textarea} /></Field>
            </div>
          </Card>

          <Card title="Sizes, prices & stock">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr] gap-2 *:min-w-0 text-[11.5px] font-semibold uppercase tracking-wider text-ink-3">
              <span>Size</span><span>Price ₹</span><span>MRP ₹</span><span>Subscriber ₹</span><span>Stock</span>
            </div>
            <div className="mt-2 space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr] gap-2 *:min-w-0">
                  <input type="hidden" name={`v_${i}_id`} value={v.id} />
                  <input name={`v_${i}_label`} defaultValue={v.label} placeholder={v.id ? "" : "New size, e.g. 2 L"} className={input} aria-label="Size" />
                  <input name={`v_${i}_price`} defaultValue={v.price || ""} inputMode="numeric" className={input} aria-label="Price" />
                  <input name={`v_${i}_mrp`} defaultValue={v.mrp || ""} inputMode="numeric" className={input} aria-label="MRP" />
                  <input name={`v_${i}_subPrice`} defaultValue={v.subPrice ?? ""} inputMode="numeric" className={input} aria-label="Subscriber price" />
                  <input name={`v_${i}_stock`} defaultValue={v.stock} inputMode="numeric" className={input} aria-label="Stock" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-ink-3">Clear a size name to remove it (sizes that already have orders are kept). Subscriber price applies to daily plans.</p>
          </Card>

          <Card title="Details">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Ingredients"><input name="ingredients" defaultValue={p?.ingredients} className={input} /></Field>
              <Field label="Shelf life"><input name="shelfLife" defaultValue={p?.shelfLife} className={input} /></Field>
              <Field label="Storage"><input name="storage" defaultValue={p?.storage} className={input} /></Field>
              <Field label="GST rate %" hint="Included in the price. Confirm with your CA."><input name="gstRate" type="number" min={0} max={28} defaultValue={p?.gstRate ?? 5} className={input} /></Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Visibility">
            <div className="space-y-3 text-[14px]">
              <label className="flex items-center gap-2.5"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} className="h-4 w-4 accent-[var(--tulsi)]" /> Live on the store</label>
              <label className="flex items-center gap-2.5"><input type="checkbox" name="featured" defaultChecked={p?.featured} className="h-4 w-4 accent-[var(--tulsi)]" /> Show in bestsellers</label>
              <label className="flex items-center gap-2.5"><input type="checkbox" name="subscribable" defaultChecked={p?.subscribable} className="h-4 w-4 accent-[var(--tulsi)]" /> Available as daily subscription</label>
              <Field label="Delivery">
                <select name="delivery" defaultValue={p?.delivery ?? "FRESH"} className={input}>
                  <option value="FRESH">Fresh · Tricity morning delivery only</option>
                  <option value="SHIP">Shelf-stable · ships all over India</option>
                </select>
              </Field>
              <Field label="Badge" hint="Short word on the card, e.g. Bestseller, Raw, Gift"><input name="badge" defaultValue={p?.badge ?? ""} className={input} /></Field>
            </div>
          </Card>

          <Card title="Photos & video">
            <div className="space-y-4">
              <Field label="Main product photo" hint="Leave empty to use the illustrated glass pack shot. Square or 4:5 on a white background works best."><MediaField name="image" defaultValue={p?.image} /></Field>
              <Field label="Product video" hint="MP4, shown in the product gallery"><MediaField name="video" defaultValue={p?.video} accept="video/mp4,video/webm" /></Field>
              <Field label="Lifestyle gallery" hint="Shown after the main photo. Hover an image to reorder or remove it."><GalleryField name="gallery" defaultValue={parseJSON<string[]>(p?.gallery ?? "[]", [])} /></Field>
            </div>
          </Card>

          <Card title="Pack shot style" action={<span className="text-[12px] text-ink-3">Used when there is no photo</span>}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Packaging" className="sm:col-span-3">
                <select name="pack" defaultValue={p?.pack ?? "jar"} className={input}>{PACKS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              </Field>
              <Field label="Contents colour"><input type="color" name="liquid" defaultValue={p?.liquid ?? "#e2a93b"} className="h-10 w-full rounded-lg border border-line" /></Field>
              <Field label="Label colour"><input type="color" name="label" defaultValue={p?.label ?? "#1c1a15"} className="h-10 w-full rounded-lg border border-line" /></Field>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
