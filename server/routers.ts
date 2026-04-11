import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getClientsByUserId,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getServicesByUserId,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAppointmentsByUserId,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPaymentsByUserId,
  createPayment,
  updatePayment,
} from "./db";
import {
  getOrCreateNotificationSettings,
  updateNotificationSettings,
  getWhatsAppNotifications,
} from "./db-whatsapp";
import { sendWhatsAppMessage, getWhatsAppStatus } from "./whatsapp";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Clients (CRM)
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getClientsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getClientById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().min(1),
          birthDate: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createClient({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          birthDate: z.date().optional(),
          notes: z.string().optional(),
          totalSpent: z.string().optional(),
          lastVisit: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateClient(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteClient(input.id);
      }),
  }),

  // Services
  services: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getServicesByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getServiceById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          price: z.string().min(1),
          duration: z.number().min(1),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createService({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          duration: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateService(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteService(input.id);
      }),
  }),

  // Appointments
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getAppointmentsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getAppointmentById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          serviceId: z.number(),
          startTime: z.date(),
          endTime: z.date(),
          notes: z.string().optional(),
          status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
          price: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createAppointment({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          clientId: z.number().optional(),
          serviceId: z.number().optional(),
          startTime: z.date().optional(),
          endTime: z.date().optional(),
          notes: z.string().optional(),
          status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
          price: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateAppointment(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteAppointment(input.id);
      }),
  }),

  // Payments
  payments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getPaymentsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          appointmentId: z.number().optional(),
          clientId: z.number(),
          amount: z.string().min(1),
          paymentMethod: z.enum(["cash", "card", "pix", "transfer", "other"]).optional(),
          status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
          description: z.string().optional(),
          transactionId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createPayment({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updatePayment(id, data);
      }),
  }),

  // Dashboard
  dashboard: router({
    metrics: protectedProcedure.query(async ({ ctx }) => {
      const appointments = await getAppointmentsByUserId(ctx.user.id);
      const clients = await getClientsByUserId(ctx.user.id);
      const payments = await getPaymentsByUserId(ctx.user.id);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });

      const totalRevenue = payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      return {
        totalClients: clients.length,
        totalAppointments: appointments.length,
        todayAppointments: todayAppointments.length,
        totalRevenue,
        completedAppointments: appointments.filter((a) => a.status === "completed").length,
        pendingAppointments: appointments.filter((a) => a.status === "scheduled").length,
      };
    }),

    upcomingAppointments: protectedProcedure.query(async ({ ctx }) => {
      const appointments = await getAppointmentsByUserId(ctx.user.id);
      const now = new Date();
      return appointments
        .filter((apt) => new Date(apt.startTime) >= now && apt.status === "scheduled")
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 10);
    }),
  }),

  whatsapp: router({
    status: protectedProcedure.query(() => {
      return getWhatsAppStatus();
    }),

    sendTest: protectedProcedure
      .input(z.object({ phoneNumber: z.string(), message: z.string() }))
      .mutation(async ({ input }) => {
        const result = await sendWhatsAppMessage(input.phoneNumber, input.message);
        return result;
      }),

    settings: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreateNotificationSettings(ctx.user.id);
    }),

    updateSettings: protectedProcedure
      .input(
        z.object({
          whatsappEnabled: z.boolean().optional(),
          reminderBefore24h: z.boolean().optional(),
          reminderBefore1h: z.boolean().optional(),
          sendConfirmation: z.boolean().optional(),
          sendCancellation: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateNotificationSettings(ctx.user.id, input);
        return { success: true };
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      return await getWhatsAppNotifications(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
