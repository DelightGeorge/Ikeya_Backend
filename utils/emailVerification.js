import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Ikeyà <hello@ikeyaoriginnals.site>";
const ADMIN_EMAIL = "ikeyaoriginals@gmail.com";

const brandHeader = `
  <div style="text-align:center; margin-bottom:30px;">
    <h1 style="text-transform:uppercase; letter-spacing:6px; color:#000; margin:0; font-size:28px;">Ikeyà</h1>
    <p style="text-transform:uppercase; font-size:9px; letter-spacing:3px; color:#92400e; margin-top:5px;">
      Originality is the only luxury
    </p>
  </div>
`;

const divider = `<hr style="border:none; border-top:1px solid #f0f0f0; margin:24px 0;" />`;

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ Missing RESEND_API_KEY");
    return;
  }
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
        <div style="font-family:Georgia,serif; max-width:600px; margin:auto; padding:50px 20px; background:#fff;">
          ${brandHeader}
          ${html}
          <p style="margin-top:40px; font-size:11px; color:#aaa; text-align:center; text-transform:uppercase; letter-spacing:2px;">
            © ${new Date().getFullYear()} Ikeyà Originals
          </p>
        </div>
      `,
      text: text || "Open in an HTML-capable email client to view this message.",
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "Reply-To": ADMIN_EMAIL,
      },
    });

    if (response.error) {
      console.error("❌ Resend Error:", response.error);
      return;
    }
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
};

// ─── Existing emails (unchanged) ────────────────────────────────────────────

export const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: "Welcome to Ikeyà",
    html: `
      <h2 style="text-align:center;">Welcome, ${name}</h2>
      <p style="text-align:center;">Your journey into the house of Ikeyà has begun.</p>
    `,
  });
};

export const sendLoginEmail = async (email, token) => {
  const loginUrl = `${process.env.FRONTEND_URL}/verify-login?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: "Your Ikeyà Login Link",
    html: `
      <h2 style="text-align:center;">Sign In Request</h2>
      <div style="text-align:center; margin:40px 0;">
        <a href="${loginUrl}" style="background:#92400e; color:#fff; padding:18px 40px; text-decoration:none; text-transform:uppercase; letter-spacing:3px;">
          Complete Login
        </a>
      </div>
    `,
    text: `Sign in using this link: ${loginUrl}`,
  });
};

export const sendResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: "Reset Your Ikeyà Password",
    html: `
      <h2 style="text-align:center;">Password Reset Request</h2>
      <p style="text-align:center;">Click the button below to reset your password:</p>
      <div style="text-align:center; margin:20px 0;">
        <a href="${resetLink}" style="background:#92400e; color:#fff; padding:12px 30px; text-decoration:none; text-transform:uppercase; letter-spacing:2px;">
          Reset Password
        </a>
      </div>
    `,
    text: `Reset your password: ${resetLink}`,
  });
};

// ─── Order Receipt Email → Customer ─────────────────────────────────────────

export const sendOrderReceiptEmail = async ({ email, name, order }) => {
  const formatMoney = (kobo) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 })
      .format(kobo / 100);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" });

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #f5f5f5; font-size:13px; color:#333;">
          ${item.product?.name || "Product"}
        </td>
        <td style="padding:12px 0; border-bottom:1px solid #f5f5f5; font-size:13px; color:#888; text-align:center;">
          ×${item.quantity}
        </td>
        <td style="padding:12px 0; border-bottom:1px solid #f5f5f5; font-size:13px; color:#333; text-align:right;">
          ${formatMoney(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const deliveryFee = 250000;
  const subtotal = order.totalAmount - deliveryFee;
  const orderId = `#IKY-${order.id.slice(-8).toUpperCase()}`;

  const html = `
    <div style="background:#fafafa; border:1px solid #f0f0f0; padding:32px; margin-bottom:24px;">
      <p style="text-transform:uppercase; font-size:9px; letter-spacing:3px; color:#92400e; margin:0 0 8px;">
        Order Confirmed
      </p>
      <h2 style="margin:0; font-size:22px; color:#000; letter-spacing:2px;">${orderId}</h2>
      <p style="color:#888; font-size:12px; margin:6px 0 0;">${formatDate(order.createdAt)}</p>
    </div>

    <p style="font-size:14px; color:#333; line-height:1.8;">
      Dear ${name}, thank you for your order. We are preparing your pieces and will notify you once they are on their way.
    </p>

    ${divider}

    <h3 style="text-transform:uppercase; letter-spacing:3px; font-size:10px; color:#92400e; margin-bottom:16px;">
      Order Items
    </h3>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left; font-size:9px; text-transform:uppercase; letter-spacing:2px; color:#aaa; padding-bottom:8px;">Item</th>
          <th style="text-align:center; font-size:9px; text-transform:uppercase; letter-spacing:2px; color:#aaa; padding-bottom:8px;">Qty</th>
          <th style="text-align:right; font-size:9px; text-transform:uppercase; letter-spacing:2px; color:#aaa; padding-bottom:8px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-top:16px;">
      <tr>
        <td style="font-size:12px; color:#888; padding:6px 0; text-transform:uppercase; letter-spacing:1px;">Subtotal</td>
        <td style="font-size:12px; color:#888; padding:6px 0; text-align:right;">${formatMoney(subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:12px; color:#888; padding:6px 0; text-transform:uppercase; letter-spacing:1px;">Delivery</td>
        <td style="font-size:12px; color:#888; padding:6px 0; text-align:right;">${formatMoney(deliveryFee)}</td>
      </tr>
      <tr>
        <td style="font-size:14px; font-weight:bold; color:#000; padding:12px 0 0; text-transform:uppercase; letter-spacing:1px; border-top:1px solid #eee;">Total Paid</td>
        <td style="font-size:14px; font-weight:bold; color:#000; padding:12px 0 0; text-align:right; border-top:1px solid #eee;">${formatMoney(order.totalAmount)}</td>
      </tr>
    </table>

    ${divider}

    <h3 style="text-transform:uppercase; letter-spacing:3px; font-size:10px; color:#92400e; margin-bottom:12px;">
      Shipping Details
    </h3>
    <p style="font-size:13px; color:#333; line-height:1.8; margin:0;">${order.address}</p>
    <p style="font-size:13px; color:#888; margin:4px 0 0;">${order.phone}</p>

    ${divider}

    <p style="font-size:11px; color:#aaa; text-align:center; text-transform:uppercase; letter-spacing:2px;">
      Paystack Ref: ${order.paystackReference || "N/A"}
    </p>

    <div style="text-align:center; margin-top:32px;">
      <a href="${process.env.FRONTEND_URL}/profile"
         style="background:#000; color:#fff; padding:14px 36px; text-decoration:none; text-transform:uppercase; letter-spacing:3px; font-size:10px;">
        Track My Order
      </a>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Order Confirmed — ${orderId} | Ikeyà`,
    html,
    text: `Your order ${orderId} has been confirmed. Total: ${formatMoney(order.totalAmount)}. We'll be in touch soon.`,
  });
};

// ─── New Order Alert Email → Admin ───────────────────────────────────────────

export const sendAdminOrderAlertEmail = async ({ order, customerName, customerEmail }) => {
  const formatMoney = (kobo) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 })
      .format(kobo / 100);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const orderId = `#IKY-${order.id.slice(-8).toUpperCase()}`;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #222; font-size:13px; color:#ddd;">
          ${item.product?.name || "Product"}
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #222; font-size:13px; color:#888; text-align:center;">
          ×${item.quantity}
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #222; font-size:13px; color:#ddd; text-align:right;">
          ${formatMoney(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <div style="background:#111; border:1px solid #333; padding:32px; margin-bottom:24px; border-radius:2px;">
      <p style="text-transform:uppercase; font-size:9px; letter-spacing:3px; color:#f59e0b; margin:0 0 8px;">
        🚨 New Order Received
      </p>
      <h2 style="margin:0; font-size:22px; color:#fff; letter-spacing:2px;">${orderId}</h2>
      <p style="color:#666; font-size:12px; margin:6px 0 0;">${formatDate(order.createdAt)}</p>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      <tr>
        <td style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#888; padding:8px 0;">Customer</td>
        <td style="font-size:13px; color:#333; padding:8px 0; text-align:right; font-weight:bold;">${customerName}</td>
      </tr>
      <tr>
        <td style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#888; padding:8px 0;">Email</td>
        <td style="font-size:13px; color:#333; padding:8px 0; text-align:right;">${customerEmail}</td>
      </tr>
      <tr>
        <td style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#888; padding:8px 0;">Phone</td>
        <td style="font-size:13px; color:#333; padding:8px 0; text-align:right;">${order.phone}</td>
      </tr>
      <tr>
        <td style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#888; padding:8px 0;">Address</td>
        <td style="font-size:13px; color:#333; padding:8px 0; text-align:right;">${order.address}</td>
      </tr>
      <tr>
        <td style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#888; padding:8px 0;">Total Paid</td>
        <td style="font-size:15px; color:#000; padding:8px 0; text-align:right; font-weight:bold;">${formatMoney(order.totalAmount)}</td>
      </tr>
      <tr>
        <td style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#888; padding:8px 0;">Paystack Ref</td>
        <td style="font-size:11px; color:#92400e; padding:8px 0; text-align:right; font-family:monospace;">${order.paystackReference || "N/A"}</td>
      </tr>
    </table>

    ${divider}

    <h3 style="text-transform:uppercase; letter-spacing:3px; font-size:10px; color:#92400e; margin-bottom:16px;">Items Ordered</h3>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left; font-size:9px; text-transform:uppercase; letter-spacing:2px; color:#aaa; padding-bottom:8px;">Item</th>
          <th style="text-align:center; font-size:9px; text-transform:uppercase; letter-spacing:2px; color:#aaa; padding-bottom:8px;">Qty</th>
          <th style="text-align:right; font-size:9px; text-transform:uppercase; letter-spacing:2px; color:#aaa; padding-bottom:8px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="text-align:center; margin-top:32px;">
      <a href="${process.env.FRONTEND_URL}/admin"
         style="background:#92400e; color:#fff; padding:14px 36px; text-decoration:none; text-transform:uppercase; letter-spacing:3px; font-size:10px;">
        View in Dashboard
      </a>
    </div>
  `;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🚨 New Order ${orderId} — ${formatMoney(order.totalAmount)} | Ikeyà`,
    html,
    text: `New order from ${customerName} (${customerEmail}). Amount: ${formatMoney(order.totalAmount)}. Ref: ${order.paystackReference}`,
  });
};

// ─── Legacy stubs kept for backward compatibility ────────────────────────────

export const sendPaymentSuccessEmail = sendOrderReceiptEmail;
export const sendAdminAlertEmail = sendAdminOrderAlertEmail;

// ─── Newsletter Subscriber Welcome → Subscriber ──────────────────────────────

export const sendNewsletterWelcomeEmail = async (email) => {
  const html = `
    <div style="text-align:center; margin-bottom:32px;">
      <p style="text-transform:uppercase; font-size:9px; letter-spacing:3px; color:#92400e; margin-bottom:8px;">
        The Style Club
      </p>
      <h2 style="font-size:24px; letter-spacing:4px; text-transform:uppercase; color:#000; margin:0;">
        Welcome to the Club
      </h2>
    </div>

    <p style="font-size:14px; color:#333; line-height:1.9; text-align:center; max-width:420px; margin:0 auto 32px;">
      You're now part of something rare. Expect early access to seasonal drops,
      exclusive style edits, and professional hair care tips — straight to your inbox.
    </p>

    ${divider}

    <div style="text-align:center; margin:32px 0;">
      <a href="${process.env.FRONTEND_URL}/shop"
         style="background:#000; color:#fff; padding:14px 40px; text-decoration:none;
                text-transform:uppercase; letter-spacing:4px; font-size:10px;">
        Explore the Collection
      </a>
    </div>

    <p style="font-size:11px; color:#bbb; text-align:center; margin-top:24px;">
      You subscribed with <strong>${email}</strong>.
      If this wasn't you, you can safely ignore this email.
    </p>
  `;

  await sendEmail({
    to: email,
    subject: "Welcome to The Style Club — Ikeyà Originals",
    html,
    text: `Welcome to the Ikeyà Style Club! You'll now receive early access to drops and hair care tips. Visit us at ${process.env.FRONTEND_URL}/shop`,
  });
};

// ─── Newsletter Subscriber Alert → Admin ────────────────────────────────────

export const sendAdminNewsletterAlertEmail = async (subscriberEmail) => {
  const html = `
    <div style="background:#111; border:1px solid #333; padding:28px; margin-bottom:24px;">
      <p style="text-transform:uppercase; font-size:9px; letter-spacing:3px; color:#f59e0b; margin:0 0 8px;">
        New Subscriber
      </p>
      <h2 style="margin:0; font-size:20px; color:#fff; letter-spacing:2px;">Style Club</h2>
    </div>

    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#888; padding:10px 0;">
          Subscriber Email
        </td>
        <td style="font-size:13px; color:#333; padding:10px 0; text-align:right; font-weight:bold;">
          ${subscriberEmail}
        </td>
      </tr>
      <tr>
        <td style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#888; padding:10px 0;">
          Date
        </td>
        <td style="font-size:13px; color:#333; padding:10px 0; text-align:right;">
          ${new Date().toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" })}
        </td>
      </tr>
    </table>

    <div style="text-align:center; margin-top:28px;">
      <a href="${process.env.FRONTEND_URL}/admin"
         style="background:#92400e; color:#fff; padding:12px 32px; text-decoration:none;
                text-transform:uppercase; letter-spacing:3px; font-size:10px;">
        View Dashboard
      </a>
    </div>
  `;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Subscriber — ${subscriberEmail} | Ikeyà`,
    html,
    text: `New newsletter subscriber: ${subscriberEmail}`,
  });
};
