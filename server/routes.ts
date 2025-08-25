import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContractorSchema, insertTaskSchema, insertOfferSchema, insertEmailSchema, insertSupportTicketSchema, insertNotificationSchema, insertUserSchema, updateUserSchema } from "@shared/schema";
import { emailService } from "./email-service";

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
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
      }
      
      // In production, use proper session management
      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
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

  const httpServer = createServer(app);
  return httpServer;
}
