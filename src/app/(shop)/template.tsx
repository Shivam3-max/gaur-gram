import { ViewTransition } from "react";

/**
 * Remounts on every storefront navigation, so the page underneath the header can fade and rise
 * into place. Browsers without the View Transitions API simply swap pages as before.
 */
export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
