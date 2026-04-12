import { Request, Response } from "express";
import { validateWebhook, parseWebhookPayload } from "./abacatepay";
import { updatePaymentStatus, getPaymentByTransactionId } from "./db-abacatepay";
import { updateAppointment } from "./db";

/**
 * Webhook handler para Abacatepay
 * Recebe confirmações de pagamento e atualiza o status
 */
export async function handleAbacatepayWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validar assinatura do webhook
    const signature = req.headers["x-abacatepay-signature"] as string;
    const payload = JSON.stringify(req.body);

    if (!validateWebhook(payload, signature)) {
      console.warn("[Webhook] Invalid signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    // Parsear payload
    const webhook = parseWebhookPayload(req.body);

    console.log(`[Webhook] Received event: ${webhook.event} for payment ${webhook.payment.id}`);

    // Processar eventos
    switch (webhook.event) {
      case "payment.completed":
        await handlePaymentCompleted(webhook);
        break;

      case "payment.failed":
        await handlePaymentFailed(webhook);
        break;

      case "payment.pending":
        await handlePaymentPending(webhook);
        break;

      default:
        console.warn(`[Webhook] Unknown event: ${webhook.event}`);
    }

    // Retornar sucesso
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Processar pagamento completado
 */
async function handlePaymentCompleted(webhook: any): Promise<void> {
  try {
    const { payment } = webhook;

    // Atualizar status do pagamento no banco de dados
    await updatePaymentStatus(payment.id, "completed");

    // Se houver appointmentId nos metadados, marcar agendamento como concluído
    if (payment.metadata?.appointmentId) {
      await updateAppointment(payment.metadata.appointmentId, {
        status: "completed",
      });
      console.log(`[Webhook] Appointment ${payment.metadata.appointmentId} marked as completed`);
    }

    console.log(`[Webhook] Payment ${payment.id} completed successfully`);
  } catch (error) {
    console.error("[Webhook] Error handling payment completed:", error);
    throw error;
  }
}

/**
 * Processar pagamento falhado
 */
async function handlePaymentFailed(webhook: any): Promise<void> {
  try {
    const { payment } = webhook;

    // Atualizar status do pagamento
    await updatePaymentStatus(payment.id, "failed");

    console.log(`[Webhook] Payment ${payment.id} failed`);
  } catch (error) {
    console.error("[Webhook] Error handling payment failed:", error);
    throw error;
  }
}

/**
 * Processar pagamento pendente
 */
async function handlePaymentPending(webhook: any): Promise<void> {
  try {
    const { payment } = webhook;

    // Atualizar status do pagamento
    await updatePaymentStatus(payment.id, "pending");

    console.log(`[Webhook] Payment ${payment.id} pending`);
  } catch (error) {
    console.error("[Webhook] Error handling payment pending:", error);
    throw error;
  }
}
