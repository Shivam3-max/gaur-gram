import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import PincodeModal from "@/components/cart/PincodeModal";
import StickyCartBar from "@/components/cart/StickyCartBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LivePopups from "@/components/LivePopups";
import { getSettings, num } from "@/lib/settings";
import { db } from "@/lib/db";

// Prices, stock and site settings change from the admin panel, so every storefront page renders per request.
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const popups = await db.popup.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
    select: { id: true, kind: true, badge: true, title: true, subtitle: true },
  });
  const fees = {
    deliveryFee: num(s.deliveryFee),
    freeDeliveryAbove: num(s.freeDeliveryAbove),
    shipFee: num(s.shipFee),
    freeShipAbove: num(s.freeShipAbove),
  };
  return (
    <CartProvider>
      <Header announcement={s.announcement} />
      <main>{children}</main>
      <Footer s={s} />
      <CartDrawer fees={fees} />
      <PincodeModal />
      <StickyCartBar />
      <LivePopups items={popups} />
    </CartProvider>
  );
}
