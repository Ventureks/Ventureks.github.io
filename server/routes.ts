import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContractorSchema, insertTaskSchema, insertOfferSchema, insertEmailSchema, insertSupportTicketSchema, insertNotificationSchema, insertUserSchema, updateUserSchema } from "@shared/schema";
import { EmailService } from "./email-service";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

// Initialize email service
const emailService = new EmailService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, recaptchaToken } = req.body;
      
      // Google reCAPTCHA validation
      if (!recaptchaToken) {
        return res.status(400).json({ message: "Weryfikacja reCAPTCHA jest wymagana" });
      }

      // Verify reCAPTCHA token with Google (using test key - always passes in development)
      const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe&response=${recaptchaToken}`,
      });

      const recaptchaData = await recaptchaResponse.json();
      if (!recaptchaData.success) {
        return res.status(400).json({ message: "Weryfikacja reCAPTCHA nieudana" });
      }
      
      // Sprawdź dane logowania
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
      }
      
      // Ustaw sesję dla aplikacji webowej
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      };
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  // Wylogowanie
  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Błąd podczas wylogowania" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Wylogowano pomyślnie" });
    });
  });

  // Sprawdzenie statusu sesji
  app.get("/api/auth/me", (req, res) => {
    const user = (req.session as any)?.user;
    if (user) {
      res.json({ user });
    } else {
      res.status(401).json({ message: "Brak autoryzacji" });
    }
  });

  // Contractors
  app.get("/api/contractors", async (req, res) => {
    try {
      const contractors = await storage.getContractors();
      res.json(contractors);
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania kontrahentów" });
    }
  });

  app.post("/api/contractors", async (req, res) => {
    try {
      const result = insertContractorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      const contractor = await storage.createContractor(result.data);
      res.status(201).json(contractor);
    } catch (error) {
      res.status(500).json({ message: "Błąd tworzenia kontrahenta" });
    }
  });

  app.put("/api/contractors/:id", async (req, res) => {
    try {
      const result = insertContractorSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      const contractor = await storage.updateContractor(req.params.id, result.data);
      res.json(contractor);
    } catch (error) {
      res.status(500).json({ message: "Błąd aktualizacji kontrahenta" });
    }
  });

  app.delete("/api/contractors/:id", async (req, res) => {
    try {
      await storage.deleteContractor(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Błąd usuwania kontrahenta" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania zadań" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const { userId, ...taskData } = req.body;
      const result = insertTaskSchema.safeParse(taskData);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      const task = await storage.createTask({ ...result.data, userId });
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Błąd tworzenia zadania" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const result = insertTaskSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      const task = await storage.updateTask(req.params.id, result.data);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Błąd aktualizacji zadania" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Błąd usuwania zadania" });
    }
  });

  // Offers
  app.get("/api/offers", async (req, res) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania ofert" });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      console.log("Received offer data:", JSON.stringify(req.body, null, 2));
      const result = insertOfferSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Validation errors:", JSON.stringify(result.error.errors, null, 2));
        return res.status(400).json({ 
          message: "Nieprawidłowe dane",
          errors: result.error.errors 
        });
      }
      
      console.log("Validated data:", JSON.stringify(result.data, null, 2));
      const offer = await storage.createOffer(result.data);
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "Błąd tworzenia oferty" });
    }
  });

  app.put("/api/offers/:id", async (req, res) => {
    try {
      const result = insertOfferSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      const offer = await storage.updateOffer(req.params.id, result.data);
      res.json(offer);
    } catch (error) {
      res.status(500).json({ message: "Błąd aktualizacji oferty" });
    }
  });

  app.delete("/api/offers/:id", async (req, res) => {
    try {
      await storage.deleteOffer(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Błąd usuwania oferty" });
    }
  });

  // Emails
  app.get("/api/emails", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const emails = await storage.getEmails(userId);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania emaili" });
    }
  });

  app.post("/api/emails", async (req, res) => {
    try {
      const { userId, ...emailData } = req.body;
      const result = insertEmailSchema.safeParse(emailData);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      // Save email to database first
      const email = await storage.createEmail({ ...result.data, userId });
      
      // Send email via SMTP if configured and status is "sent"
      if (result.data.status === "sent" && emailService.isConfigured()) {
        const smtpResult = await emailService.sendEmail({
          to: result.data.to,
          subject: result.data.subject,
          content: result.data.content || ""
        });
        
        if (!smtpResult.success) {
          // Update email status to failed if SMTP sending failed
          await storage.updateEmail(email.id, { status: "failed" });
          return res.status(500).json({ 
            message: `Email zapisany ale nie wysłany: ${smtpResult.error}` 
          });
        }
      }
      
      res.status(201).json(email);
    } catch (error) {
      res.status(500).json({ message: "Błąd tworzenia emaila" });
    }
  });

  app.patch("/api/emails/:id/mark-read", async (req, res) => {
    try {
      const { id } = req.params;
      const email = await storage.updateEmail(id, {
        status: 'read',
        readAt: new Date()
      });
      res.json(email);
    } catch (error) {
      console.error("Error marking email as read:", error);
      res.status(500).json({ message: "Failed to mark email as read" });
    }
  });

  app.patch("/api/emails/:id/mark-unread", async (req, res) => {
    try {
      const { id } = req.params;
      const email = await storage.updateEmail(id, {
        status: 'unread',
        readAt: null
      });
      res.json(email);
    } catch (error) {
      console.error("Error marking email as unread:", error);
      res.status(500).json({ message: "Failed to mark email as unread" });
    }
  });

  app.delete("/api/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmail(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email:", error);
      res.status(500).json({ message: "Failed to delete email" });
    }
  });

  // Support Tickets
  app.get("/api/support-tickets", async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania zgłoszeń" });
    }
  });

  app.post("/api/support-tickets", async (req, res) => {
    try {
      const result = insertSupportTicketSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      const ticket = await storage.createSupportTicket(result.data);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Błąd tworzenia zgłoszenia" });
    }
  });

  app.put("/api/support-tickets/:id", async (req, res) => {
    try {
      const result = insertSupportTicketSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      const ticket = await storage.updateSupportTicket(req.params.id, result.data);
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Błąd aktualizacji zgłoszenia" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = "default-user"; // For now, using default user since we don't have auth
      const notifications = await storage.getNotifications(userId);
      res.json(notifications.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania powiadomień" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const result = insertNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
      }
      
      const notification = await storage.createNotification({
        ...result.data,
        userId: "default-user"
      });
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: "Błąd tworzenia powiadomienia" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Błąd oznaczania powiadomienia" });
    }
  });

  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const userId = "default-user";
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Błąd oznaczania powiadomień" });
    }
  });

  // SMTP Configuration endpoints
  app.get("/api/smtp/status", async (req, res) => {
    try {
      const config = emailService.getConfig();
      res.json({
        configured: emailService.isConfigured(),
        host: config?.host || null,
        port: config?.port || null,
        secure: config?.secure || false,
        user: config?.auth.user || null
      });
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania statusu SMTP" });
    }
  });

  app.post("/api/smtp/configure", async (req, res) => {
    try {
      const { host, port, secure, user, pass } = req.body;
      
      if (!host || !port || !user || !pass) {
        return res.status(400).json({ message: "Wszystkie pola SMTP są wymagane" });
      }
      
      emailService.configure({
        host,
        port: parseInt(port),
        secure: Boolean(secure),
        auth: { user, pass }
      });
      
      res.json({ success: true, message: "Konfiguracja SMTP została zapisana" });
    } catch (error) {
      res.status(500).json({ message: "Błąd konfiguracji SMTP" });
    }
  });

  app.post("/api/smtp/test", async (req, res) => {
    try {
      const result = await emailService.testConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Błąd testowania połączenia SMTP" 
      });
    }
  });

  // Global search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const { q: searchTerm, types, status } = req.query;
      
      if (!searchTerm || (searchTerm as string).length < 2) {
        return res.json([]);
      }

      const userId = "default-user";
      const typesArray = types ? (types as string).split(',') : ['contractor', 'task', 'offer', 'email', 'support'];
      const results = await storage.globalSearch(searchTerm as string, userId, typesArray);
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Błąd wyszukiwania" });
    }
  });

  // User management (admin only)
  app.get("/api/users", async (req, res) => {
    try {
      // In a real app, check for admin authentication here
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania użytkowników" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const parsedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(parsedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Błąd tworzenia użytkownika" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const parsedData = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(id, parsedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Błąd aktualizacji użytkownika" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Błąd usuwania użytkownika" });
    }
  });

  // Object Storage endpoints
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Statistics for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const contractors = await storage.getContractors();
      const tasks = await storage.getTasks();
      const tickets = await storage.getSupportTickets();
      const offers = await storage.getOffers();
      
      const stats = {
        contractors: contractors.length,
        activeTasks: tasks.filter(t => t.status === "pending").length,
        openTickets: tickets.filter(t => t.status === "open").length,
        sentOffers: offers.filter(o => o.status === "sent").length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Błąd pobierania statystyk" });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const { range } = req.query;
      const dateRange = typeof range === 'string' ? range : '30';
      
      const analyticsData = await storage.getAnalyticsData(dateRange);
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ message: "Błąd pobierania danych analitycznych" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
