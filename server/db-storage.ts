import {
  users,
  contractors,
  tasks,
  offers,
  emails,
  supportTickets,
  notifications,
  type User,
  type InsertUser,
  type UpdateUser,
  type Contractor,
  type InsertContractor,
  type Task,
  type InsertTask,
  type Offer,
  type InsertOffer,
  type Email,
  type InsertEmail,
  type SupportTicket,
  type InsertSupportTicket,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, and, desc, asc, gte, lte } from "drizzle-orm";
import type { IStorage } from "./storage";
import bcrypt from "bcryptjs";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
  }

  async updateUser(id: string, updateUser: UpdateUser): Promise<User> {
    let updates = { ...updateUser };
    
    // Hash password if it's being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Contractors
  async getContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors).orderBy(asc(contractors.name));
  }

  async getContractor(id: string): Promise<Contractor | undefined> {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor || undefined;
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const [contractor] = await db
      .insert(contractors)
      .values(insertContractor)
      .returning();
    return contractor;
  }

  async updateContractor(id: string, updates: Partial<InsertContractor>): Promise<Contractor> {
    const [contractor] = await db
      .update(contractors)
      .set(updates)
      .where(eq(contractors.id, id))
      .returning();
    
    if (!contractor) {
      throw new Error("Contractor not found");
    }
    return contractor;
  }

  async deleteContractor(id: string): Promise<void> {
    await db.delete(contractors).where(eq(contractors.id, id));
  }

  // Tasks
  async getTasks(userId?: string): Promise<Task[]> {
    if (userId) {
      return await db.select().from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt));
    }
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(taskData: InsertTask & { userId: string }): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Offers
  async getOffers(): Promise<Offer[]> {
    return await db.select().from(offers).orderBy(desc(offers.createdAt));
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer || undefined;
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    // Convert string validUntil to Date if needed
    const offerData = {
      ...insertOffer,
      validUntil: typeof insertOffer.validUntil === 'string' 
        ? new Date(insertOffer.validUntil) 
        : insertOffer.validUntil || null
    };
    
    const [offer] = await db
      .insert(offers)
      .values(offerData)
      .returning();
    return offer;
  }

  async updateOffer(id: string, updates: Partial<InsertOffer>): Promise<Offer> {
    // Convert string validUntil to Date if needed
    const updateData = {
      ...updates,
      validUntil: updates.validUntil && typeof updates.validUntil === 'string' 
        ? new Date(updates.validUntil) 
        : updates.validUntil
    };
    
    const [offer] = await db
      .update(offers)
      .set(updateData)
      .where(eq(offers.id, id))
      .returning();
    
    if (!offer) {
      throw new Error("Offer not found");
    }
    return offer;
  }

  async deleteOffer(id: string): Promise<void> {
    await db.delete(offers).where(eq(offers.id, id));
  }

  // Emails
  async getEmails(userId?: string): Promise<Email[]> {
    if (userId) {
      return await db.select().from(emails)
        .where(eq(emails.userId, userId))
        .orderBy(desc(emails.createdAt));
    }
    return await db.select().from(emails).orderBy(desc(emails.createdAt));
  }

  async getEmail(id: string): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email || undefined;
  }

  async createEmail(emailData: InsertEmail & { userId: string }): Promise<Email> {
    const [email] = await db
      .insert(emails)
      .values(emailData)
      .returning();
    return email;
  }

  async updateEmail(id: string, updates: Partial<InsertEmail & { readAt?: Date | null }>): Promise<Email> {
    const [email] = await db
      .update(emails)
      .set(updates)
      .where(eq(emails.id, id))
      .returning();
    
    if (!email) {
      throw new Error("Email not found");
    }
    return email;
  }

  async deleteEmail(id: string): Promise<void> {
    await db.delete(emails).where(eq(emails.id, id));
  }

  // Support Tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db
      .insert(supportTickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  async updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set(updates)
      .where(eq(supportTickets.id, id))
      .returning();
    
    if (!ticket) {
      throw new Error("Support ticket not found");
    }
    return ticket;
  }

  async deleteSupportTicket(id: string): Promise<void> {
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification & { userId: string }): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  }

  // Search
  async globalSearch(searchTerm: string, userId: string, types: string[]): Promise<any[]> {
    const results: any[] = [];
    const term = `%${searchTerm.toLowerCase()}%`;

    // Search contractors
    if (types.includes('contractor')) {
      const contractorResults = await db.select().from(contractors)
        .where(
          or(
            like(contractors.name, term),
            like(contractors.email, term),
            like(contractors.phone, term),
            like(contractors.nip, term)
          )
        )
        .limit(10);

      results.push(...contractorResults.map(c => ({
        id: c.id,
        type: 'contractor',
        title: c.name,
        subtitle: c.email,
        content: `${c.phone} | NIP: ${c.nip || 'Brak'}`,
        url: `/contractors`
      })));
    }

    // Search tasks
    if (types.includes('task')) {
      const taskResults = await db.select().from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            like(tasks.title, term)
          )
        )
        .limit(10);

      results.push(...taskResults.map(t => ({
        id: t.id,
        type: 'task',
        title: t.title,
        subtitle: `${t.date} ${t.time}`,
        content: `Priorytet: ${t.priority} | Status: ${t.status}`,
        url: `/tasks`
      })));
    }

    // Search offers
    if (types.includes('offer')) {
      const offerResults = await db.select().from(offers)
        .where(
          or(
            like(offers.title, term),
            like(offers.contractorName, term),
            like(offers.description, term)
          )
        )
        .limit(10);

      results.push(...offerResults.map(o => ({
        id: o.id,
        type: 'offer',
        title: o.title,
        subtitle: o.contractorName,
        content: `${o.finalAmount} ${o.currency} | Status: ${o.status}`,
        url: `/offers`
      })));
    }

    // Search emails
    if (types.includes('email')) {
      const emailResults = await db.select().from(emails)
        .where(
          and(
            eq(emails.userId, userId),
            or(
              like(emails.subject, term),
              like(emails.content, term),
              like(emails.to, term),
              like(emails.from, term)
            )
          )
        )
        .limit(10);

      results.push(...emailResults.map(e => ({
        id: e.id,
        type: 'email',
        title: e.subject,
        subtitle: `${e.type === 'sent' ? 'Do:' : 'Od:'} ${e.type === 'sent' ? e.to : e.from}`,
        content: e.content ? e.content.substring(0, 100) + '...' : '',
        url: `/emails`
      })));
    }

    // Search support tickets
    if (types.includes('support')) {
      const supportResults = await db.select().from(supportTickets)
        .where(
          or(
            like(supportTickets.user, term),
            like(supportTickets.issue, term),
            like(supportTickets.email, term)
          )
        )
        .limit(10);

      results.push(...supportResults.map(s => ({
        id: s.id,
        type: 'support',
        title: s.issue,
        subtitle: s.user,
        content: `${s.email || 'Brak email'} | Priorytet: ${s.priority}`,
        url: `/support`
      })));
    }

    return results;
  }

  // Analytics
  async getAnalyticsData(dateRange: string): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get basic stats
    const [
      contractorCount,
      activeTaskCount,
      openTicketCount,
      totalOfferValue,
      emailCount
    ] = await Promise.all([
      db.select().from(contractors).where(eq(contractors.status, 'active')),
      db.select().from(tasks).where(eq(tasks.status, 'pending')),
      db.select().from(supportTickets).where(eq(supportTickets.status, 'open')),
      db.select().from(offers),
      db.select().from(emails).where(gte(emails.createdAt, startDate))
    ]);

    const totalValue = totalOfferValue.reduce((sum, offer) => sum + offer.finalAmount, 0);

    // Get daily stats for charts
    const dailyEmails = await db.select().from(emails)
      .where(gte(emails.createdAt, startDate))
      .orderBy(asc(emails.createdAt));

    const dailyOffers = await db.select().from(offers)
      .where(gte(offers.createdAt, startDate))
      .orderBy(asc(offers.createdAt));

    // Process daily data
    const emailsByDay = this.groupByDay(dailyEmails, startDate);
    const offersByDay = this.groupByDay(dailyOffers, startDate);

    return {
      overview: {
        contractors: contractorCount.length,
        activeTasks: activeTaskCount.length,
        openTickets: openTicketCount.length,
        totalOfferValue: totalValue,
        emails: emailCount.length
      },
      charts: {
        emailsByDay,
        offersByDay,
        contractorsByStatus: [
          { name: 'Aktywni', value: contractorCount.length, color: '#22c55e' },
          { name: 'Nieaktywni', value: 0, color: '#ef4444' }
        ]
      }
    };
  }

  private groupByDay(items: any[], startDate: Date): any[] {
    const days = Math.ceil((new Date().getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const result = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().split('T')[0];
      const count = items.filter(item => 
        item.createdAt && item.createdAt.toISOString().split('T')[0] === dayStr
      ).length;

      result.push({
        date: dayStr,
        value: count
      });
    }

    return result;
  }
}