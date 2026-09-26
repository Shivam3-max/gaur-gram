import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import LoginForm from "@/components/account/LoginForm";
import Folk from "@/components/folk/Folk";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  if (await currentUser()) redirect(safeNext);

  return (
    <div className="container-x grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
      <div className="arch relative mx-auto hidden aspect-[4/5] w-full max-w-[460px] overflow-hidden lg:block">
        <Image src="/images/milk-pour-jar.jpg" alt="Fresh milk being poured into a glass jar" fill sizes="460px" className="object-cover" priority />
      </div>
      <div className="mx-auto w-full max-w-md">
        <span className="eyebrow">Welcome</span>
        <h1 className="mt-2 font-display text-[32px] min-[400px]:text-[38px] sm:text-[44px] leading-none">Sign in to Gaurgram</h1>
        <p className="mt-2 font-deva text-[18px] text-ghee">स्वागत है</p>
        <p className="mb-8 mt-3 text-[15px] text-ink-2">Manage your daily milk, wallet and orders. New here? The same steps create your account.</p>
        <LoginForm next={safeNext} />
        <Folk scene="cycle" label h="h-[80px]" className="mt-12" />
      </div>
    </div>
  );
}
