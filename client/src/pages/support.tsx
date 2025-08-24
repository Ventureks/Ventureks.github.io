import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { SupportTicketDialog } from "@/components/support-ticket-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SupportTicket } from "@shared/schema";

export default function Support() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  const resolveTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/support-tickets/${id}`, { status: "resolved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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

  const getStats = () => {
    if (!tickets) return { open: 0, inProgress: 0, resolved: 0, avgTime: "0h" };
    
    const open = tickets.filter(t => t.status === "open").length;
    const inProgress = tickets.filter(t => t.status === "in_progress").length;
    const resolved = tickets.filter(t => t.status === "resolved").length;
    
    return {
      open,
      inProgress,
      resolved,
      avgTime: "2.3h"
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
                        <Button variant="ghost" size="icon" data-testid={`button-view-ticket-${ticket.id}`}>
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
    </MainLayout>
  );
}
