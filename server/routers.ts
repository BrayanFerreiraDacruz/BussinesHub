import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sdk } from "./_core/sdk";
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
  getUserByEmail,
  getUserById,
  upsertUser,
  } from "./db";import {
  getOrCreateNotificationSettings,
  updateNotificationSettings,
  getWhatsAppNotifications,
} from "./db-whatsapp";
import { sendWhatsAppMessage, getWhatsAppStatus } from "./whatsapp";
import { sendConfirmation, sendCancellation } from "./jobs";
import { createPaymentLink } from "./abacatepay";
import { createPaymentRecord, updatePaymentStatus, getPaymentByTransactionId, getTotalReceivedPayments } from "./db-abacatepay";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new Error("Usuário já existe");
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        const openId = nanoid();

        await upsertUser({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          openId: openId,
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name: input.name,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.password) {
          throw new Error("Credenciais inválidas");
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Credenciais inválidas");
        }

        const sessionToken = await sdk.createSessionToken(user.openId!, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true };
      }),

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
        const result = await createAppointment({
          userId: ctx.user.id,
          ...input,
        });
        // Enviar confirmação via WhatsApp
        if (result && "id" in result && result.id) {
          sendConfirmation(result.id).catch((error) => {
            console.error("Error sending confirmation:", error);
          });
        }
        return result;
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
        const result = await updateAppointment(id, data);
        // Enviar notificação de cancelamento se status mudou para cancelled
        if (data.status === "cancelled") {
          sendCancellation(id).catch((error) => {
            console.error("Error sending cancellation:", error);
          });
        }
        return result;
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

  // Public Booking
  booking: router({
    getProvider: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await getUserById(input.userId);
        if (!user) throw new Error("Prestador não encontrado");
        const services = await getServicesByUserId(input.userId);
        return {
          name: user.businessName || user.name,
          services: services.filter(s => s.isActive),
        };
      }),

    getAvailableSlots: publicProcedure
      .input(z.object({
        userId: z.number(),
        serviceId: z.number(),
        date: z.date(),
      }))
      .query(async ({ input }) => {
        const service = await getServiceById(input.serviceId);
        if (!service) throw new Error("Serviço não encontrado");

        const appointments = await getAppointmentsByUserId(input.userId);
        const dayStart = new Date(input.date);
        dayStart.setHours(9, 0, 0, 0); // Horário padrão de abertura
        const dayEnd = new Date(input.date);
        dayEnd.setHours(18, 0, 0, 0); // Horário padrão de fechamento

        const slots = [];
        let current = new Date(dayStart);

        while (current.getTime() + service.duration * 60000 <= dayEnd.getTime()) {
          const slotEnd = new Date(current.getTime() + service.duration * 60000);
          
          const isOccupied = appointments.some(apt => {
            const aptStart = new Date(apt.startTime).getTime();
            const aptEnd = new Date(apt.endTime).getTime();
            const curStart = current.getTime();
            const curEnd = slotEnd.getTime();
            return (curStart < aptEnd && curEnd > aptStart) && apt.status !== "cancelled";
          });

          if (!isOccupied && current.getTime() > Date.now()) {
            slots.push(new Date(current));
          }
          current = new Date(current.getTime() + 30 * 60000); // Intervalos de 30min
        }

        return slots;
      }),

    submit: publicProcedure
      .input(z.object({
        userId: z.number(),
        serviceId: z.number(),
        startTime: z.date(),
        clientName: z.string().min(1),
        clientPhone: z.string().min(1),
        clientEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const service = await getServiceById(input.serviceId);
        if (!service) throw new Error("Serviço não encontrado");

        // 1. Upsert Client (pelo telefone)
        // Nota: Simplificado para este exemplo, ideal seria buscar por userId + phone
        const existingClients = await getClientsByUserId(input.userId);
        let client = existingClients.find(c => c.phone === input.clientPhone);

        if (!client) {
          const result = await createClient({
            userId: input.userId,
            name: input.clientName,
            phone: input.clientPhone,
            email: input.clientEmail,
          });
          const clients = await getClientsByUserId(input.userId);
          client = clients[clients.length - 1]; // Pega o último criado
        }

        // 2. Criar Agendamento
        const endTime = new Date(input.startTime.getTime() + service.duration * 60000);
        const appointment = await createAppointment({
          userId: input.userId,
          clientId: client!.id,
          serviceId: input.serviceId,
          startTime: input.startTime,
          endTime: endTime,
          status: "scheduled",
          price: service.price,
        });

        // 3. Notificar via WhatsApp (se houver ID)
        if (appointment && "id" in appointment) {
          sendConfirmation(appointment.id).catch(console.error);
        }

        return { success: true };
      }),
  }),

  // Abacatepay - Pagamentos
  abacatepay: router({
    createLink: protectedProcedure
      .input(
        z.object({
          appointmentId: z.number(),
          clientId: z.number(),
          amount: z.number(),
          description: z.string(),
          customerName: z.string(),
          customerEmail: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Validar valores
          if (input.amount <= 0) {
            throw new Error("Valor do pagamento deve ser maior que zero");
          }

          if (!input.customerName || !input.customerEmail) {
            throw new Error("Nome e email do cliente sao obrigatorios");
          }

          console.log("[API] Creating payment link:", {
            amount: Math.round(input.amount * 100),
            customerName: input.customerName,
            customerEmail: input.customerEmail,
          });

          const paymentLink = await createPaymentLink({
            amount: Math.round(input.amount * 100),
            description: input.description,
            customer: {
              name: input.customerName,
              email: input.customerEmail,
            },
            metadata: {
              appointmentId: input.appointmentId,
              clientId: input.clientId,
            },
          });

          console.log("[API] Payment link created:", paymentLink);

          await createPaymentRecord({
            userId: ctx.user.id,
            appointmentId: input.appointmentId,
            clientId: input.clientId,
            amount: input.amount,
            status: "pending",
            transactionId: paymentLink.id,
            description: input.description,
            paymentMethod: "pix",
          });

          return {
            success: true,
            paymentUrl: paymentLink.paymentUrl,
            paymentId: paymentLink.id,
          };
        } catch (error: any) {
          const errorMessage = error?.message || "Erro ao criar link de pagamento";
          console.error("[API] Error creating payment link:", errorMessage);
          throw new Error(errorMessage);
        }
      }),

    getStatus: protectedProcedure
      .input(z.object({ transactionId: z.string() }))
      .query(async ({ input }) => {
        try {
          const payment = await getPaymentByTransactionId(input.transactionId);
          return payment || { status: "not_found" };
        } catch (error) {
          console.error("[API] Error getting payment status:", error);
          throw new Error("Failed to get payment status");
        }
      }),

    getTotalReceived: protectedProcedure.query(async ({ ctx }) => {
      try {
        const total = await getTotalReceivedPayments();
        return { total };
      } catch (error) {
        console.error("[API] Error getting total received:", error);
        return { total: 0 };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
