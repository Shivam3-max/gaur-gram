import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Flask, Shield } from "@/components/folk/icons";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import TraceBox from "@/components/home/TraceBox";
import Folk from "@/components/folk/Folk";

export const metadata: Metadata = { title: "Lab reports", description: "Batch-wise lab reports for Gaurgram ghee, honey and oils." };
export const dynamic = "force-dynamic";

export default async function LabReportsPage() {
  const [s, batches] = await Promise.all([getSettings(), db.batch.findMany({ include: { product: true }, orderBy: { madeOn: "desc" } })]);
  return (
    <div className="container-x py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end *:min-w-0">
        <div>
          <span className="eyebrow flex items-center gap-2"><Flask size={15} /> Lab reports</span>
          <h1 className="mt-2 font-display text-[34px] min-[400px]:text-[40px] leading-[1] sm:text-[64px]">Tested, batch by batch. Published in full.</h1>
          <p className="mt-2 font-deva text-[22px] text-ghee">हर बैच की जाँच</p>
          <Folk scene="jars" label h="h-[96px]" align="left" className="mt-6" />
        </div>
        <div className="space-y-4">
          <p className="text-[16px] leading-relaxed text-ink-2">
            Every batch of ghee, honey and oil is sent to an independent lab before it is sold. Type the code printed on your jar to see its report.
          </p>
          <TraceBox example={batches[0]?.code} />
          <p className="flex items-center gap-2 text-[13px] text-ink-3"><Shield size={16} className="text-tulsi" /> FSSAI Lic. No. {s.fssai}</p>
        </div>
      </div>

      <div className="mt-12 overflow-x-auto rounded-[24px] border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead className="bg-malai text-[11.5px] uppercase tracking-wider text-ink-3">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Batch</th>
              <th className="px-5 py-3.5 font-semibold">Product</th>
              <th className="px-5 py-3.5 font-semibold">Made on</th>
              <th className="px-5 py-3.5 font-semibold">Quantity</th>
              <th className="px-5 py-3.5 font-semibold">Result</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-malai/60">
                <td className="px-5 py-4 font-mono text-[13px]">{b.code}</td>
                <td className="px-5 py-4 font-medium">{b.product.name}</td>
                <td className="px-5 py-4 tabular-nums">{b.madeOn.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-5 py-4 text-ink-2">{b.quantity}</td>
                <td className="px-5 py-4"><span className="rounded-full bg-tulsi-soft px-2.5 py-1 text-[12px] font-semibold text-tulsi">{b.result}</span></td>
                <td className="px-5 py-4 text-right"><Link href={`/trace/${b.code}`} className="inline-flex items-center gap-1 font-semibold text-ghee-deep hover:underline">View <ArrowUpRight size={14} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[13px] text-ink-3">Fresh milk, dahi and lassi are tested weekly at the goshala for fat, SNF and adulterants. Those logs are available on request.</p>
    </div>
  );
}
