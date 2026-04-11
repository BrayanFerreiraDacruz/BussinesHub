import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  InsertClient, clients,
  InsertService, services,
  InsertAppointment, appointments,
  InsertPayment, payments,
  InsertVisitHistory, visitHistory,
  InsertEmailNotification, emailNotifications
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Clients queries
 */
export async function getClientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId));
}

export async function getClientById(clientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(clientId: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(clients).set(data).where(eq(clients.id, clientId));
}

/**
 * Services queries
 */
export async function getServicesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).where(eq(services.userId, userId));
}

export async function getServiceById(serviceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(services).values(data);
}

export async function updateService(serviceId: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(services).set(data).where(eq(services.id, serviceId));
}

/**
 * Appointments queries
 */
export async function getAppointmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.userId, userId));
}

export async function getAppointmentById(appointmentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(appointments).values(data);
}

export async function updateAppointment(appointmentId: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(appointments).set(data).where(eq(appointments.id, appointmentId));
}

/**
 * Payments queries
 */
export async function getPaymentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.userId, userId));
}

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(payments).values(data);
}

export async function updatePayment(paymentId: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(payments).set(data).where(eq(payments.id, paymentId));
}

/**
 * Delete operations
 */
export async function deleteClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(clients).where(eq(clients.id, clientId));
}

export async function deleteService(serviceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(services).where(eq(services.id, serviceId));
}

export async function deleteAppointment(appointmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(appointments).where(eq(appointments.id, appointmentId));
}
