/**
 * Email service — sends orders via the deployed Supabase Edge Function.
 *
 * SMTP credentials are stored exclusively as Supabase Edge Function Secrets
 * (SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD, RECIPIENT_EMAIL) and are
 * never exposed to the frontend.
 */

import { supabase } from "@/lib/supabase";
import type { OrderData, EmailResult } from "@/lib/email-service-types";

export type { OrderData, EmailResult };

export async function sendOrderEmail(order: OrderData): Promise<EmailResult> {
  const payload = {
    offerId: order.offerId,
    offerName: order.offerName,
    fullName: order.fullName,
    phone: order.phone,
    wilaya: order.wilaya,
    commune: order.commune,
    deliveryType: order.deliveryType,
    quantity: order.quantity,
    unitPrice: order.unitPrice,
    deliveryPrice: order.deliveryPrice,
    total: order.total,
    orderDateTime: order.orderDateTime,
    orderRef: order.orderRef,
  };

  try {
    const { data, error } = await supabase.functions.invoke("send-order-email", {
      body: payload,
    });

    if (error) {
      return { success: false, message: "Failed to send order email." };
    }

    if (data && typeof data === "object" && "success" in data) {
      const result = data as { success: boolean; message?: string };
      return {
        success: result.success,
        message: result.message ?? (result.success ? "Order sent successfully." : "Failed to send order email."),
      };
    }

    return { success: false, message: "Unexpected response from email service." };
  } catch {
    return { success: false, message: "Failed to connect to email service." };
  }
}
