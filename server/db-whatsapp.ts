import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  whatsappNotifications,
  notificationSettings,
  InsertWhatsappNotification,
  InsertNotificationSettings,
} from "../drizzle/schema";

/**
 * Criar notificação de WhatsApp
 */
export async function createWhatsAppNotification(
  data: InsertWhatsappNotification
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(whatsappNotifications).values(data);
}

/**
 * Listar notificações de WhatsApp por usuário
 */
export async function getWhatsAppNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(whatsappNotifications)
    .where(eq(whatsappNotifications.userId, userId));
}

/**
 * Obter notificações pendentes para enviar
 */
export async function getPendingNotifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(whatsappNotifications)
    .where(eq(whatsappNotifications.status, "pending"));
}

/**
 * Atualizar status de notificação
 */
export async function updateNotificationStatus(
  notificationId: number,
  status: "sent" | "failed" | "read",
  errorMessage?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(whatsappNotifications)
    .set({
      status,
      sentAt: new Date(),
      errorMessage: errorMessage || null,
    })
    .where(eq(whatsappNotifications.id, notificationId));
}

/**
 * Obter ou criar configurações de notificação do usuário
 */
export async function getOrCreateNotificationSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Criar com valores padrão
  const defaultSettings: InsertNotificationSettings = {
    userId,
    whatsappEnabled: true,
    reminderBefore24h: true,
    reminderBefore1h: true,
    sendConfirmation: true,
    sendCancellation: true,
  };

  await db.insert(notificationSettings).values(defaultSettings);

  return await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, userId))
    .limit(1)
    .then((rows) => rows[0]);
}

/**
 * Atualizar configurações de notificação
 */
export async function updateNotificationSettings(
  userId: number,
  settings: Partial<InsertNotificationSettings>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notificationSettings)
    .set(settings)
    .where(eq(notificationSettings.userId, userId));
}

/**
 * Verificar se já existe notificação enviada para este agendamento
 */
export async function hasNotificationBeenSent(
  appointmentId: number,
  type: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(whatsappNotifications)
    .where(
      and(
        eq(whatsappNotifications.appointmentId, appointmentId),
        eq(whatsappNotifications.type, type as any),
        eq(whatsappNotifications.status, "sent")
      )
    )
    .limit(1);

  return result.length > 0;
}
