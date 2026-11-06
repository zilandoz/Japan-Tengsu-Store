import { ReplitConnectors } from "@replit/connectors-sdk";
import type { OrderInquiryInput } from "@workspace/api-zod";
import { calculatePackPrice, unitPriceUsd } from "./order-pricing";

const connectors = new ReplitConnectors();

function cleanSingleLine(value: string): string {
  return value.replace(/[\r\n\0]/g, " ").trim();
}

export async function sendOrderInquiryEmail(
  inquiry: OrderInquiryInput,
): Promise<Response> {
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new Error("Order notification inbox is not configured.");
  }

  const phone = inquiry.phone ? cleanSingleLine(inquiry.phone) : "Not provided";
  const message = inquiry.message?.trim() || "No additional message";
  const pricing = calculatePackPrice(inquiry.bottleCount);
  const body = [
    "A new Japan Tengsu order request was submitted.",
    "",
    `Bottle quantity: ${inquiry.bottleCount}`,
    `Unit price: USD $${unitPriceUsd.toFixed(2)}`,
    `Subtotal before discount: USD $${pricing.regularPriceUsd.toFixed(2)}`,
    `Volume discount: ${pricing.discountPercent}% (-USD $${pricing.savingsUsd.toFixed(2)})`,
    `Pack total before delivery: USD $${pricing.totalPriceUsd.toFixed(2)}`,
    "",
    `Customer name: ${cleanSingleLine(inquiry.name)}`,
    `Customer email: ${cleanSingleLine(inquiry.email)}`,
    `Phone or WhatsApp: ${phone}`,
    "",
    "Customer message:",
    message,
    "",
    "The customer consented to sending these details to the store by email.",
    "This is an inquiry only; no payment was taken and no order is confirmed.",
  ].join("\r\n");
  const encodedBody = Buffer.from(body, "utf8").toString("base64");
  const messageLines = encodedBody.match(/.{1,76}/g)?.join("\r\n") ?? "";
  const rawMessage = [
    `To: ${recipient}`,
    `Reply-To: ${cleanSingleLine(inquiry.email)}`,
    "Subject: New Japan Tengsu order inquiry",
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    messageLines,
  ].join("\r\n");
  const raw = Buffer.from(rawMessage, "utf8").toString("base64url");

  return connectors.proxy(
    "google-mail",
    "/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    },
  );
}
