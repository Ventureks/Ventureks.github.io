import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

export function NotificationsDropdown() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się oznaczyć powiadomienia",
        variant: "destructive",
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się oznaczyć powiadomień",
        variant: "destructive",
      });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    markReadMutation.mutate(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "";
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "przed chwilą";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} godz. temu`;
    return `${Math.floor(diffMins / 1440)} dni temu`;
  };

  const handleDropdownOpen = () => {
    // Mark all notifications as read when dropdown opens
    if (unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) handleDropdownOpen(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="notifications-trigger">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
              data-testid="notification-badge"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <DropdownMenuLabel className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span>Powiadomienia</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} nowych
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Ładowanie...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Brak powiadomień
          </div>
        ) : (
          <ScrollArea className="h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer border-b ${
                  !notification.read 
                    ? "bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-lg mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      !notification.read 
                        ? "font-medium text-gray-900 dark:text-white" 
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                      onClick={(e) => handleMarkRead(e, notification.id)}
                      data-testid={`mark-read-${notification.id}`}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}