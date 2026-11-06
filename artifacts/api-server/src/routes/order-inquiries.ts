import { Router, type IRouter } from "express";
import {
  CreateOrderInquiryBody,
  CreateOrderInquiryResponse,
} from "@workspace/api-zod";
import { sendOrderInquiryEmail } from "../lib/order-inquiry-email";

const router: IRouter = Router();
const rateLimitWindowMs = 15 * 60 * 1000;
const maxInquiriesPerWindow = 5;
const maxTrackedVisitors = 5000;
const visitorAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(visitorIp: string): boolean {
  const now = Date.now();
  for (const [ip, attempt] of visitorAttempts) {
    if (attempt.resetAt <= now) visitorAttempts.delete(ip);
  }

  const current = visitorAttempts.get(visitorIp);
  if (!current) {
    if (visitorAttempts.size >= maxTrackedVisitors) return true;
    visitorAttempts.set(visitorIp, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return false;
  }

  if (current.count >= maxInquiriesPerWindow) return true;
  current.count += 1;
  return false;
}

router.post("/order-inquiries", async (req, res): Promise<void> => {
  const origin = req.get("origin");
  const host = req.get("host");
  if (!origin || !host) {
    res.status(403).json({ error: "Submit this request from the store page." });
    return;
  }

  try {
    const originUrl = new URL(origin);
    const requestHost = new URL(`${originUrl.protocol}//${host}`).host.toLowerCase();
    if (originUrl.host.toLowerCase() !== requestHost) {
      res.status(403).json({ error: "Submit this request from the store page." });
      return;
    }
  } catch {
    res.status(403).json({ error: "Submit this request from the store page." });
    return;
  }

  if (!req.is("application/json")) {
    res.status(415).json({ error: "Send the request as JSON." });
    return;
  }

  if (isRateLimited(req.ip || "unknown")) {
    res.status(429).json({
      error: "Too many requests. Please wait before trying again.",
    });
    return;
  }

  const parsed = CreateOrderInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the required fields and try again." });
    return;
  }

  if (!parsed.data.consent) {
    res.status(400).json({
      error: "Consent is required before sending your order request.",
    });
    return;
  }

  try {
    const response = await sendOrderInquiryEmail(parsed.data);
    if (!response.ok) {
      req.log.error(
        { statusCode: response.status },
        "Gmail could not send the order inquiry",
      );
      res.status(503).json({
        error: "Your request could not be sent. Please try again later.",
      });
      return;
    }
  } catch {
    req.log.error("Order inquiry email delivery failed");
    res.status(503).json({
      error: "Your request could not be sent. Please try again later.",
    });
    return;
  }

  res.status(202).json(
    CreateOrderInquiryResponse.parse({
      ok: true,
      message: "Your order request was sent to the store.",
    }),
  );
});

export default router;
