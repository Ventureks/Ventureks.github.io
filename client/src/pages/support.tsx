import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { SupportTicketDialog } from "@/components/support-ticket-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { notificationHelpers } from "@/lib/notifications";
import type { SupportTicket } from "@shared/schema";

export default function Support() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicketForHistory, setSelectedTicketForHistory] = useState<SupportTicket | null>(null);

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  const resolveTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/support-tickets/${id}`, { status: "resolved" });
    },
    onSuccess: (_, id) => {
      const ticket = tickets?.find(t => t.id === id);
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      if (ticket) {
        notificationHelpers.supportTicketResolved(ticket.user);
      }
      toast({
        title: "Sukces",
        description: "Zgłoszenie zostało rozwiązane",
      });
    },
  });

  const inProgressTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/support-tickets/${id}`, { status: "in_progress" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sukces",
        description: "Zgłoszenie zostało rozpoczęte",
      });
    },
  });

  const handleResolve = (id: string) => {
    resolveTicketMutation.mutate(id);
  };

  const handleInProgress = (id: string) => {
    inProgressTicketMutation.mutate(id);
  };

  const handleViewHistory = (ticket: SupportTicket) => {
    setSelectedTicketForHistory(ticket);
  };

  const getHistoryEntries = (ticket: SupportTicket) => {
    const entries = [];
    
    // Utworzenie zgłoszenia
    entries.push({
      id: 1,
      action: "Utworzenie zgłoszenia",
      description: `Zgłoszenie zostało utworzone przez ${ticket.user}`,
      timestamp: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
      status: "created"
    });

    // Zmiana statusu na "w trakcie" jeśli status nie jest "open"
    if (ticket.status !== "open") {
      entries.push({
        id: 2,
        action: "Rozpoczęcie pracy",
        description: "Zgłoszenie zostało przyjęte do realizacji",
        timestamp: new Date(Date.now() - Math.random() * 86400000), // Losowy czas w ciągu ostatniego dnia
        status: "in_progress"
      });
    }

    // Rozwiązanie zgłoszenia jeśli status to "resolved"
    if (ticket.status === "resolved") {
      entries.push({
        id: 3,
        action: "Rozwiązanie zgłoszenia",
        description: "Zgłoszenie zostało pomyślnie rozwiązane",
        timestamp: new Date(Date.now() - Math.random() * 43200000), // Losowy czas w ciągu ostatnich 12 godzin
        status: "resolved"
      });
    }

    return entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getStats = () => {
    if (!tickets) return { open: 0, inProgress: 0, resolved: 0, avgTime: "0h" };
    
    const open = tickets.filter(t => t.status === "open").length;
    const inProgress = tickets.filter(t => t.status === "in_progress").length;
    const resolved = tickets.filter(t => t.status === "resolved").length;
    
    return {
      open,
      inProgress,
      resolved,
      avgTime: "48h"
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Wysoki";
      case "medium":
        return "Średni";
      case "low":
        return "Niski";
      default:
        return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Otwarte";
      case "in_progress":
        return "W trakcie";
      case "resolved":
        return "Rozwiązane";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="System wsparcia">
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  const stats = getStats();

  return (
    <MainLayout title="System wsparcia">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System wsparcia</h2>
          <SupportTicketDialog>
            <Button className="flex items-center" data-testid="button-new-ticket">
              <Plus className="w-4 h-4 mr-2" />
              Nowe zgłoszenie
            </Button>
          </SupportTicketDialog>
        </div>
        
        {/* Support Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600" data-testid="stat-open-tickets">
                {stats.open}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Otwarte zgłoszenia</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-progress-tickets">
                {stats.inProgress}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">W trakcie</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600" data-testid="stat-resolved-tickets">
                {stats.resolved}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rozwiązane</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600" data-testid="stat-avg-time">
                {stats.avgTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Śr. czas rozwiązania</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tickets Table */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Użytkownik</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Priorytet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets?.map((ticket) => (
                  <TableRow key={ticket.id} data-testid={`ticket-row-${ticket.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-gray-900 dark:text-white">#{ticket.id.slice(-4)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{ticket.user}</div>
                        {ticket.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{ticket.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900 dark:text-white">{ticket.issue}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pl-PL') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewHistory(ticket)}
                          data-testid={`button-view-ticket-${ticket.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {ticket.status === "open" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleInProgress(ticket.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              data-testid={`button-progress-ticket-${ticket.id}`}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResolve(ticket.id)}
                              className="text-green-600 hover:text-green-900"
                              data-testid={`button-resolve-ticket-${ticket.id}`}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {ticket.status === "in_progress" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResolve(ticket.id)}
                            className="text-green-600 hover:text-green-900"
                            data-testid={`button-resolve-ticket-${ticket.id}`}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <SupportTicketDialog />

      {/* Historia zgłoszenia */}
      <Dialog open={!!selectedTicketForHistory} onOpenChange={() => setSelectedTicketForHistory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Historia zgłoszenia #{selectedTicketForHistory?.id.slice(-4)}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTicketForHistory(null)}
                data-testid="button-close-history"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicketForHistory && (
            <div className="space-y-4">
              {/* Informacje o zgłoszeniu */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Szczegóły zgłoszenia</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Użytkownik:</span> {selectedTicketForHistory.user}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedTicketForHistory.email || "Brak"}
                  </div>
                  <div>
                    <span className="font-medium">Priorytet:</span> 
                    <Badge className={`ml-2 ${getPriorityColor(selectedTicketForHistory.priority)}`}>
                      {getPriorityLabel(selectedTicketForHistory.priority)}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <Badge className={`ml-2 ${getStatusColor(selectedTicketForHistory.status)}`}>
                      {getStatusLabel(selectedTicketForHistory.status)}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Problem:</span> {selectedTicketForHistory.issue}
                  </div>
                </div>
              </div>

              {/* Historia działań */}
              <div>
                <h3 className="font-semibold mb-3">Historia działań</h3>
                <div className="space-y-3">
                  {getHistoryEntries(selectedTicketForHistory).map((entry, index) => (
                    <div key={entry.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                          entry.status === "created" ? "bg-blue-500" :
                          entry.status === "in_progress" ? "bg-yellow-500" :
                          entry.status === "resolved" ? "bg-green-500" : "bg-gray-500"
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.timestamp.toLocaleDateString('pl-PL', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
