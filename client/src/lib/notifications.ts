import { apiRequest } from "@/lib/queryClient";
import type { InsertNotification } from "@shared/schema";

export const createNotification = async (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
  try {
    const notification: InsertNotification = {
      message,
      type,
      read: false,
    };
    
    await apiRequest("POST", "/api/notifications", notification);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

// Helper function to create notifications for common actions
export const notificationHelpers = {
  contractorCreated: (name: string) => 
    createNotification(`Nowy kontrahent "${name}" został dodany`, "success"),
  
  contractorUpdated: (name: string) => 
    createNotification(`Kontrahent "${name}" został zaktualizowany`, "info"),
  
  taskCreated: (title: string) => 
    createNotification(`Nowe zadanie "${title}" zostało utworzone`, "success"),
  
  taskCompleted: (title: string) => 
    createNotification(`Zadanie "${title}" zostało ukończone`, "success"),
  
  offerCreated: (contractor: string) => 
    createNotification(`Nowa oferta dla "${contractor}" została utworzona`, "success"),
  
  offerUpdated: (contractor: string) => 
    createNotification(`Oferta dla "${contractor}" została zaktualizowana`, "info"),
  
  emailSent: (to: string) => 
    createNotification(`Email został wysłany do ${to}`, "success"),
  
  supportTicketCreated: (user: string) => 
    createNotification(`Nowe zgłoszenie od ${user}`, "warning"),
  
  supportTicketResolved: (user: string) => 
    createNotification(`Zgłoszenie od ${user} zostało rozwiązane`, "success"),
};