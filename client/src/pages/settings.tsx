import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Lock, Bell, Globe, Palette, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    contractorUpdates: true,
    taskReminders: true,
    supportTickets: true
  });

  const [systemSettings, setSystemSettings] = useState({
    language: "pl",
    timezone: "Europe/Warsaw",
    dateFormat: "DD/MM/YYYY"
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      await apiRequest("PUT", "/api/auth/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Profil został zaktualizowany",
      });
      setProfileData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się zaktualizować profilu",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Błąd",
        description: "Nowe hasła nie są identyczne",
        variant: "destructive",
      });
      return;
    }

    if (profileData.newPassword && profileData.newPassword.length < 6) {
      toast({
        title: "Błąd",
        description: "Nowe hasło musi mieć co najmniej 6 znaków",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handleNotificationSave = () => {
    // In a real app, this would save to backend
    toast({
      title: "Sukces",
      description: "Ustawienia powiadomień zostały zapisane",
    });
  };

  const handleSystemSave = () => {
    // In a real app, this would save to backend
    toast({
      title: "Sukces",
      description: "Ustawienia systemowe zostały zapisane",
    });
  };

  return (
    <MainLayout title="Ustawienia">
      <div className="max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Bezpieczeństwo
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Powiadomienia
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informacje o profilu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Nazwa użytkownika</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      data-testid="input-username"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      data-testid="input-email"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Zapisywanie..." : "Zapisz profil"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Zmiana hasła
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Aktualne hasło</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        data-testid="input-current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nowe hasło</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                        data-testid="input-new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        data-testid="input-confirm-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-change-password"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Zapisywanie..." : "Zmień hasło"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Preferencje powiadomień
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Powiadomienia email</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Otrzymuj powiadomienia na adres email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Powiadomienia push</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pokazuj powiadomienia w przeglądarce</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                      data-testid="switch-push-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="contractor-updates">Aktualizacje kontrahentów</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Powiadomienia o zmianach w kontrahentach</p>
                    </div>
                    <Switch
                      id="contractor-updates"
                      checked={notificationSettings.contractorUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, contractorUpdates: checked }))
                      }
                      data-testid="switch-contractor-updates"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="task-reminders">Przypomnienia o zadaniach</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Przypomnienia o nadchodzących zadaniach</p>
                    </div>
                    <Switch
                      id="task-reminders"
                      checked={notificationSettings.taskReminders}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, taskReminders: checked }))
                      }
                      data-testid="switch-task-reminders"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="support-tickets">Zgłoszenia wsparcia</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Powiadomienia o nowych zgłoszeniach</p>
                    </div>
                    <Switch
                      id="support-tickets"
                      checked={notificationSettings.supportTickets}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, supportTickets: checked }))
                      }
                      data-testid="switch-support-tickets"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNotificationSave} data-testid="button-save-notifications">
                    <Save className="w-4 h-4 mr-2" />
                    Zapisz ustawienia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Wygląd
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Motyw</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger data-testid="select-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Jasny</SelectItem>
                      <SelectItem value="dark">Ciemny</SelectItem>
                      <SelectItem value="system">Systemowy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Ustawienia regionalne
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Język</Label>
                  <Select value={systemSettings.language} onValueChange={(value) => 
                    setSystemSettings(prev => ({ ...prev, language: value }))
                  }>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pl">Polski</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Strefa czasowa</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => 
                    setSystemSettings(prev => ({ ...prev, timezone: value }))
                  }>
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Warsaw">Europa/Warszawa</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londyn</SelectItem>
                      <SelectItem value="Europe/Berlin">Europa/Berlin</SelectItem>
                      <SelectItem value="America/New_York">Ameryka/Nowy Jork</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">Format daty</Label>
                  <Select value={systemSettings.dateFormat} onValueChange={(value) => 
                    setSystemSettings(prev => ({ ...prev, dateFormat: value }))
                  }>
                    <SelectTrigger data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSystemSave} data-testid="button-save-system">
                    <Save className="w-4 h-4 mr-2" />
                    Zapisz ustawienia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}