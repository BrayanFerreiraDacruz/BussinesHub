import { getDb } from "./db";
import { payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface CreatePaymentRecord {
  userId: number;
  appointmentId?: number;
  clientId: number;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId: string; // ID do Abacatepay
  description?: string;
  paymentMethod?: "cash" | "card" | "pix" | "transfer" | "other";
}

/**
 * Criar registro de pagamento
 */
export async function createPaymentRecord(
  data: CreatePaymentRecord
): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(payments).values({
      userId: data.userId,
      appointmentId: data.appointmentId,
      clientId: data.clientId,
      amount: data.amount.toString(),
      status: data.status,
      transactionId: data.transactionId,
      description: data.description,
      paymentMethod: (data.paymentMethod || "pix") as "cash" | "card" | "pix" | "transfer" | "other",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return (result as any).insertId as number;
  } catch (error) {
    console.error("[DB] Error creating payment record:", error);
    throw error;
  }
}

/**
 * Atualizar status de pagamento
 */
export async function updatePaymentStatus(
  transactionId: string,
  status: "pending" | "completed" | "failed" | "refunded"
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(payments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(payments.transactionId, transactionId));
  } catch (error) {
    console.error("[DB] Error updating payment status:", error);
    throw error;
  }
}

/**
 * Obter pagamento por ID do Abacatepay
 */
export async function getPaymentByTransactionId(transactionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.transactionId, transactionId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[DB] Error getting payment:", error);
    throw error;
  }
}

/**
 * Obter pagamentos de um agendamento
 */
export async function getPaymentsByAppointmentId(appointmentId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.appointmentId, appointmentId));

    return result;
  } catch (error) {
    console.error("[DB] Error getting payments:", error);
    throw error;
  }
}

/**
 * Obter total de pagamentos recebidos
 */
export async function getTotalReceivedPayments(): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.status, "completed"));

    return result.reduce((sum, payment) => {
      const amount = typeof payment.amount === "string" ? parseFloat(payment.amount) : (payment.amount || 0);
      return sum + amount;
    }, 0);
  } catch (error) {
    console.error("[DB] Error getting total payments:", error);
    return 0;
  }
}
