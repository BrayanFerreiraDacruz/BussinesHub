import { getDb } from "./db";
import { appointments, clients, users } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendWhatsAppMessage } from "./whatsapp";
import {
  getOrCreateNotificationSettings,
  createWhatsAppNotification,
  hasNotificationBeenSent,
  updateNotificationStatus,
} from "./db-whatsapp";

/**
 * Job para enviar lembretes 24h antes do agendamento
 */
export async function sendReminders24h() {
  const db = await getDb();
  if (!db) {
    console.log("[Jobs] Database not available");
    return;
  }

  try {
    console.log("[Jobs] Starting 24h reminder job...");

    // Calcular horário: próximas 24h + 1h (para pegar agendamentos que começam em ~24h)
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Buscar agendamentos que começam em ~24h
    const appointmentsToRemind = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, in24h),
          lte(appointments.startTime, in25h),
          eq(appointments.status, "scheduled")
        )
      );

    console.log(`[Jobs] Found ${appointmentsToRemind.length} appointments for 24h reminder`);

    for (const appointment of appointmentsToRemind) {
      try {
        // Verificar se já foi enviado
        const alreadySent = await hasNotificationBeenSent(appointment.id, "reminder_24h");
        if (alreadySent) {
          console.log(`[Jobs] Reminder already sent for appointment ${appointment.id}`);
          continue;
        }

        // Obter dados do cliente
        const client = await db
          .select()
          .from(clients)
          .where(eq(clients.id, appointment.clientId))
          .limit(1)
          .then((rows) => rows[0]);

        if (!client || !client.phone) {
          console.log(`[Jobs] Client ${appointment.clientId} has no phone number`);
          continue;
        }

        // Obter configurações do usuário
        const settings = await getOrCreateNotificationSettings(appointment.userId);
        if (!settings.whatsappEnabled || !settings.reminderBefore24h) {
          console.log(`[Jobs] Reminders disabled for user ${appointment.userId}`);
          continue;
        }

        // Preparar mensagem
        const appointmentDate = new Date(appointment.startTime).toLocaleString("pt-BR");
        const message = `Olá ${client.name}! 👋\n\nLembrete: Você tem um agendamento conosco amanhã às ${appointmentDate}.\n\nConfirme sua presença ou cancele se necessário.\n\nObrigado! 😊`;

        // Enviar mensagem
        const result = await sendWhatsAppMessage(client.phone, message);

        // Registrar notificação
        await createWhatsAppNotification({
          userId: appointment.userId,
          appointmentId: appointment.id,
          clientId: appointment.clientId,
          clientPhone: client.phone,
          type: "reminder_24h",
          message,
          status: result.success ? "sent" : "failed",
          errorMessage: result.error || null,
          sentAt: new Date(),
        });

        if (result.success) {
          console.log(
            `[Jobs] ✓ Sent 24h reminder to ${client.phone} for appointment ${appointment.id}`
          );
        } else {
          console.log(
            `[Jobs] ✗ Failed to send 24h reminder to ${client.phone}: ${result.error}`
          );
        }
      } catch (error) {
        console.error(`[Jobs] Error processing appointment ${appointment.id}:`, error);
      }
    }

    console.log("[Jobs] 24h reminder job completed");
  } catch (error) {
    console.error("[Jobs] Error in 24h reminder job:", error);
  }
}

/**
 * Job para enviar lembretes 1h antes do agendamento
 */
export async function sendReminders1h() {
  const db = await getDb();
  if (!db) {
    console.log("[Jobs] Database not available");
    return;
  }

  try {
    console.log("[Jobs] Starting 1h reminder job...");

    // Calcular horário: próxima 1h + 5min (para pegar agendamentos que começam em ~1h)
    const now = new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);
    const in1h5min = new Date(now.getTime() + 65 * 60 * 1000);

    // Buscar agendamentos que começam em ~1h
    const appointmentsToRemind = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, in1h),
          lte(appointments.startTime, in1h5min),
          eq(appointments.status, "scheduled")
        )
      );

    console.log(`[Jobs] Found ${appointmentsToRemind.length} appointments for 1h reminder`);

    for (const appointment of appointmentsToRemind) {
      try {
        // Verificar se já foi enviado
        const alreadySent = await hasNotificationBeenSent(appointment.id, "reminder_1h");
        if (alreadySent) {
          console.log(`[Jobs] Reminder already sent for appointment ${appointment.id}`);
          continue;
        }

        // Obter dados do cliente
        const client = await db
          .select()
          .from(clients)
          .where(eq(clients.id, appointment.clientId))
          .limit(1)
          .then((rows) => rows[0]);

        if (!client || !client.phone) {
          console.log(`[Jobs] Client ${appointment.clientId} has no phone number`);
          continue;
        }

        // Obter configurações do usuário
        const settings = await getOrCreateNotificationSettings(appointment.userId);
        if (!settings.whatsappEnabled || !settings.reminderBefore1h) {
          console.log(`[Jobs] Reminders disabled for user ${appointment.userId}`);
          continue;
        }

        // Preparar mensagem
        const appointmentTime = new Date(appointment.startTime).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const message = `Olá ${client.name}! ⏰\n\nSeu agendamento começa em 1 hora (${appointmentTime}).\n\nEstamos prontos para recebê-lo! 🎉`;

        // Enviar mensagem
        const result = await sendWhatsAppMessage(client.phone, message);

        // Registrar notificação
        await createWhatsAppNotification({
          userId: appointment.userId,
          appointmentId: appointment.id,
          clientId: appointment.clientId,
          clientPhone: client.phone,
          type: "reminder_1h",
          message,
          status: result.success ? "sent" : "failed",
          errorMessage: result.error || null,
          sentAt: new Date(),
        });

        if (result.success) {
          console.log(
            `[Jobs] ✓ Sent 1h reminder to ${client.phone} for appointment ${appointment.id}`
          );
        } else {
          console.log(
            `[Jobs] ✗ Failed to send 1h reminder to ${client.phone}: ${result.error}`
          );
        }
      } catch (error) {
        console.error(`[Jobs] Error processing appointment ${appointment.id}:`, error);
      }
    }

    console.log("[Jobs] 1h reminder job completed");
  } catch (error) {
    console.error("[Jobs] Error in 1h reminder job:", error);
  }
}

/**
 * Job para enviar confirmações quando agendamento é criado
 */
export async function sendConfirmation(appointmentId: number) {
  const db = await getDb();
  if (!db) {
    console.log("[Jobs] Database not available");
    return;
  }

  try {
    console.log(`[Jobs] Sending confirmation for appointment ${appointmentId}...`);

    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!appointment) {
      console.log(`[Jobs] Appointment ${appointmentId} not found`);
      return;
    }

    // Obter dados do cliente
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, appointment.clientId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!client || !client.phone) {
      console.log(`[Jobs] Client has no phone number`);
      return;
    }

    // Obter configurações do usuário
    const settings = await getOrCreateNotificationSettings(appointment.userId);
    if (!settings.whatsappEnabled || !settings.sendConfirmation) {
      console.log(`[Jobs] Confirmations disabled for user ${appointment.userId}`);
      return;
    }

    // Preparar mensagem
    const appointmentDate = new Date(appointment.startTime).toLocaleString("pt-BR");
    const message = `Olá ${client.name}! 🎉\n\nSeu agendamento foi confirmado!\n\n📅 Data: ${appointmentDate}\n\nObrigado por escolher nossos serviços! 😊`;

    // Enviar mensagem
    const result = await sendWhatsAppMessage(client.phone, message);

    // Registrar notificação
    await createWhatsAppNotification({
      userId: appointment.userId,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      clientPhone: client.phone,
      type: "confirmation",
      message,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error || null,
      sentAt: new Date(),
    });

    if (result.success) {
      console.log(`[Jobs] ✓ Sent confirmation to ${client.phone}`);
    } else {
      console.log(`[Jobs] ✗ Failed to send confirmation: ${result.error}`);
    }
  } catch (error) {
    console.error(`[Jobs] Error sending confirmation:`, error);
  }
}

/**
 * Job para enviar notificação de cancelamento
 */
export async function sendCancellation(appointmentId: number) {
  const db = await getDb();
  if (!db) {
    console.log("[Jobs] Database not available");
    return;
  }

  try {
    console.log(`[Jobs] Sending cancellation notification for appointment ${appointmentId}...`);

    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!appointment) {
      console.log(`[Jobs] Appointment ${appointmentId} not found`);
      return;
    }

    // Obter dados do cliente
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, appointment.clientId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!client || !client.phone) {
      console.log(`[Jobs] Client has no phone number`);
      return;
    }

    // Obter configurações do usuário
    const settings = await getOrCreateNotificationSettings(appointment.userId);
    if (!settings.whatsappEnabled || !settings.sendCancellation) {
      console.log(`[Jobs] Cancellations disabled for user ${appointment.userId}`);
      return;
    }

    // Preparar mensagem
    const appointmentDate = new Date(appointment.startTime).toLocaleString("pt-BR");
    const message = `Olá ${client.name}! 📢\n\nInformamos que seu agendamento de ${appointmentDate} foi cancelado.\n\nSe tiver dúvidas, entre em contato conosco. Obrigado! 😊`;

    // Enviar mensagem
    const result = await sendWhatsAppMessage(client.phone, message);

    // Registrar notificação
    await createWhatsAppNotification({
      userId: appointment.userId,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      clientPhone: client.phone,
      type: "cancellation",
      message,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error || null,
      sentAt: new Date(),
    });

    if (result.success) {
      console.log(`[Jobs] ✓ Sent cancellation to ${client.phone}`);
    } else {
      console.log(`[Jobs] ✗ Failed to send cancellation: ${result.error}`);
    }
  } catch (error) {
    console.error(`[Jobs] Error sending cancellation:`, error);
  }
}

/**
 * Iniciar jobs agendados
 */
export function startScheduledJobs() {
  console.log("[Jobs] Starting scheduled jobs...");

  // Job a cada 5 minutos para lembretes de 24h
  setInterval(() => {
    sendReminders24h().catch((error) => {
      console.error("[Jobs] Error in 24h reminder job:", error);
    });
  }, 5 * 60 * 1000); // 5 minutos

  // Job a cada 1 minuto para lembretes de 1h
  setInterval(() => {
    sendReminders1h().catch((error) => {
      console.error("[Jobs] Error in 1h reminder job:", error);
    });
  }, 1 * 60 * 1000); // 1 minuto

  console.log("[Jobs] Scheduled jobs started successfully");
}
