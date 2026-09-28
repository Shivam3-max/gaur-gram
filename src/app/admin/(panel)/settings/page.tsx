import { getSettings } from "@/lib/settings";
import { adminPage } from "@/lib/auth";
import { saveSettings } from "../../actions";
import MediaField from "@/components/admin/MediaField";
import PasswordForm from "@/components/admin/PasswordForm";
import { Card, Field, PageHead, btn, input } from "@/components/admin/ui";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await adminPage("settings");
  const s = await getSettings();
  return (
    <>
      <form action={saveSettings}>
        <PageHead title="Site settings" sub="Changes go live on the store immediately.">
          <button className={btn}>Save settings</button>
        </PageHead>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Homepage">
            <div className="space-y-4">
              <Field label="Announcement bar"><input name="announcement" defaultValue={s.announcement} className={input} /></Field>
              <Field label="Hero video (MP4)" hint="Plays inside the arch on the homepage. Keep it under 8 MB, 10–20 seconds, no sound needed."><MediaField name="heroVideo" defaultValue={s.heroVideo} accept="video/mp4,video/webm" /></Field>
              <Field label="Hero poster image" hint="Shown while the video loads"><MediaField name="heroPoster" defaultValue={s.heroPoster} /></Field>
            </div>
          </Card>
          <Card title="Numbers shown on the site">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cows & buffaloes"><input name="cows" defaultValue={s.cows} className={input} /></Field>
              <Field label="Litres milked per day"><input name="litresPerDay" defaultValue={s.litresPerDay} className={input} /></Field>
              <Field label="Families served"><input name="families" defaultValue={s.families} className={input} /></Field>
              <Field label="Km from goshala to city"><input name="kmToCity" defaultValue={s.kmToCity} className={input} /></Field>
            </div>
          </Card>
          <Card title="Delivery & fees">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nightly cut-off (24h hour)" hint="22 = 10 PM. After this, tomorrow is locked."><input name="cutoffHour" defaultValue={s.cutoffHour} inputMode="numeric" className={input} /></Field>
              <Field label="Bottle deposit ₹"><input name="bottleDeposit" defaultValue={s.bottleDeposit} className={input} /></Field>
              <Field label="Low-stock alert at" hint="Sizes with this many or fewer left are flagged"><input name="lowStockAt" defaultValue={s.lowStockAt} inputMode="numeric" className={input} /></Field>
              <Field label="Tricity delivery fee ₹"><input name="deliveryFee" defaultValue={s.deliveryFee} className={input} /></Field>
              <Field label="Free Tricity delivery above ₹"><input name="freeDeliveryAbove" defaultValue={s.freeDeliveryAbove} className={input} /></Field>
              <Field label="Courier fee ₹"><input name="shipFee" defaultValue={s.shipFee} className={input} /></Field>
              <Field label="Free courier above ₹"><input name="freeShipAbove" defaultValue={s.freeShipAbove} className={input} /></Field>
            </div>
          </Card>
          <Card title="Business details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="FSSAI licence number" className="sm:col-span-2"><input name="fssai" defaultValue={s.fssai} className={`${input} font-mono`} /></Field>
              <Field label="WhatsApp number"><input name="whatsapp" defaultValue={s.whatsapp} className={input} /></Field>
              <Field label="Email"><input name="email" defaultValue={s.email} className={input} /></Field>
              <Field label="Address" className="sm:col-span-2"><input name="address" defaultValue={s.address} className={input} /></Field>
            </div>
          </Card>
        </div>
      </form>
      <Card title="Change admin password" className="mt-6 max-w-xl"><PasswordForm /></Card>
    </>
  );
}
