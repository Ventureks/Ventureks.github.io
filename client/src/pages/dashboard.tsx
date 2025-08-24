import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Users, CheckCircle, AlertCircle, FileText, Plus, Calendar, Mail, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import type { Stats } from "@/lib/types";
import type { Notification } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const recentNotifications = notifications.slice(0, 5);

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

  if (isLoading) {
    return (
      <MainLayout title="Panel główny">
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Panel główny">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-contractors">
                    {stats?.contractors || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Kontrahenci</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-tasks">
                    {stats?.activeTasks || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Aktywne zadania</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-tickets">
                    {stats?.openTickets || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Otwarte zgłoszenia</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-offers">
                    {stats?.sentOffers || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Wysłane oferty</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Ostatnie powiadomienia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Brak powiadomień
                  </div>
                ) : (
                  recentNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                          <Bell className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className={`text-sm ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'font-medium text-gray-900 dark:text-white'}`}>
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Szybkie akcje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setLocation("/contractors")}
                  data-testid="quick-action-contractor"
                >
                  <Plus className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">Dodaj nowego kontrahenta</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setLocation("/tasks")}
                  data-testid="quick-action-meeting"
                >
                  <Calendar className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">Zaplanuj spotkanie</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setLocation("/offers")}
                  data-testid="quick-action-offer"
                >
                  <FileText className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">Utwórz nową ofertę</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setLocation("/emails")}
                  data-testid="quick-action-email"
                >
                  <Mail className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">Wyślij wiadomość email</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
