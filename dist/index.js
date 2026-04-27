// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  cookieSecret: process.env.JWT_SECRET || process.env.COOKIE_SECRET || "default_secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.FORGE_API_URL || process.env.BUILT_IN_FORGE_API_URL || "",
  forgeApiKey: process.env.FORGE_API_KEY || process.env.BUILT_IN_FORGE_API_KEY || ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
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
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  // Mantendo opcional para compatibilidade
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: text("password"),
  // Hash da senha
  phone: varchar("phone", { length: 20 }),
  businessName: text("businessName"),
  businessType: mysqlEnum("businessType", ["salon", "clinic", "consulting", "other"]).default("salon"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // FK para users
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  birthDate: datetime("birthDate"),
  notes: text("notes"),
  // Notas sobre o cliente
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0"),
  lastVisit: datetime("lastVisit"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // FK para users
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: int("duration").notNull(),
  // Duração em minutos
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // FK para users
  clientId: int("clientId").notNull(),
  // FK para clients
  serviceId: int("serviceId").notNull(),
  // FK para services
  startTime: datetime("startTime").notNull(),
  endTime: datetime("endTime").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled"),
  notes: text("notes"),
  price: decimal("price", { precision: 10, scale: 2 }),
  // Preço no momento do agendamento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // FK para users
  appointmentId: int("appointmentId"),
  // FK para appointments (opcional, pode ter pagamentos sem agendamento)
  clientId: int("clientId").notNull(),
  // FK para clients
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "pix", "transfer", "other"]).default("cash"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  description: text("description"),
  transactionId: varchar("transactionId", { length: 255 }),
  // Para integração com Stripe/PIX
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var visitHistory = mysqlTable("visitHistory", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  // FK para clients
  appointmentId: int("appointmentId").notNull(),
  // FK para appointments
  serviceId: int("serviceId").notNull(),
  // FK para services
  notes: text("notes"),
  // Notas do atendimento
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var emailNotifications = mysqlTable("emailNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // FK para users
  appointmentId: int("appointmentId").notNull(),
  // FK para appointments
  clientId: int("clientId").notNull(),
  // FK para clients
  type: mysqlEnum("type", ["confirmation", "reminder", "cancellation"]).default("confirmation"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "failed", "bounced"]).default("sent"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var whatsappNotifications = mysqlTable("whatsappNotifications", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var notificationSettings = mysqlTable("notificationSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  whatsappEnabled: boolean("whatsappEnabled").default(true),
  reminderBefore24h: boolean("reminderBefore24h").default(true),
  reminderBefore1h: boolean("reminderBefore1h").default(true),
  sendConfirmation: boolean("sendConfirmation").default(true),
  sendCancellation: boolean("sendCancellation").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function upsertUser(user) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = { ...user };
    const updateSet = { ...user };
    delete updateSet.id;
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getClientsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId));
}
async function getClientById(clientId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createClient(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}
async function updateClient(clientId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(clients).set(data).where(eq(clients.id, clientId));
}
async function getServicesByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).where(eq(services.userId, userId));
}
async function getServiceById(serviceId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createService(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(services).values(data);
}
async function updateService(serviceId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(services).set(data).where(eq(services.id, serviceId));
}
async function getAppointmentsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.userId, userId));
}
async function getAppointmentById(appointmentId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createAppointment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values(data);
  if (result && result.insertId) {
    return { id: Number(result.insertId) };
  }
  return result;
}
async function updateAppointment(appointmentId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(appointments).set(data).where(eq(appointments.id, appointmentId));
}
async function getPaymentsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.userId, userId));
}
async function createPayment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(payments).values(data);
}
async function updatePayment(paymentId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(payments).set(data).where(eq(payments.id, paymentId));
}
async function deleteClient(clientId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(clients).where(eq(clients.id, clientId));
}
async function deleteService(serviceId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(services).where(eq(services.id, serviceId));
}
async function deleteAppointment(appointmentId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(appointments).where(eq(appointments.id, appointmentId));
}

// server/_core/sdk.ts
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var SDKServer = class {
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a user openId
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: "businesshub",
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      return null;
    }
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const user = await getUserByOpenId(session.openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      ...user,
      lastSignedIn: /* @__PURE__ */ new Date()
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/db-whatsapp.ts
import { eq as eq2, and } from "drizzle-orm";
async function createWhatsAppNotification(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(whatsappNotifications).values(data);
}
async function getWhatsAppNotifications(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(whatsappNotifications).where(eq2(whatsappNotifications.userId, userId));
}
async function getOrCreateNotificationSettings(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(notificationSettings).where(eq2(notificationSettings.userId, userId)).limit(1);
  if (existing.length > 0) {
    return existing[0];
  }
  const defaultSettings = {
    userId,
    whatsappEnabled: true,
    reminderBefore24h: true,
    reminderBefore1h: true,
    sendConfirmation: true,
    sendCancellation: true
  };
  await db.insert(notificationSettings).values(defaultSettings);
  return await db.select().from(notificationSettings).where(eq2(notificationSettings.userId, userId)).limit(1).then((rows) => rows[0]);
}
async function updateNotificationSettings(userId, settings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notificationSettings).set(settings).where(eq2(notificationSettings.userId, userId));
}
async function hasNotificationBeenSent(appointmentId, type) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(whatsappNotifications).where(
    and(
      eq2(whatsappNotifications.appointmentId, appointmentId),
      eq2(whatsappNotifications.type, type),
      eq2(whatsappNotifications.status, "sent")
    )
  ).limit(1);
  return result.length > 0;
}

// server/whatsapp.ts
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "baileys";
import fs from "fs";
import path from "path";
var sock = null;
var isConnecting = false;
var authDir = path.join(process.cwd(), ".wwebjs_auth");
async function initWhatsApp() {
  if (sock) return sock;
  if (isConnecting) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (sock) {
          clearInterval(checkInterval);
          resolve(sock);
        }
      }, 1e3);
    });
  }
  isConnecting = true;
  try {
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(
          "connection closed due to ",
          lastDisconnect?.error,
          ", reconnecting ",
          shouldReconnect
        );
        if (shouldReconnect) {
          sock = null;
          isConnecting = false;
          setTimeout(() => initWhatsApp(), 3e3);
        }
      } else if (connection === "open") {
        console.log("\u2713 WhatsApp conectado com sucesso!");
        isConnecting = false;
      }
    });
    return sock;
  } catch (error) {
    console.error("Erro ao inicializar WhatsApp:", error);
    isConnecting = false;
    throw error;
  }
}
async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    const whatsapp = await initWhatsApp();
    if (!whatsapp) {
      return {
        success: false,
        error: "WhatsApp n\xE3o conectado. Escaneie o QR code primeiro."
      };
    }
    let formattedNumber = phoneNumber.replace(/\D/g, "");
    if (!formattedNumber.startsWith("55")) {
      formattedNumber = "55" + formattedNumber;
    }
    const jid = formattedNumber + "@s.whatsapp.net";
    const response = await whatsapp.sendMessage(jid, { text: message });
    return {
      success: true,
      messageId: response.key.id
    };
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}
function getWhatsAppStatus() {
  if (!sock) {
    return {
      connected: false,
      message: "WhatsApp n\xE3o inicializado. Escaneie o QR code."
    };
  }
  if (!sock.user) {
    return {
      connected: false,
      message: "WhatsApp conectando... Escaneie o QR code no terminal."
    };
  }
  return {
    connected: true,
    phoneNumber: sock.user.id.split(":")[0],
    message: "WhatsApp conectado com sucesso!"
  };
}

// server/jobs.ts
import { eq as eq3, and as and2, gte, lte } from "drizzle-orm";
async function sendReminders24h() {
  const db = await getDb();
  if (!db) {
    console.log("[Jobs] Database not available");
    return;
  }
  try {
    console.log("[Jobs] Starting 24h reminder job...");
    const now = /* @__PURE__ */ new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1e3);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1e3);
    const appointmentsToRemind = await db.select().from(appointments).where(
      and2(
        gte(appointments.startTime, in24h),
        lte(appointments.startTime, in25h),
        eq3(appointments.status, "scheduled")
      )
    );
    console.log(`[Jobs] Found ${appointmentsToRemind.length} appointments for 24h reminder`);
    for (const appointment of appointmentsToRemind) {
      try {
        const alreadySent = await hasNotificationBeenSent(appointment.id, "reminder_24h");
        if (alreadySent) {
          console.log(`[Jobs] Reminder already sent for appointment ${appointment.id}`);
          continue;
        }
        const client = await db.select().from(clients).where(eq3(clients.id, appointment.clientId)).limit(1).then((rows) => rows[0]);
        if (!client || !client.phone) {
          console.log(`[Jobs] Client ${appointment.clientId} has no phone number`);
          continue;
        }
        const settings = await getOrCreateNotificationSettings(appointment.userId);
        if (!settings.whatsappEnabled || !settings.reminderBefore24h) {
          console.log(`[Jobs] Reminders disabled for user ${appointment.userId}`);
          continue;
        }
        const appointmentDate = new Date(appointment.startTime).toLocaleString("pt-BR");
        const message = `Ol\xE1 ${client.name}! \u{1F44B}

Lembrete: Voc\xEA tem um agendamento conosco amanh\xE3 \xE0s ${appointmentDate}.

Confirme sua presen\xE7a ou cancele se necess\xE1rio.

Obrigado! \u{1F60A}`;
        const result = await sendWhatsAppMessage(client.phone, message);
        await createWhatsAppNotification({
          userId: appointment.userId,
          appointmentId: appointment.id,
          clientId: appointment.clientId,
          clientPhone: client.phone,
          type: "reminder_24h",
          message,
          status: result.success ? "sent" : "failed",
          errorMessage: result.error || null,
          sentAt: /* @__PURE__ */ new Date()
        });
        if (result.success) {
          console.log(
            `[Jobs] \u2713 Sent 24h reminder to ${client.phone} for appointment ${appointment.id}`
          );
        } else {
          console.log(
            `[Jobs] \u2717 Failed to send 24h reminder to ${client.phone}: ${result.error}`
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
async function sendReminders1h() {
  const db = await getDb();
  if (!db) {
    console.log("[Jobs] Database not available");
    return;
  }
  try {
    console.log("[Jobs] Starting 1h reminder job...");
    const now = /* @__PURE__ */ new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1e3);
    const in1h5min = new Date(now.getTime() + 65 * 60 * 1e3);
    const appointmentsToRemind = await db.select().from(appointments).where(
      and2(
        gte(appointments.startTime, in1h),
        lte(appointments.startTime, in1h5min),
        eq3(appointments.status, "scheduled")
      )
    );
    console.log(`[Jobs] Found ${appointmentsToRemind.length} appointments for 1h reminder`);
    for (const appointment of appointmentsToRemind) {
      try {
        const alreadySent = await hasNotificationBeenSent(appointment.id, "reminder_1h");
        if (alreadySent) {
          console.log(`[Jobs] Reminder already sent for appointment ${appointment.id}`);
          continue;
        }
        const client = await db.select().from(clients).where(eq3(clients.id, appointment.clientId)).limit(1).then((rows) => rows[0]);
        if (!client || !client.phone) {
          console.log(`[Jobs] Client ${appointment.clientId} has no phone number`);
          continue;
        }
        const settings = await getOrCreateNotificationSettings(appointment.userId);
        if (!settings.whatsappEnabled || !settings.reminderBefore1h) {
          console.log(`[Jobs] Reminders disabled for user ${appointment.userId}`);
          continue;
        }
        const appointmentTime = new Date(appointment.startTime).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        });
        const message = `Ol\xE1 ${client.name}! \u23F0

Seu agendamento come\xE7a em 1 hora (${appointmentTime}).

Estamos prontos para receb\xEA-lo! \u{1F389}`;
        const result = await sendWhatsAppMessage(client.phone, message);
        await createWhatsAppNotification({
          userId: appointment.userId,
          appointmentId: appointment.id,
          clientId: appointment.clientId,
          clientPhone: client.phone,
          type: "reminder_1h",
          message,
          status: result.success ? "sent" : "failed",
          errorMessage: result.error || null,
          sentAt: /* @__PURE__ */ new Date()
        });
        if (result.success) {
          console.log(
            `[Jobs] \u2713 Sent 1h reminder to ${client.phone} for appointment ${appointment.id}`
          );
        } else {
          console.log(
            `[Jobs] \u2717 Failed to send 1h reminder to ${client.phone}: ${result.error}`
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
async function sendConfirmation(appointmentId) {
  const db = await getDb();
  if (!db) {
    console.log("[Jobs] Database not available");
    return;
  }
  try {
    console.log(`[Jobs] Sending confirmation for appointment ${appointmentId}...`);
    const appointment = await db.select().from(appointments).where(eq3(appointments.id, appointmentId)).limit(1).then((rows) => rows[0]);
    if (!appointment) {
      console.log(`[Jobs] Appointment ${appointmentId} not found`);
      return;
    }
    const client = await db.select().from(clients).where(eq3(clients.id, appointment.clientId)).limit(1).then((rows) => rows[0]);
    if (!client || !client.phone) {
      console.log(`[Jobs] Client has no phone number`);
      return;
    }
    const settings = await getOrCreateNotificationSettings(appointment.userId);
    if (!settings.whatsappEnabled || !settings.sendConfirmation) {
      console.log(`[Jobs] Confirmations disabled for user ${appointment.userId}`);
      return;
    }
    const appointmentDate = new Date(appointment.startTime).toLocaleString("pt-BR");
    const message = `Ol\xE1 ${client.name}! \u{1F389}

Seu agendamento foi confirmado!

\u{1F4C5} Data: ${appointmentDate}

Obrigado por escolher nossos servi\xE7os! \u{1F60A}`;
    const result = await sendWhatsAppMessage(client.phone, message);
    await createWhatsAppNotification({
      userId: appointment.userId,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      clientPhone: client.phone,
      type: "confirmation",
      message,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error || null,
      sentAt: /* @__PURE__ */ new Date()
    });
    if (result.success) {
      console.log(`[Jobs] \u2713 Sent confirmation to ${client.phone}`);
    } else {
      console.log(`[Jobs] \u2717 Failed to send confirmation: ${result.error}`);
    }
  } catch (error) {
    console.error(`[Jobs] Error sending confirmation:`, error);
  }
}
async function sendCancellation(appointmentId) {
  const db = await getDb();
  if (!db) {
    console.log("[Jobs] Database not available");
    return;
  }
  try {
    console.log(`[Jobs] Sending cancellation notification for appointment ${appointmentId}...`);
    const appointment = await db.select().from(appointments).where(eq3(appointments.id, appointmentId)).limit(1).then((rows) => rows[0]);
    if (!appointment) {
      console.log(`[Jobs] Appointment ${appointmentId} not found`);
      return;
    }
    const client = await db.select().from(clients).where(eq3(clients.id, appointment.clientId)).limit(1).then((rows) => rows[0]);
    if (!client || !client.phone) {
      console.log(`[Jobs] Client has no phone number`);
      return;
    }
    const settings = await getOrCreateNotificationSettings(appointment.userId);
    if (!settings.whatsappEnabled || !settings.sendCancellation) {
      console.log(`[Jobs] Cancellations disabled for user ${appointment.userId}`);
      return;
    }
    const appointmentDate = new Date(appointment.startTime).toLocaleString("pt-BR");
    const message = `Ol\xE1 ${client.name}! \u{1F4E2}

Informamos que seu agendamento de ${appointmentDate} foi cancelado.

Se tiver d\xFAvidas, entre em contato conosco. Obrigado! \u{1F60A}`;
    const result = await sendWhatsAppMessage(client.phone, message);
    await createWhatsAppNotification({
      userId: appointment.userId,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      clientPhone: client.phone,
      type: "cancellation",
      message,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error || null,
      sentAt: /* @__PURE__ */ new Date()
    });
    if (result.success) {
      console.log(`[Jobs] \u2713 Sent cancellation to ${client.phone}`);
    } else {
      console.log(`[Jobs] \u2717 Failed to send cancellation: ${result.error}`);
    }
  } catch (error) {
    console.error(`[Jobs] Error sending cancellation:`, error);
  }
}
function startScheduledJobs() {
  console.log("[Jobs] Starting scheduled jobs...");
  setInterval(() => {
    sendReminders24h().catch((error) => {
      console.error("[Jobs] Error in 24h reminder job:", error);
    });
  }, 5 * 60 * 1e3);
  setInterval(() => {
    sendReminders1h().catch((error) => {
      console.error("[Jobs] Error in 1h reminder job:", error);
    });
  }, 1 * 60 * 1e3);
  console.log("[Jobs] Scheduled jobs started successfully");
}

// server/abacatepay.ts
import axios from "axios";
import crypto from "crypto";
var ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";
var API_KEY = process.env.ABACATEPAY_API_KEY;
var WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET;
async function createPaymentLink(request) {
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
        returnUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/agendamentos`
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount,
      paymentUrl: response.data.paymentUrl,
      createdAt: response.data.createdAt
    };
  } catch (error) {
    console.error("[Abacatepay] Error creating payment:", error);
    throw new Error("Failed to create payment link");
  }
}
function validateWebhook(payload, signature) {
  if (!WEBHOOK_SECRET) {
    console.warn("[Abacatepay] WEBHOOK_SECRET not configured");
    return false;
  }
  const hash = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
  return hash === signature;
}
function parseWebhookPayload(body) {
  return {
    id: body.id,
    event: body.event,
    payment: {
      id: body.payment.id,
      status: body.payment.status,
      amount: body.payment.amount,
      customer: body.payment.customer,
      metadata: body.payment.metadata
    }
  };
}

// server/db-abacatepay.ts
import { eq as eq4 } from "drizzle-orm";
async function createPaymentRecord(data) {
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
      paymentMethod: data.paymentMethod || "pix",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return result.insertId;
  } catch (error) {
    console.error("[DB] Error creating payment record:", error);
    throw error;
  }
}
async function updatePaymentStatus(transactionId, status) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.update(payments).set({
      status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(payments.transactionId, transactionId));
  } catch (error) {
    console.error("[DB] Error updating payment status:", error);
    throw error;
  }
}
async function getPaymentByTransactionId(transactionId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.select().from(payments).where(eq4(payments.transactionId, transactionId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[DB] Error getting payment:", error);
    throw error;
  }
}
async function getTotalReceivedPayments() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.select().from(payments).where(eq4(payments.status, "completed"));
    return result.reduce((sum, payment) => {
      const amount = typeof payment.amount === "string" ? parseFloat(payment.amount) : payment.amount || 0;
      return sum + amount;
    }, 0);
  } catch (error) {
    console.error("[DB] Error getting total payments:", error);
    return 0;
  }
}

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    register: publicProcedure.input(z2.object({
      email: z2.string().email(),
      password: z2.string().min(6),
      name: z2.string().min(1)
    })).mutation(async ({ input, ctx }) => {
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new Error("Usu\xE1rio j\xE1 existe");
      }
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const openId = nanoid();
      await upsertUser({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        openId,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name: input.name,
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true };
    }),
    login: publicProcedure.input(z2.object({
      email: z2.string().email(),
      password: z2.string()
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);
      if (!user || !user.password) {
        throw new Error("Credenciais inv\xE1lidas");
      }
      const isPasswordValid = await bcrypt.compare(input.password, user.password);
      if (!isPasswordValid) {
        throw new Error("Credenciais inv\xE1lidas");
      }
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Clients (CRM)
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getClientsByUserId(ctx.user.id);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getClientById(input.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        name: z2.string().min(1),
        email: z2.string().email().optional(),
        phone: z2.string().min(1),
        birthDate: z2.date().optional(),
        notes: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      return createClient({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        email: z2.string().email().optional(),
        phone: z2.string().optional(),
        birthDate: z2.date().optional(),
        notes: z2.string().optional(),
        totalSpent: z2.string().optional(),
        lastVisit: z2.date().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateClient(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteClient(input.id);
    })
  }),
  // Services
  services: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getServicesByUserId(ctx.user.id);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getServiceById(input.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        name: z2.string().min(1),
        description: z2.string().optional(),
        price: z2.string().min(1),
        duration: z2.number().min(1),
        isActive: z2.boolean().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      return createService({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        price: z2.string().optional(),
        duration: z2.number().optional(),
        isActive: z2.boolean().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateService(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteService(input.id);
    })
  }),
  // Appointments
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getAppointmentsByUserId(ctx.user.id);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getAppointmentById(input.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        clientId: z2.number(),
        serviceId: z2.number(),
        startTime: z2.date(),
        endTime: z2.date(),
        notes: z2.string().optional(),
        status: z2.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        price: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const result = await createAppointment({
        userId: ctx.user.id,
        ...input
      });
      if (result && "id" in result && result.id) {
        sendConfirmation(result.id).catch((error) => {
          console.error("Error sending confirmation:", error);
        });
      }
      return result;
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        clientId: z2.number().optional(),
        serviceId: z2.number().optional(),
        startTime: z2.date().optional(),
        endTime: z2.date().optional(),
        notes: z2.string().optional(),
        status: z2.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        price: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await updateAppointment(id, data);
      if (data.status === "cancelled") {
        sendCancellation(id).catch((error) => {
          console.error("Error sending cancellation:", error);
        });
      }
      return result;
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteAppointment(input.id);
    })
  }),
  // Payments
  payments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getPaymentsByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        appointmentId: z2.number().optional(),
        clientId: z2.number(),
        amount: z2.string().min(1),
        paymentMethod: z2.enum(["cash", "card", "pix", "transfer", "other"]).optional(),
        status: z2.enum(["pending", "completed", "failed", "refunded"]).optional(),
        description: z2.string().optional(),
        transactionId: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      return createPayment({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        status: z2.enum(["pending", "completed", "failed", "refunded"]).optional(),
        description: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updatePayment(id, data);
    })
  }),
  // Dashboard
  dashboard: router({
    metrics: protectedProcedure.query(async ({ ctx }) => {
      const appointments2 = await getAppointmentsByUserId(ctx.user.id);
      const clients2 = await getClientsByUserId(ctx.user.id);
      const payments2 = await getPaymentsByUserId(ctx.user.id);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const todayAppointments = appointments2.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });
      const totalRevenue = payments2.filter((p) => p.status === "completed").reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      return {
        totalClients: clients2.length,
        totalAppointments: appointments2.length,
        todayAppointments: todayAppointments.length,
        totalRevenue,
        completedAppointments: appointments2.filter((a) => a.status === "completed").length,
        pendingAppointments: appointments2.filter((a) => a.status === "scheduled").length
      };
    }),
    upcomingAppointments: protectedProcedure.query(async ({ ctx }) => {
      const appointments2 = await getAppointmentsByUserId(ctx.user.id);
      const now = /* @__PURE__ */ new Date();
      return appointments2.filter((apt) => new Date(apt.startTime) >= now && apt.status === "scheduled").sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 10);
    })
  }),
  whatsapp: router({
    status: protectedProcedure.query(() => {
      return getWhatsAppStatus();
    }),
    sendTest: protectedProcedure.input(z2.object({ phoneNumber: z2.string(), message: z2.string() })).mutation(async ({ input }) => {
      const result = await sendWhatsAppMessage(input.phoneNumber, input.message);
      return result;
    }),
    settings: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreateNotificationSettings(ctx.user.id);
    }),
    updateSettings: protectedProcedure.input(
      z2.object({
        whatsappEnabled: z2.boolean().optional(),
        reminderBefore24h: z2.boolean().optional(),
        reminderBefore1h: z2.boolean().optional(),
        sendConfirmation: z2.boolean().optional(),
        sendCancellation: z2.boolean().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      await updateNotificationSettings(ctx.user.id, input);
      return { success: true };
    }),
    history: protectedProcedure.query(async ({ ctx }) => {
      return await getWhatsAppNotifications(ctx.user.id);
    })
  }),
  // Public Booking
  booking: router({
    getProvider: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const user = await getUserById(input.userId);
      if (!user) throw new Error("Prestador n\xE3o encontrado");
      const services2 = await getServicesByUserId(input.userId);
      return {
        name: user.businessName || user.name,
        services: services2.filter((s) => s.isActive)
      };
    }),
    getAvailableSlots: publicProcedure.input(z2.object({
      userId: z2.number(),
      serviceId: z2.number(),
      date: z2.date()
    })).query(async ({ input }) => {
      const service = await getServiceById(input.serviceId);
      if (!service) throw new Error("Servi\xE7o n\xE3o encontrado");
      const appointments2 = await getAppointmentsByUserId(input.userId);
      const dayStart = new Date(input.date);
      dayStart.setHours(9, 0, 0, 0);
      const dayEnd = new Date(input.date);
      dayEnd.setHours(18, 0, 0, 0);
      const slots = [];
      let current = new Date(dayStart);
      while (current.getTime() + service.duration * 6e4 <= dayEnd.getTime()) {
        const slotEnd = new Date(current.getTime() + service.duration * 6e4);
        const isOccupied = appointments2.some((apt) => {
          const aptStart = new Date(apt.startTime).getTime();
          const aptEnd = new Date(apt.endTime).getTime();
          const curStart = current.getTime();
          const curEnd = slotEnd.getTime();
          return curStart < aptEnd && curEnd > aptStart && apt.status !== "cancelled";
        });
        if (!isOccupied && current.getTime() > Date.now()) {
          slots.push(new Date(current));
        }
        current = new Date(current.getTime() + 30 * 6e4);
      }
      return slots;
    }),
    submit: publicProcedure.input(z2.object({
      userId: z2.number(),
      serviceId: z2.number(),
      startTime: z2.date(),
      clientName: z2.string().min(1),
      clientPhone: z2.string().min(1),
      clientEmail: z2.string().email().optional()
    })).mutation(async ({ input }) => {
      const service = await getServiceById(input.serviceId);
      if (!service) throw new Error("Servi\xE7o n\xE3o encontrado");
      const existingClients = await getClientsByUserId(input.userId);
      let client = existingClients.find((c) => c.phone === input.clientPhone);
      if (!client) {
        const result = await createClient({
          userId: input.userId,
          name: input.clientName,
          phone: input.clientPhone,
          email: input.clientEmail
        });
        const clients2 = await getClientsByUserId(input.userId);
        client = clients2[clients2.length - 1];
      }
      const endTime = new Date(input.startTime.getTime() + service.duration * 6e4);
      const appointment = await createAppointment({
        userId: input.userId,
        clientId: client.id,
        serviceId: input.serviceId,
        startTime: input.startTime,
        endTime,
        status: "scheduled",
        price: service.price
      });
      if (appointment && "id" in appointment) {
        sendConfirmation(appointment.id).catch(console.error);
      }
      return { success: true };
    })
  }),
  // Abacatepay - Pagamentos
  abacatepay: router({
    createLink: protectedProcedure.input(
      z2.object({
        appointmentId: z2.number(),
        clientId: z2.number(),
        amount: z2.number(),
        description: z2.string(),
        customerName: z2.string(),
        customerEmail: z2.string()
      })
    ).mutation(async ({ ctx, input }) => {
      try {
        if (input.amount <= 0) {
          throw new Error("Valor do pagamento deve ser maior que zero");
        }
        if (!input.customerName || !input.customerEmail) {
          throw new Error("Nome e email do cliente sao obrigatorios");
        }
        console.log("[API] Creating payment link:", {
          amount: Math.round(input.amount * 100),
          customerName: input.customerName,
          customerEmail: input.customerEmail
        });
        const paymentLink = await createPaymentLink({
          amount: Math.round(input.amount * 100),
          description: input.description,
          customer: {
            name: input.customerName,
            email: input.customerEmail
          },
          metadata: {
            appointmentId: input.appointmentId,
            clientId: input.clientId
          }
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
          paymentMethod: "pix"
        });
        return {
          success: true,
          paymentUrl: paymentLink.paymentUrl,
          paymentId: paymentLink.id
        };
      } catch (error) {
        const errorMessage = error?.message || "Erro ao criar link de pagamento";
        console.error("[API] Error creating payment link:", errorMessage);
        throw new Error(errorMessage);
      }
    }),
    getStatus: protectedProcedure.input(z2.object({ transactionId: z2.string() })).query(async ({ input }) => {
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
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path3 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path2 from "node:path";
import { defineConfig } from "vite";
var plugins = [react(), tailwindcss()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path2.resolve(import.meta.dirname),
  root: path2.resolve(import.meta.dirname, "client"),
  publicDir: path2.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path3.resolve(import.meta.dirname, "../..", "dist", "public") : path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/webhooks.ts
async function handleAbacatepayWebhook(req, res) {
  try {
    const signature = req.headers["x-abacatepay-signature"];
    const payload = JSON.stringify(req.body);
    if (!validateWebhook(payload, signature)) {
      console.warn("[Webhook] Invalid signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }
    const webhook = parseWebhookPayload(req.body);
    console.log(`[Webhook] Received event: ${webhook.event} for payment ${webhook.payment.id}`);
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
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function handlePaymentCompleted(webhook) {
  try {
    const { payment } = webhook;
    await updatePaymentStatus(payment.id, "completed");
    if (payment.metadata?.appointmentId) {
      await updateAppointment(payment.metadata.appointmentId, {
        status: "completed"
      });
      console.log(`[Webhook] Appointment ${payment.metadata.appointmentId} marked as completed`);
    }
    console.log(`[Webhook] Payment ${payment.id} completed successfully`);
  } catch (error) {
    console.error("[Webhook] Error handling payment completed:", error);
    throw error;
  }
}
async function handlePaymentFailed(webhook) {
  try {
    const { payment } = webhook;
    await updatePaymentStatus(payment.id, "failed");
    console.log(`[Webhook] Payment ${payment.id} failed`);
  } catch (error) {
    console.error("[Webhook] Error handling payment failed:", error);
    throw error;
  }
}
async function handlePaymentPending(webhook) {
  try {
    const { payment } = webhook;
    await updatePaymentStatus(payment.id, "pending");
    console.log(`[Webhook] Payment ${payment.id} pending`);
  } catch (error) {
    console.error("[Webhook] Error handling payment pending:", error);
    throw error;
  }
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.post("/api/webhooks/abacatepay", handleAbacatepayWebhook);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_JOBS === "true") {
    try {
      await initWhatsApp();
      startScheduledJobs();
      console.log("[Server] WhatsApp and scheduled jobs initialized");
    } catch (error) {
      console.warn("[Server] Failed to initialize WhatsApp/jobs:", error);
    }
  }
}
startServer().catch(console.error);
