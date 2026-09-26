import Link from "next/link";
import type { Metadata } from "next";
import { Sunrise, Truck, SearchX } from "lucide-react";
import { getCategories, getProducts } from "@/lib/catalog";
import PackShot from "@/components/PackShot";
import ProductCard from "@/components/ProductCard";
import { cx } from "@/lib/format";
import ActiveRail from "@/components/ActiveRail";
import Folk from "@/components/folk/Folk";
import { SCENE_FOR } from "@/components/folk/forCategory";

export const metadata: Metadata = { title: "Shop" };

type SP = Promise<{ c?: string; q?: string; d?: string; sort?: string }>;

const LIQUID: Record<string, string> = { ghee: "#e2a93b", honey: "#c9861b", oils: "#d4a017", kheer: "#f5e7c4" };

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const { c, q, d, sort } = await searchParams;
  const categories = await getCategories();
  const cat = categories.find((x) => x.slug === c);
  let products = await getProducts({ category: cat?.slug, q: q?.trim() || undefined, delivery: d === "fresh" ? "FRESH" : d === "ship" ? "SHIP" : undefined });
  if (sort === "price") products = [...products].sort((a, b) => a.variants[0].price - b.variants[0].price);
  if (sort === "rating") products = [...products].sort((a, b) => b.rating - a.rating);
  const tint = Object.fromEntries(categories.map((x) => [x.slug, x.tint]));

  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { c, q, d, sort, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="container-x pb-10 pt-6">
      <div className="grid gap-6 lg:grid-cols-[210px_1fr] lg:gap-10 *:min-w-0">
        {/* Category rail */}
        <aside className="lg:sticky lg:top-[140px] lg:self-start">
          <ActiveRail label="Categories" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto scroll-smooth px-5 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            <Link
              href={href({ c: undefined })}
              data-active={!cat}
              className={cx("flex shrink-0 items-center gap-2 rounded-2xl border p-1.5 pr-3 transition lg:gap-3 lg:p-2 lg:pr-4 lg:border-transparent", !cat ? "border-ink bg-ink text-white lg:bg-malai lg:text-ink lg:border-l-[3px] lg:border-l-ghee" : "border-line hover:bg-malai")}
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white font-deva text-[16px] text-ghee lg:h-11 lg:w-11 lg:text-[18px]">सब</span>
              <span className="whitespace-nowrap text-[13px] font-semibold lg:text-[14px]">All products</span>
            </Link>
            {categories.map((x) => (
              <Link
                key={x.id}
                href={href({ c: x.slug })}
                data-active={cat?.slug === x.slug}
                className={cx(
                  "flex shrink-0 items-center gap-2 rounded-2xl border p-1.5 pr-3 transition lg:gap-3 lg:p-2 lg:pr-4 lg:border-transparent",
                  cat?.slug === x.slug ? "border-ink bg-ink text-white lg:bg-malai lg:text-ink lg:border-l-[3px] lg:border-l-ghee" : "border-line hover:bg-malai",
                )}
              >
                <span className="h-9 w-9 shrink-0 rounded-xl p-0.5 lg:h-11 lg:w-11 lg:p-1" style={{ background: x.tint }}>
                  <PackShot pack={x.pack} liquid={LIQUID[x.slug] ?? "#fbf8ef"} title={x.hindi} className="h-full w-full" />
                </span>
                <span className="whitespace-nowrap text-[13px] font-semibold leading-tight lg:whitespace-normal lg:text-[14px]">{x.name}</span>
              </Link>
            ))}
          </ActiveRail>
        </aside>

        <section>
          <header className="border-b border-line pb-5">
            <div className="flex items-end justify-between gap-6">
            <div>
              <span className="eyebrow">{q ? "Search" : "Shop"}</span>
              <h1 className="mt-1 font-display text-[34px] leading-none min-[400px]:text-[40px] sm:text-[46px] 2xl:text-[52px]">{q ? `“${q}”` : cat ? cat.name : "All products"}</h1>
              {cat && <p className="mt-2 text-[15px] text-ink-2"><span className="font-deva text-ghee">{cat.hindi}</span> · {cat.blurb}</p>}
              {!cat && !q && <p className="mt-2 text-[15px] text-ink-2">Fresh dairy for the Tricity, and ghee, honey and oils for all of India.</p>}
            </div>
            <Folk scene={cat ? SCENE_FOR[cat.slug] ?? "carry" : "carry"} label h="h-[76px] sm:h-[104px] 2xl:h-[120px]" className="shrink-0" />
            </div>
            <div className="no-scrollbar -mx-5 mt-5 flex items-center gap-2 overflow-x-auto whitespace-nowrap px-5 text-[13px] sm:mx-0 sm:flex-wrap sm:px-0">
              {[
                [undefined, "All"],
                ["fresh", "Morning delivery"],
                ["ship", "Ships India-wide"],
              ].map(([k, l]) => (
                <Link key={l} href={href({ d: k })} className={cx("flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium", d === k ? "border-tulsi bg-tulsi-soft text-tulsi" : "border-line text-ink-2 hover:border-ink/30")}>
                  {k === "fresh" && <Sunrise size={14} />}
                  {k === "ship" && <Truck size={14} />}
                  {l}
                </Link>
              ))}
              <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
              {[
                [undefined, "Popular"],
                ["rating", "Top rated"],
                ["price", "Price"],
              ].map(([k, l]) => (
                <Link key={l} href={href({ sort: k })} className={cx("shrink-0 rounded-full px-3 py-1.5 font-medium", sort === k ? "bg-ink text-white" : "text-ink-2 hover:bg-malai")}>
                  {l}
                </Link>
              ))}
            </div>
          </header>

          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <SearchX size={36} className="text-ink-3" />
              <p className="font-display text-3xl">Nothing matches that yet</p>
              <p className="text-ink-3">Try “ghee”, “milk”, “honey” or browse all products.</p>
              <Link href="/shop" className="mt-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white">See everything</Link>
            </div>
          ) : (
            <>
              <p className="mt-4 text-[13px] text-ink-3">{products.length} {products.length === 1 ? "product" : "products"}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} tint={tint[p.category.slug]} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
