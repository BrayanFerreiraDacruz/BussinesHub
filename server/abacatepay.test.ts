import { describe, it, expect, beforeEach, vi } from "vitest";
import { validateWebhook, parseWebhookPayload } from "./abacatepay";
import crypto from "crypto";

describe("Abacatepay - Webhook Validation", () => {
  const WEBHOOK_SECRET = "webh_dev_AyfKxCmw2XCZTh2NKAyCsnmE";

  beforeEach(() => {
    process.env.ABACATEPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  it("should validate webhook with correct signature", () => {
    const payload = JSON.stringify({
      id: "evt_123",
      event: "payment.completed",
      payment: {
        id: "pay_123",
        status: "completed",
        amount: 10000,
        customer: { name: "John Doe", email: "john@example.com" },
      },
    });

    const signature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const isValid = validateWebhook(payload, signature);
    expect(isValid).toBe(true);
  });

  it("should reject webhook with invalid signature", () => {
    const payload = JSON.stringify({
      id: "evt_123",
      event: "payment.completed",
      payment: {
        id: "pay_123",
        status: "completed",
        amount: 10000,
        customer: { name: "John Doe", email: "john@example.com" },
      },
    });

    const invalidSignature = "invalid_signature_12345";

    const isValid = validateWebhook(payload, invalidSignature);
    expect(isValid).toBe(false);
  });

  it("should parse webhook payload correctly", () => {
    const body = {
      id: "evt_123",
      event: "payment.completed",
      payment: {
        id: "pay_123",
        status: "completed",
        amount: 10000,
        customer: { name: "John Doe", email: "john@example.com" },
        metadata: { appointmentId: 1, clientId: 2 },
      },
    };

    const parsed = parseWebhookPayload(body);

    expect(parsed.id).toBe("evt_123");
    expect(parsed.event).toBe("payment.completed");
    expect(parsed.payment.id).toBe("pay_123");
    expect(parsed.payment.status).toBe("completed");
    expect(parsed.payment.amount).toBe(10000);
    expect(parsed.payment.metadata?.appointmentId).toBe(1);
  });

  it("should handle payment.failed event", () => {
    const body = {
      id: "evt_456",
      event: "payment.failed",
      payment: {
        id: "pay_456",
        status: "failed",
        amount: 5000,
        customer: { name: "Jane Doe", email: "jane@example.com" },
      },
    };

    const parsed = parseWebhookPayload(body);

    expect(parsed.event).toBe("payment.failed");
    expect(parsed.payment.status).toBe("failed");
  });

  it("should handle payment.pending event", () => {
    const body = {
      id: "evt_789",
      event: "payment.pending",
      payment: {
        id: "pay_789",
        status: "pending",
        amount: 15000,
        customer: { name: "Bob Smith", email: "bob@example.com" },
      },
    };

    const parsed = parseWebhookPayload(body);

    expect(parsed.event).toBe("payment.pending");
    expect(parsed.payment.status).toBe("pending");
  });

  it("should reject webhook when WEBHOOK_SECRET is not configured", () => {
    process.env.ABACATEPAY_WEBHOOK_SECRET = "";

    const payload = JSON.stringify({ id: "evt_123", event: "payment.completed" });
    const signature = "any_signature";

    const isValid = validateWebhook(payload, signature);
    expect(isValid).toBe(false);
  });
});
