import { 
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
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, user: UpdateUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Contractors
  getContractors(): Promise<Contractor[]>;
  getContractor(id: string): Promise<Contractor | undefined>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  updateContractor(id: string, contractor: Partial<InsertContractor>): Promise<Contractor>;
  deleteContractor(id: string): Promise<void>;
  
  // Tasks
  getTasks(userId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask & { userId: string }): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  // Offers
  getOffers(): Promise<Offer[]>;
  getOffer(id: string): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: string, offer: Partial<InsertOffer>): Promise<Offer>;
  deleteOffer(id: string): Promise<void>;
  
  // Emails
  getEmails(userId?: string): Promise<Email[]>;
  getEmail(id: string): Promise<Email | undefined>;
  createEmail(email: InsertEmail & { userId: string }): Promise<Email>;
  updateEmail(id: string, email: Partial<InsertEmail>): Promise<Email>;
  deleteEmail(id: string): Promise<void>;
  
  // Support Tickets
  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  deleteSupportTicket(id: string): Promise<void>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification & { userId: string }): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;

  // Search
  globalSearch(searchTerm: string, userId: string, types: string[]): Promise<any[]>;
  
  // Analytics
  getAnalyticsData(dateRange: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private contractors: Map<string, Contractor> = new Map();
  private tasks: Map<string, Task> = new Map();
  private offers: Map<string, Offer> = new Map();
  private emails: Map<string, Email> = new Map();
  private supportTickets: Map<string, SupportTicket> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    // Initialize with demo users
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123",
      role: "admin",
      email: "admin@crm.pl",
      createdAt: new Date(),
    };
    
    const regularUser: User = {
      id: randomUUID(),
      username: "user",
      password: "user123",
      role: "user",
      email: "user@crm.pl",
      createdAt: new Date(),
    };
    
    this.users.set(adminUser.id, adminUser);
    this.users.set(regularUser.id, regularUser);
    
    // Initialize with demo contractors
    const contractor1: Contractor = {
      id: randomUUID(),
      name: "Firma ABC Sp. z o.o.",
      email: "kontakt@abc.pl",
      phone: "+48 123 456 789",
      nip: "1234567890",
      regon: null,
      krs: null,
      accountNumber: null,
      province: null,
      address: null,
      city: null,
      postalCode: null,
      country: null,
      status: "active",
      createdAt: new Date(),
    };
    
    const contractor2: Contractor = {
      id: randomUUID(),
      name: "XYZ Technologies",
      email: "biuro@xyz.pl",
      phone: "+48 987 654 321",
      nip: "9876543210",
      regon: null,
      krs: null,
      accountNumber: null,
      province: null,
      address: null,
      city: null,
      postalCode: null,
      country: null,
      status: "active",
      createdAt: new Date(),
    };
    
    this.contractors.set(contractor1.id, contractor1);
    this.contractors.set(contractor2.id, contractor2);
    
    // Initialize with demo emails
    const email1: Email = {
      id: randomUUID(),
      from: 'crm@nasza-firma.pl',
      to: 'klient@firma.pl',
      subject: 'Oferta cenowa - usługi konsultingowe',
      content: 'Szanowni Państwo, w załączeniu przesyłamy ofertę cenową na usługi konsultingowe.',
      type: 'sent',
      status: 'sent',
      userId: adminUser.id,
      readAt: null,
      createdAt: new Date('2024-01-15')
    };
    
    const email2: Email = {
      id: randomUUID(),
      from: 'crm@nasza-firma.pl',
      to: 'kontrahent@firma.pl',
      subject: 'Przypomnienie o płatności',
      content: 'Szanowni Państwo, uprzejmie przypominamy o zaległej płatności za fakturę nr 123/2024.',
      type: 'sent',
      status: 'sent',
      userId: adminUser.id,
      readAt: null,
      createdAt: new Date('2024-01-10')
    };
    
    const email3: Email = {
      id: randomUUID(),
      from: 'klient@firma.pl',
      to: 'crm@nasza-firma.pl',
      subject: 'Zapytanie o dostępność terminu',
      content: 'Dzień dobry, chciałbym zapytać o dostępność terminu na konsultację w przyszłym tygodniu.',
      type: 'received',
      status: 'unread',
      userId: adminUser.id,
      readAt: null,
      createdAt: new Date('2024-01-16')
    };
    
    const email4: Email = {
      id: randomUUID(),
      from: 'dostawca@firma.pl',
      to: 'crm@nasza-firma.pl',
      subject: 'Potwierdzenie realizacji zamówienia',
      content: 'Witam, potwierdzam przyjęcie zamówienia nr 456/2024 do realizacji. Szacowany termin dostawy: 5 dni roboczych.',
      type: 'received',
      status: 'read',
      userId: adminUser.id,
      readAt: new Date('2024-01-14'),
      createdAt: new Date('2024-01-13')
    };
    
    const email5: Email = {
      id: randomUUID(),
      from: 'partner@firma.pl',
      to: 'crm@nasza-firma.pl',
      subject: 'Propozycja współpracy',
      content: '<p>Szanowni Państwo,</p><p>Chciałbym <strong>zaproponować współpracę</strong> w zakresie:</p><ul><li>Wspólnych projektów IT</li><li>Wymiany doświadczeń</li><li>Organizacji szkoleń</li></ul><p>Proszę o kontakt w celu umówienia spotkania.</p>',
      type: 'received',
      status: 'unread',
      userId: adminUser.id,
      readAt: null,
      createdAt: new Date('2024-01-17')
    };
    
    this.emails.set(email1.id, email1);
    this.emails.set(email2.id, email2);
    this.emails.set(email3.id, email3);
    this.emails.set(email4.id, email4);
    this.emails.set(email5.id, email5);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || 'user',
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updateUser: UpdateUser): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, ...updateUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error("User not found");
    }
    this.users.delete(id);
  }

  // Contractors
  async getContractors(): Promise<Contractor[]> {
    return Array.from(this.contractors.values());
  }

  async getContractor(id: string): Promise<Contractor | undefined> {
    return this.contractors.get(id);
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const id = randomUUID();
    const contractor: Contractor = {
      ...insertContractor,
      id,
      nip: insertContractor.nip || null,
      regon: insertContractor.regon || null,
      krs: insertContractor.krs || null,
      accountNumber: insertContractor.accountNumber || null,
      province: insertContractor.province || null,
      address: insertContractor.address || null,
      city: insertContractor.city || null,
      postalCode: insertContractor.postalCode || null,
      country: insertContractor.country || null,
      status: insertContractor.status || 'active',
      createdAt: new Date()
    };
    this.contractors.set(id, contractor);
    return contractor;
  }

  async updateContractor(id: string, updates: Partial<InsertContractor>): Promise<Contractor> {
    const contractor = this.contractors.get(id);
    if (!contractor) throw new Error("Contractor not found");
    
    const updated = { ...contractor, ...updates };
    this.contractors.set(id, updated);
    return updated;
  }

  async deleteContractor(id: string): Promise<void> {
    this.contractors.delete(id);
  }

  // Tasks
  async getTasks(userId?: string): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    return userId ? tasks.filter(task => task.userId === userId) : tasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(taskData: InsertTask & { userId: string }): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...taskData,
      id,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  // Offers
  async getOffers(): Promise<Offer[]> {
    return Array.from(this.offers.values());
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = randomUUID();
    const offer: Offer = {
      ...insertOffer,
      id,
      contractorId: null,
      description: insertOffer.description || null,
      vatRate: insertOffer.vatRate || 23,
      discountPercent: insertOffer.discountPercent || 0,
      currency: insertOffer.currency || 'PLN',
      validUntil: typeof insertOffer.validUntil === 'string' ? new Date(insertOffer.validUntil) : insertOffer.validUntil || null,
      paymentTerms: insertOffer.paymentTerms || '14 dni',
      category: insertOffer.category || 'Standardowa',
      notes: insertOffer.notes || null,
      status: insertOffer.status || 'draft',
      sentAt: null,
      createdAt: new Date()
    };
    this.offers.set(id, offer);
    return offer;
  }

  async updateOffer(id: string, updates: Partial<InsertOffer>): Promise<Offer> {
    const offer = this.offers.get(id);
    if (!offer) throw new Error("Offer not found");
    
    const updated = { 
      ...offer, 
      ...updates,
      validUntil: updates.validUntil && typeof updates.validUntil === 'string' 
        ? new Date(updates.validUntil) 
        : updates.validUntil !== undefined 
          ? updates.validUntil 
          : offer.validUntil
    };
    this.offers.set(id, updated);
    return updated;
  }

  async deleteOffer(id: string): Promise<void> {
    this.offers.delete(id);
  }

  // Emails
  async getEmails(userId?: string): Promise<Email[]> {
    const emails = Array.from(this.emails.values());
    return userId ? emails.filter(email => email.userId === userId) : emails;
  }

  async getEmail(id: string): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(emailData: InsertEmail & { userId: string }): Promise<Email> {
    const id = randomUUID();
    const email: Email = {
      ...emailData,
      id,
      from: emailData.from || null,
      content: emailData.content || null,
      type: emailData.type || 'sent',
      status: emailData.status || 'draft',
      readAt: null,
      createdAt: new Date()
    };
    this.emails.set(id, email);
    return email;
  }

  async updateEmail(id: string, updates: Partial<InsertEmail & { readAt?: Date | null }>): Promise<Email> {
    const email = this.emails.get(id);
    if (!email) throw new Error("Email not found");
    
    const updated = { 
      ...email, 
      ...updates,
      readAt: updates.readAt !== undefined ? updates.readAt : email.readAt
    };
    this.emails.set(id, updated);
    return updated;
  }

  async deleteEmail(id: string): Promise<void> {
    this.emails.delete(id);
  }

  // Support Tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values());
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = randomUUID();
    const ticket: SupportTicket = {
      ...insertTicket,
      id,
      email: insertTicket.email || null,
      status: insertTicket.status || 'open',
      priority: insertTicket.priority || 'medium',
      createdAt: new Date()
    };
    this.supportTickets.set(id, ticket);
    return ticket;
  }

  async updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) throw new Error("Support ticket not found");
    
    const updated = { ...ticket, ...updates };
    this.supportTickets.set(id, updated);
    return updated;
  }

  async deleteSupportTicket(id: string): Promise<void> {
    this.supportTickets.delete(id);
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }

  async createNotification(notificationData: InsertNotification & { userId: string }): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...notificationData,
      id,
      type: notificationData.type || 'info',
      read: notificationData.read || false,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, read: true });
    }
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    Array.from(this.notifications.entries()).forEach(([id, notification]) => {
      if (notification.userId === userId && !notification.read) {
        this.notifications.set(id, { ...notification, read: true });
      }
    });
  }

  async globalSearch(searchTerm: string, userId: string, types: string[]): Promise<any[]> {
    const results: any[] = [];
    const term = searchTerm.toLowerCase();

    // Search contractors
    if (types.includes('contractor')) {
      Array.from(this.contractors.values()).forEach(contractor => {
        if (contractor.name.toLowerCase().includes(term) || 
            contractor.email?.toLowerCase().includes(term) ||
            contractor.phone?.includes(term) ||
            contractor.nip?.includes(term)) {
          results.push({
            id: contractor.id,
            type: 'contractor',
            title: contractor.name,
            subtitle: contractor.email || contractor.phone || '',
            details: `NIP: ${contractor.nip || 'Brak'} • Status: ${contractor.status}`,
            status: contractor.status
          });
        }
      });
    }

    // Search tasks
    if (types.includes('task')) {
      Array.from(this.tasks.values()).forEach(task => {
        if (task.title.toLowerCase().includes(term)) {
          results.push({
            id: task.id,
            type: 'task',
            title: task.title,
            subtitle: `${task.date} o ${task.time}`,
            details: `Priorytet: ${task.priority} • Status: ${task.status}`,
            status: task.status
          });
        }
      });
    }

    // Search offers
    if (types.includes('offer')) {
      Array.from(this.offers.values()).forEach(offer => {
        if (offer.title?.toLowerCase().includes(term) ||
            offer.contractorName?.toLowerCase().includes(term) ||
            offer.description?.toLowerCase().includes(term)) {
          results.push({
            id: offer.id,
            type: 'offer',
            title: offer.title || 'Oferta',
            subtitle: `Dla: ${offer.contractorName || 'Nieznany kontrahent'}`,
            details: `Kwota: ${offer.finalAmount} ${offer.currency} • Status: ${offer.status}`,
            status: offer.status
          });
        }
      });
    }

    // Search emails
    if (types.includes('email')) {
      Array.from(this.emails.values()).forEach(email => {
        if (email.subject.toLowerCase().includes(term) ||
            email.to.toLowerCase().includes(term) ||
            email.content?.toLowerCase().includes(term)) {
          results.push({
            id: email.id,
            type: 'email',
            title: email.subject,
            subtitle: `Do: ${email.to}`,
            details: `Status: ${email.status}`,
            status: email.status
          });
        }
      });
    }

    // Search support tickets
    if (types.includes('support')) {
      Array.from(this.supportTickets.values()).forEach(ticket => {
        if (ticket.user.toLowerCase().includes(term) ||
            ticket.issue.toLowerCase().includes(term) ||
            ticket.email?.toLowerCase().includes(term)) {
          results.push({
            id: ticket.id,
            type: 'support',
            title: `Zgłoszenie od ${ticket.user}`,
            subtitle: ticket.email || '',
            details: `${ticket.issue.substring(0, 100)}... • Status: ${ticket.status} • Priorytet: ${ticket.priority}`,
            status: ticket.status
          });
        }
      });
    }

    return results.slice(0, 20); // Limit to 20 results
  }

  async getAnalyticsData(dateRange: string): Promise<any> {
    const now = new Date();
    const daysBack = parseInt(dateRange, 10) || 30;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get all data
    const contractors = Array.from(this.contractors.values());
    const tasks = Array.from(this.tasks.values());
    const offers = Array.from(this.offers.values());
    const supportTickets = Array.from(this.supportTickets.values());
    const emails = Array.from(this.emails.values());

    // Filter by date range
    const filteredTasks = tasks.filter(task => task.createdAt && new Date(task.createdAt) >= startDate);
    const filteredTickets = supportTickets.filter(ticket => ticket.createdAt && new Date(ticket.createdAt) >= startDate);
    const filteredOffers = offers.filter(offer => offer.createdAt && new Date(offer.createdAt) >= startDate);
    const filteredEmails = emails.filter(email => email.createdAt && new Date(email.createdAt) >= startDate);

    // Calculate overview metrics
    const overview = {
      totalContractors: contractors.length,
      activeTasks: tasks.filter(task => task.status === 'in_progress').length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      openTickets: supportTickets.filter(ticket => ticket.status === 'open').length,
      resolvedTickets: supportTickets.filter(ticket => ticket.status === 'resolved').length,
      totalOffers: offers.length,
      acceptedOffers: offers.filter(offer => offer.status === 'accepted').length,
      totalEmails: emails.length
    };

    // Generate monthly data for tasks over time
    const tasksByMonth = this.generateMonthlyData(filteredTasks, daysBack);

    // Aggregate tickets by status
    const ticketsByStatus = [
      { status: 'Otwarte', count: overview.openTickets, color: '#ff7300' },
      { status: 'W trakcie', count: supportTickets.filter(ticket => ticket.status === 'in_progress').length, color: '#ffc658' },
      { status: 'Rozwiązane', count: overview.resolvedTickets, color: '#82ca9d' },
      { status: 'Zamknięte', count: supportTickets.filter(ticket => ticket.status === 'closed').length, color: '#8884d8' }
    ];

    // Group contractors by type (using mock distribution since type field doesn't exist)
    const contractorsByType = [
      { type: 'Dostawcy', count: Math.floor(contractors.length * 0.6) },
      { type: 'Klienci', count: Math.floor(contractors.length * 0.3) },
      { type: 'Partnerzy', count: Math.floor(contractors.length * 0.1) }
    ];

    // Offers by status
    const offersByStatus = [
      { status: 'Szkic', count: offers.filter(offer => offer.status === 'draft').length, color: '#8dd1e1' },
      { status: 'Wysłane', count: offers.filter(offer => offer.status === 'sent').length, color: '#ffc658' },
      { status: 'Zaakceptowane', count: offers.filter(offer => offer.status === 'accepted').length, color: '#82ca9d' },
      { status: 'Odrzucone', count: offers.filter(offer => offer.status === 'rejected').length, color: '#ff7300' }
    ];

    return {
      overview,
      charts: {
        tasksOverTime: tasksByMonth,
        ticketsByStatus,
        contractorsByType,
        offersByStatus
      }
    };
  }

  private generateMonthlyData(tasks: Task[], daysBack: number): Array<{ month: string; created: number; completed: number }> {
    const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    const months = Math.min(6, Math.ceil(daysBack / 30));
    const now = new Date();
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTasks = tasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });

      const completedTasks = tasks.filter(task => {
        if (task.status !== 'completed') return false;
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });

      data.push({
        month: monthNames[monthStart.getMonth()],
        created: monthTasks.length,
        completed: completedTasks.length
      });
    }

    return data;
  }
}

// Tymczasowo używamy MemStorage dopóki nie skonfigurujemy bazy danych
export const storage = new MemStorage();
