import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderPayload {
  offerId?: string;
  offerName?: string;
  fullName?: string;
  phone?: string;
  wilaya?: string;
  commune?: string;
  deliveryType?: string;
  quantity?: number;
  unitPrice?: number;
  deliveryPrice?: number;
  total?: number;
  orderDateTime?: string;
  subject?: string;
  body?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as OrderPayload;

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpEmail = Deno.env.get("SMTP_EMAIL");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const recipientEmail = Deno.env.get("RECIPIENT_EMAIL");

    if (!smtpHost || !smtpPort || !smtpEmail || !smtpPassword || !recipientEmail) {
      console.error("[send-order-email] Missing SMTP secrets. Configure SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD, RECIPIENT_EMAIL in Edge Function secrets.");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email sending is not configured. Please contact the store directly.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const subject = body.subject ?? `New order — ${body.offerName ?? "RAHIQ Parfums"}`;
    const emailBody = body.body ?? [
      `New Order — RAHIQ Parfums`,
      ``,
      `Offer: ${body.offerName ?? "N/A"}`,
      `Name: ${body.fullName ?? "N/A"}`,
      `Phone: ${body.phone ?? "N/A"}`,
      `Wilaya: ${body.wilaya ?? "N/A"}`,
      `Commune: ${body.commune ?? "N/A"}`,
      `Delivery: ${body.deliveryType ?? "N/A"}`,
      `Quantity: ${body.quantity ?? 1}`,
      `Unit price: ${body.unitPrice ?? 0} DA`,
      `Delivery: ${body.deliveryPrice === 0 ? "Free" : `${body.deliveryPrice ?? 0} DA`}`,
      `Total: ${body.total ?? 0} DA`,
      `Date: ${body.orderDateTime ? new Date(body.orderDateTime).toLocaleString() : new Date().toLocaleString()}`,
      ``,
      `---`,
      `This order was submitted from the RAHIQ Parfums website.`,
    ].join("\n");

    const sent = await sendViaSmtp({
      host: smtpHost,
      port: Number(smtpPort),
      email: smtpEmail,
      password: smtpPassword,
      to: recipientEmail,
      subject,
      body: emailBody,
    });

    if (!sent) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send email. Please try again later.",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your order has been submitted successfully. We will contact you soon.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-order-email] Error:", message);
    return new Response(
      JSON.stringify({ success: false, message: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function sendViaSmtp(opts: {
  host: string;
  port: number;
  email: string;
  password: string;
  to: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  const { SmtpClient } = await import("https://deno.land/x/smtp@v0.7.0/mod.ts");

  const client = new SmtpClient();
  try {
    await client.connect({
      hostname: opts.host,
      port: opts.port,
      username: opts.email,
      password: opts.password,
      useTLS: opts.port === 465,
      useSTARTTLS: opts.port !== 465,
    });

    await client.send({
      from: opts.email,
      to: opts.to,
      subject: opts.subject,
      content: opts.body,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${escapeHtml(opts.body)}</pre>`,
    });

    client.close();
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-order-email] SMTP error:", message);
    try { client.close(); } catch { /* ignore */ }
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
