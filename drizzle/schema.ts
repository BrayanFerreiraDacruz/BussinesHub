import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  datetime
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Represents the business owner/admin.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  businessName: text("businessName"), // Nome do negócio (salão, clínica, consultório)
  businessType: mysqlEnum("businessType", ["salon", "clinic", "consulting", "other"]).default("salon"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clientes - CRM
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK para users
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  birthDate: datetime("birthDate"),
  notes: text("notes"), // Notas sobre o cliente
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0"),
  lastVisit: datetime("lastVisit"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Serviços - Catálogo
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK para users
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: int("duration").notNull(), // Duração em minutos
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Agendamentos
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK para users
  clientId: int("clientId").notNull(), // FK para clients
  serviceId: int("serviceId").notNull(), // FK para services
  startTime: datetime("startTime").notNull(),
  endTime: datetime("endTime").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled"),
  notes: text("notes"),
  price: decimal("price", { precision: 10, scale: 2 }), // Preço no momento do agendamento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Pagamentos/Faturamento
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK para users
  appointmentId: int("appointmentId"), // FK para appointments (opcional, pode ter pagamentos sem agendamento)
  clientId: int("clientId").notNull(), // FK para clients
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "pix", "transfer", "other"]).default("cash"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  description: text("description"),
  transactionId: varchar("transactionId", { length: 255 }), // Para integração com Stripe/PIX
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Histórico de atendimentos (para CRM)
 * Relaciona clientes com agendamentos completados
 */
export const visitHistory = mysqlTable("visitHistory", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(), // FK para clients
  appointmentId: int("appointmentId").notNull(), // FK para appointments
  serviceId: int("serviceId").notNull(), // FK para services
  notes: text("notes"), // Notas do atendimento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VisitHistory = typeof visitHistory.$inferSelect;
export type InsertVisitHistory = typeof visitHistory.$inferInsert;

/**
 * Notificações de email enviadas
 */
export const emailNotifications = mysqlTable("emailNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK para users
  appointmentId: int("appointmentId").notNull(), // FK para appointments
  clientId: int("clientId").notNull(), // FK para clients
  type: mysqlEnum("type", ["confirmation", "reminder", "cancellation"]).default("confirmation"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "failed", "bounced"]).default("sent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;

/**
 * Notificações de WhatsApp enviadas
 */
export const whatsappNotifications = mysqlTable("whatsappNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  appointmentId: int("appointmentId").notNull(),
  clientId: int("clientId").notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }).notNull(),
  type: mysqlEnum("type", ["confirmation", "reminder_24h", "reminder_1h", "cancellation"]).default("confirmation"),
  message: text("message"),
  sentAt: timestamp("sentAt"),
  status: mysqlEnum("status", ["pending", "sent", "failed", "read"]).default("pending"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhatsappNotification = typeof whatsappNotifications.$inferSelect;
export type InsertWhatsappNotification = typeof whatsappNotifications.$inferInsert;

/**
 * Configurações de notificação do usuário
 */
export const notificationSettings = mysqlTable("notificationSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  whatsappEnabled: boolean("whatsappEnabled").default(true),
  reminderBefore24h: boolean("reminderBefore24h").default(true),
  reminderBefore1h: boolean("reminderBefore1h").default(true),
  sendConfirmation: boolean("sendConfirmation").default(true),
  sendCancellation: boolean("sendCancellation").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;
