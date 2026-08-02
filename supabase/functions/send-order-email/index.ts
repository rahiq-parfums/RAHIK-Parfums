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

function base64Encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function encodeHeader(s: string): string {
  if (/[^\x00-\x7F]/.test(s)) {
    return `=?UTF-8?B?${base64Encode(s)}?=`;
  }
  return s;
}

async function sendViaSmtp(opts: {
  host: string;
  port: number;
  email: string;
  password: string;
  to: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const buf = new Uint8Array(4096);
  let conn: Deno.Conn;
  let readBuffer = "";

  async function readLine(): Promise<string> {
    while (true) {
      const idx = readBuffer.indexOf("\r\n");
      if (idx >= 0) {
        const line = readBuffer.slice(0, idx);
        readBuffer = readBuffer.slice(idx + 2);
        return line;
      }
      const n = await conn.read(buf);
      if (n === null) throw new Error("Connection closed by server");
      readBuffer += decoder.decode(buf.subarray(0, n));
    }
  }

  async function readResponse(): Promise<string> {
    const lines: string[] = [];
    while (true) {
      const line = await readLine();
      lines.push(line);
      if (/^\d{3} /.test(line)) break;
    }
    return lines.join("\r\n");
  }

  async function write(s: string): Promise<void> {
    await conn.write(encoder.encode(s + "\r\n"));
  }

  try {
    if (opts.port === 465) {
      conn = await Deno.connectTls({ hostname: opts.host, port: opts.port });
    } else {
      conn = await Deno.connect({ hostname: opts.host, port: opts.port });
    }

    await readResponse();

    await write("EHLO rahiqparfums.dz");
    await readResponse();

    if (opts.port !== 465) {
      await write("STARTTLS");
      await readResponse();
      conn = await Deno.startTls(conn, { hostname: opts.host });
      readBuffer = "";
      await write("EHLO rahiqparfums.dz");
      await readResponse();
    }

    await write("AUTH LOGIN");
    await readResponse();
    await write(base64Encode(opts.email));
    await readResponse();
    await write(base64Encode(opts.password));
    const authResp = await readResponse();
    if (!/^235/.test(authResp)) {
      throw new Error("SMTP authentication failed");
    }

    await write(`MAIL FROM:<${opts.email}>`);
    await readResponse();

    await write(`RCPT TO:<${opts.to}>`);
    await readResponse();

    await write("DATA");
    await readResponse();

    const headers = [
      `From: ${opts.email}`,
      `To: ${opts.to}`,
      `Subject: ${encodeHeader(opts.subject)}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
    ].join("\r\n");

    const encodedBody = base64Encode(opts.body);
    const emailContent = headers + encodedBody + "\r\n.\r\n";
    await conn.write(encoder.encode(emailContent));
    await readResponse();

    await write("QUIT");
    try { await readResponse(); } catch { /* server may close immediately */ }

    return true;
  } catch (err) {
    console.error("[send-order-email] SMTP error:", err instanceof Error ? err.message : String(err));
    return false;
  } finally {
    try { conn!.close(); } catch { /* ignore */ }
  }
}
