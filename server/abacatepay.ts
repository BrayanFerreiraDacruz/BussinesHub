import axios from "axios";
import crypto from "crypto";

const ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";
const API_KEY = process.env.ABACATEPAY_API_KEY;
const WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET;

interface CreatePaymentRequest {
  amount: number; // em centavos (ex: 10000 = R$ 100.00)
  description: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  metadata?: {
    appointmentId?: number;
    clientId?: number;
    serviceId?: number;
  };
}

interface AbacatepayResponse {
  id: string;
  status: string;
  amount: number;
  paymentUrl: string;
  createdAt: string;
}

/**
 * Criar link de pagamento no Abacatepay
 */
export async function createPaymentLink(
  request: CreatePaymentRequest
): Promise<AbacatepayResponse> {
  if (!API_KEY) {
    throw new Error("ABACATEPAY_API_KEY not configured");
  }

  try {
    const response = await axios.post(
      `${ABACATEPAY_API_URL}/payments`,
      {
        amount: request.amount,
        description: request.description,
        customer: request.customer,
        metadata: request.metadata,
        returnUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/agendamentos`,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount,
      paymentUrl: response.data.paymentUrl,
      createdAt: response.data.createdAt,
    };
  } catch (error) {
    console.error("[Abacatepay] Error creating payment:", error);
    throw new Error("Failed to create payment link");
  }
}

/**
 * Validar webhook do Abacatepay
 */
export function validateWebhook(
  payload: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("[Abacatepay] WEBHOOK_SECRET not configured");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

/**
 * Processar webhook de pagamento
 */
export interface WebhookPayload {
  id: string;
  event: "payment.completed" | "payment.failed" | "payment.pending";
  payment: {
    id: string;
    status: string;
    amount: number;
    customer: {
      name: string;
      email: string;
    };
    metadata?: {
      appointmentId?: number;
      clientId?: number;
      serviceId?: number;
    };
  };
}

export function parseWebhookPayload(body: any): WebhookPayload {
  return {
    id: body.id,
    event: body.event,
    payment: {
      id: body.payment.id,
      status: body.payment.status,
      amount: body.payment.amount,
      customer: body.payment.customer,
      metadata: body.payment.metadata,
    },
  };
}

/**
 * Obter status de um pagamento
 */
export async function getPaymentStatus(paymentId: string): Promise<any> {
  if (!API_KEY) {
    throw new Error("ABACATEPAY_API_KEY not configured");
  }

  try {
    const response = await axios.get(
      `${ABACATEPAY_API_URL}/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[Abacatepay] Error getting payment status:", error);
    throw new Error("Failed to get payment status");
  }
}
