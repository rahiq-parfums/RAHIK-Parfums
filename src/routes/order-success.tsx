import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/SiteLayout";
import { formatPrice } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import {
  getOrderSuccessState,
  type OrderSuccessState,
} from "@/lib/order-success";

export const Route = createFileRoute("/order-success")({
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { lang } = useI18n();
  const [order, setOrder] = useState<OrderSuccessState | null>(null);

  useEffect(() => {
    setOrder(getOrderSuccessState());
  }, []);

  const isArabic = lang === "ar";

  if (!order) {
    return (
      <SiteLayout>
        <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6 py-16">
          <section className="w-full rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-[0_2px_24px_-18px_oklch(0.145_0_0/0.5)] sm:p-10">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-accent text-2xl text-primary"
              aria-hidden="true"
            >
              !
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-[0.08em] text-foreground sm:text-3xl">
              {isArabic
                ? "لا توجد معلومات عن الطلب"
                : "No order information found"}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              {isArabic
                ? "لم يتم العثور على تفاصيل طلب مكتمل في هذه الجلسة."
                : "No completed order details were found in this session."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/offers"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                {isArabic ? "العودة إلى العروض" : "Back to offers"}
              </Link>

              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {isArabic ? "العودة للرئيسية" : "Go home"}
              </Link>
            </div>
          </section>
        </main>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-20">
        <section className="rounded-2xl border border-primary/20 bg-card p-7 text-center shadow-[0_2px_24px_-18px_oklch(0.145_0_0/0.5)] sm:p-10">
          {/* Success icon */}
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-accent text-3xl font-bold text-primary"
            aria-hidden="true"
          >
            ✓
          </div>

          {/* Main message */}
          <h1 className="mt-7 text-3xl font-bold tracking-[0.08em] text-foreground sm:text-4xl">
            {isArabic ? "تم تأكيد طلبك بنجاح" : "Your order is confirmed"}
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
            {isArabic
              ? "شكراً لثقتك في رحيق. لقد تم إرسال طلبك بنجاح، وسنتواصل معك لتأكيد التفاصيل."
              : "Thank you for choosing RAHIQ. Your order has been submitted successfully, and we will contact you to confirm the details."}
          </p>

          {/* Order reference */}
          <div className="mt-8 rounded-xl border border-primary/20 bg-background px-5 py-5">
            <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground">
              {isArabic ? "رقم الطلب" : "ORDER REFERENCE"}
            </p>

            <p
              dir="ltr"
              className="mt-2 text-lg font-bold tracking-[0.08em] text-primary"
            >
              {order.orderRef}
            </p>
          </div>

          {/* Order summary */}
          <div className="mt-6 rounded-xl border border-border bg-background p-5 text-start">
            <h2 className="text-center text-sm font-bold tracking-[0.12em] text-muted-foreground">
              {isArabic ? "ملخص الطلب" : "ORDER SUMMARY"}
            </h2>

            <span
              className="mx-auto mt-4 block h-px w-10 bg-primary/50"
              aria-hidden="true"
            />

            <dl className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">
                  {isArabic ? "العرض" : "Offer"}
                </dt>

                <dd className="max-w-[65%] text-end font-medium text-foreground">
                  {order.offerName}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">
                  {isArabic ? "الكمية" : "Quantity"}
                </dt>

                <dd className="font-medium tabular-nums text-foreground">
                  {order.quantity}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">
                  {isArabic ? "سعر الوحدة" : "Unit price"}
                </dt>

                <dd className="font-medium tabular-nums text-foreground">
                  {formatPrice(order.unitPrice)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">
                  {isArabic ? "التوصيل" : "Delivery"}
                </dt>

                <dd className="font-medium tabular-nums text-foreground">
                  {order.deliveryPrice === 0
                    ? isArabic
                      ? "مجاني"
                      : "Free"
                    : formatPrice(order.deliveryPrice)}
                </dd>
              </div>

              <div className="h-px bg-border/70" />

              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-medium tracking-[0.08em] text-foreground">
                  {isArabic ? "المجموع" : "Total"}
                </dt>

                <dd className="text-2xl font-bold tabular-nums text-primary">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Next step */}
          <div className="mt-7 rounded-xl border border-primary/10 bg-accent/40 px-5 py-4">
            <p className="text-sm leading-7 text-muted-foreground">
              {isArabic
                ? "سنتواصل معك على رقم الهاتف الذي أدخلته لتأكيد الطلب والتوصيل."
                : "We will contact you on the phone number you provided to confirm your order and delivery."}
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/offers"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-7 py-3.5 text-sm font-bold tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              {isArabic ? "اكتشف عروضنا" : "Explore our offers"}
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {isArabic ? "العودة للرئيسية" : "Back to home"}
            </Link>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}