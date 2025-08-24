import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contractors = pgTable("contractors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  nip: text("nip"),
  regon: text("regon"),
  krs: text("krs"),
  accountNumber: text("account_number"),
  province: text("province"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("Polska"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractorId: varchar("contractor_id").references(() => contractors.id),
  contractorName: text("contractor_name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  vatRate: integer("vat_rate").notNull().default(23), // VAT percentage
  discountPercent: integer("discount_percent").default(0),
  finalAmount: integer("final_amount").notNull(), // amount after discount and VAT
  currency: text("currency").notNull().default("PLN"),
  validUntil: timestamp("valid_until"),
  paymentTerms: text("payment_terms").default("14 dni"),
  category: text("category").default("Standardowa"),
  notes: text("notes"),
  status: text("status").notNull().default("draft"), // draft, sent, accepted, rejected, expired
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emails = pgTable("emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  content: text("content"),
  status: text("status").notNull().default("draft"), // draft, sent, failed
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user: text("user").notNull(),
  email: text("email"),
  issue: text("issue").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertContractorSchema = createInsertSchema(contractors).pick({
  name: true,
  email: true,
  phone: true,
  nip: true,
  regon: true,
  krs: true,
  accountNumber: true,
  province: true,
  address: true,
  city: true,
  postalCode: true,
  country: true,
  status: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  date: true,
  time: true,
  priority: true,
  status: true,
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  contractorName: true,
  title: true,
  description: true,
  amount: true,
  vatRate: true,
  discountPercent: true,
  finalAmount: true,
  currency: true,
  validUntil: true,
  paymentTerms: true,
  category: true,
  notes: true,
  status: true,
}).extend({
  validUntil: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const insertEmailSchema = createInsertSchema(emails).pick({
  to: true,
  subject: true,
  content: true,
  status: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  user: true,
  email: true,
  issue: true,
  status: true,
  priority: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  message: true,
  type: true,
  read: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
