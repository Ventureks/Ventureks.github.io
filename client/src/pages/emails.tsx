import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Settings, AlertCircle, CheckCircle, Clock, Mail, Inbox, Eye, EyeOff, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/RichTextEditor";
import { EmailDetailModal } from "@/components/EmailDetailModal";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Email } from "@shared/schema";

export default function Emails() {
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    content: "",
    status: "draft"
  });
  
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: emails, isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });
  
  const sentEmails = emails?.filter(email => email.type === 'sent') || [];
  const receivedEmails = emails?.filter(email => email.type === 'received') || [];
  const unreadCount = receivedEmails.filter(email => email.status === 'unread').length;

  const { data: smtpStatus } = useQuery<{
    configured: boolean;
    host: string | null;
    port: number | null;
  }>({
    queryKey: ["/api/smtp/status"],
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: typeof newEmail) => {
      await apiRequest("POST", "/api/emails", {
        ...data,
        status: "sent",
        userId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      setNewEmail({ to: "", subject: "", content: "", status: "draft" });
      toast({
        title: "Sukces",
        description: smtpStatus?.configured ? "Email został wysłany" : "Email zapisany jako szkic",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się wysłać emaila",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (emailId: string) => {
      await apiRequest("PATCH", `/api/emails/${emailId}/mark-read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
    },
  });
  
  const markAsUnreadMutation = useMutation({
    mutationFn: async (emailId: string) => {
      await apiRequest("PATCH", `/api/emails/${emailId}/mark-unread`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
    },
  });
  
  const deleteEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      await apiRequest("DELETE", `/api/emails/${emailId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Email został usunięty.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      setIsDetailModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć emaila.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendEmailMutation.mutate(newEmail);
  };
  
  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setIsDetailModalOpen(true);
    
    // Automatically mark received emails as read when opened
    if (email.type === 'received' && email.status === 'unread') {
      markAsReadMutation.mutate(email.id);
    }
  };
  
  const handleMarkAsRead = (emailId: string) => {
    markAsReadMutation.mutate(emailId);
  };
  
  const handleMarkAsUnread = (emailId: string) => {
    markAsUnreadMutation.mutate(emailId);
  };
  
  const handleDeleteEmail = (emailId: string) => {
    deleteEmailMutation.mutate(emailId);
  };

  if (isLoading) {
    return (
      <MainLayout title="Wiadomości email">
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  const getStatusIcon = (status: string, type: string = 'sent') => {
    if (type === 'received') {
      return status === 'read' ? <Eye className="w-4 h-4" /> : <Mail className="w-4 h-4" />;
    }
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string, type: string = 'sent') => {
    if (type === 'received') {
      return status === 'read' 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  const getStatusText = (status: string, type: string = 'sent') => {
    if (type === 'received') {
      return status === 'read' ? 'Przeczytane' : 'Nieprzeczytane';
    }
    switch (status) {
      case "sent":
        return "Wysłany";
      case "failed":
        return "Błąd";
      default:
        return "Szkic";
    }
  };

  return (
    <MainLayout title="Wiadomości email">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Serwis e-mail</h2>
          <Link href="/email-settings">
            <Button variant="outline" size="sm" data-testid="button-email-settings">
              <Settings className="w-4 h-4 mr-2" />
              Ustawienia SMTP
            </Button>
          </Link>
        </div>

        {/* SMTP Status Alert */}
        {!smtpStatus?.configured && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              SMTP nie jest skonfigurowany. Wiadomości będą zapisane jako szkice.{" "}
              <Link href="/email-settings" className="underline">
                Skonfiguruj SMTP
              </Link>
            </AlertDescription>
          </Alert>
        )}
        
        {smtpStatus?.configured && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              SMTP jest skonfigurowany i gotowy do użycia ({smtpStatus.host}:{smtpStatus.port})
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Email Form */}
          <Card>
            <CardHeader>
              <CardTitle>Nowa wiadomość</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="to">Do (email)</Label>
                  <Input
                    id="to"
                    type="email"
                    placeholder="adres@email.pl"
                    value={newEmail.to}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, to: e.target.value }))}
                    required
                    data-testid="input-email-to"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Temat</Label>
                  <Input
                    id="subject"
                    placeholder="Temat wiadomości"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    data-testid="input-email-subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Treść wiadomości</Label>
                  <RichTextEditor
                    value={newEmail.content}
                    onChange={(content) => setNewEmail(prev => ({ ...prev, content }))}
                    placeholder="Treść wiadomości"
                    className="mt-2"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={sendEmailMutation.isPending}
                  className="w-full flex items-center"
                  data-testid="button-send-email"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendEmailMutation.isPending 
                    ? "Wysyłanie..." 
                    : smtpStatus?.configured 
                      ? "Wyślij email" 
                      : "Zapisz jako szkic"
                  }
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Email History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Historia wiadomości
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} nieprzeczytanych
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Wszystkie ({emails?.length || 0})</TabsTrigger>
                  <TabsTrigger value="received">
                    <Inbox className="w-4 h-4 mr-1" />
                    Otrzymane ({receivedEmails.length})
                  </TabsTrigger>
                  <TabsTrigger value="sent">
                    <Send className="w-4 h-4 mr-1" />
                    Wysłane ({sentEmails.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-3">
                  {emails?.map((email) => (
                    <EmailItem 
                      key={email.id} 
                      email={email} 
                      onClick={() => handleEmailClick(email)}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getStatusText={getStatusText}
                    />
                  ))}
                  {(!emails || emails.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      Brak wiadomości email
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="received" className="space-y-3">
                  {receivedEmails.map((email) => (
                    <EmailItem 
                      key={email.id} 
                      email={email} 
                      onClick={() => handleEmailClick(email)}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getStatusText={getStatusText}
                    />
                  ))}
                  {receivedEmails.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Brak otrzymanych wiadomości
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sent" className="space-y-3">
                  {sentEmails.map((email) => (
                    <EmailItem 
                      key={email.id} 
                      email={email} 
                      onClick={() => handleEmailClick(email)}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getStatusText={getStatusText}
                    />
                  ))}
                  {sentEmails.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Brak wysłanych wiadomości
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <EmailDetailModal 
        email={selectedEmail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsUnread={handleMarkAsUnread}
        onDelete={handleDeleteEmail}
      />
    </MainLayout>
  );
}

interface EmailItemProps {
  email: Email;
  onClick: () => void;
  getStatusColor: (status: string, type: string) => string;
  getStatusIcon: (status: string, type: string) => React.ReactNode;
  getStatusText: (status: string, type: string) => string;
}

function EmailItem({ email, onClick, getStatusColor, getStatusIcon, getStatusText }: EmailItemProps) {
  const isUnread = email.type === 'received' && email.status === 'unread';
  
  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors
        ${
          isUnread 
            ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900' 
            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
        }
      `}
      onClick={onClick}
      data-testid={`email-${email.id}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-gray-900 dark:text-gray-100 truncate ${
            isUnread ? 'font-bold' : ''
          }`}>
            {email.subject}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {email.type === 'received' ? `Od: ${email.from}` : `Do: ${email.to}`}
          </div>
          {email.type === 'received' && isUnread && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Nowa wiadomość
            </div>
          )}
        </div>
        <div className="text-sm flex flex-col items-end gap-1 ml-4">
          <Badge 
            variant={email.status === "sent" ? "default" : "secondary"}
            className={getStatusColor(email.status, email.type)}
          >
            <span className="flex items-center space-x-1">
              {getStatusIcon(email.status, email.type)}
              <span>{getStatusText(email.status, email.type)}</span>
            </span>
          </Badge>
          <div className="text-gray-500 dark:text-gray-400">
            {email.createdAt ? new Date(email.createdAt).toLocaleDateString('pl-PL') : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
