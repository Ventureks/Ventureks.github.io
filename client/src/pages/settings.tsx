import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Lock, Bell, Globe, Palette, Save, Eye, EyeOff, Users, Plus, Edit, Trash2, ChevronDown, Info, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";
import type { User as UserType, InsertUser, UpdateUser } from "@shared/schema";

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

  // User management state
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user"
  });

  // Users query - only for admin
  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin",
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

  // User management mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sukces",
        description: "Użytkownik został utworzony",
      });
      setShowAddUserForm(false);
      setNewUser({ username: "", email: "", password: "", role: "user" });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się utworzyć użytkownika",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUser }) => {
      await apiRequest("PUT", `/api/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sukces",
        description: "Użytkownik został zaktualizowany",
      });
      setEditingUserId(null);
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się zaktualizować użytkownika",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sukces",
        description: "Użytkownik został usunięty",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się usunąć użytkownika",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast({
        title: "Błąd",
        description: "Wszystkie pola są wymagane",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleDeleteUser = (id: string, username: string) => {
    if (id === user?.id) {
      toast({
        title: "Błąd",
        description: "Nie możesz usunąć swojego własnego konta",
        variant: "destructive",
      });
      return;
    }
    if (confirm(`Czy na pewno chcesz usunąć użytkownika "${username}"?`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleUpdateUserRole = (userId: string, newRole: string) => {
    if (userId === user?.id && newRole !== user.role) {
      toast({
        title: "Błąd",
        description: "Nie możesz zmienić swojej własnej roli",
        variant: "destructive",
      });
      return;
    }
    updateUserMutation.mutate({ id: userId, data: { role: newRole } });
  };

  return (
    <MainLayout title="Ustawienia">
      <div className="max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={`grid w-full ${user?.role === "admin" ? "grid-cols-6" : "grid-cols-5"}`}>
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
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Informacje
            </TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Użytkownicy
              </TabsTrigger>
            )}
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

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Informacje o systemie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center space-y-2 border rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">System CRM</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300">version 0.2</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Autor: Dawid</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Aktualizacje
                    </h4>
                    <div className="space-y-3 border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Wersja 0.2</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dodano system powiadomień i ulepszono interfejs użytkownika</p>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Aktualna</span>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Wersja 0.1</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pierwsze wydanie systemu CRM</p>
                          </div>
                          <span className="text-xs text-gray-500">Poprzednia</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab - Admin Only */}
          {user?.role === "admin" && (
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">Zarządzanie użytkownikami</CardTitle>
                  <Button
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-add-user"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj użytkownika
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddUserForm && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                      <h3 className="text-lg font-semibold mb-4">Nowy użytkownik</h3>
                      <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-username">Nazwa użytkownika</Label>
                          <Input
                            id="new-username"
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            placeholder="Wprowadź nazwę użytkownika"
                            data-testid="input-new-username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-email">Email</Label>
                          <Input
                            id="new-email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="Wprowadź adres email"
                            data-testid="input-new-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-password">Hasło</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Wprowadź hasło"
                            data-testid="input-new-password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-role">Rola</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                            <SelectTrigger data-testid="select-new-role">
                              <SelectValue placeholder="Wybierz rolę" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Użytkownik</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                          <Button
                            type="submit"
                            disabled={createUserMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid="button-create-user"
                          >
                            {createUserMutation.isPending ? "Tworzenie..." : "Utwórz użytkownika"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddUserForm(false);
                              setNewUser({ username: "", email: "", password: "", role: "user" });
                            }}
                            data-testid="button-cancel-add-user"
                          >
                            Anuluj
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nazwa użytkownika</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rola</TableHead>
                        <TableHead>Data utworzenia</TableHead>
                        <TableHead>Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell className="font-medium" data-testid={`text-username-${userItem.id}`}>
                            {userItem.username}
                          </TableCell>
                          <TableCell data-testid={`text-email-${userItem.id}`}>
                            {userItem.email}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={userItem.role}
                              onValueChange={(value) => handleUpdateUserRole(userItem.id, value)}
                              disabled={userItem.id === user?.id}
                            >
                              <SelectTrigger className="w-fit border-none p-0 h-auto focus:ring-0 [&>svg]:hidden" data-testid={`select-role-${userItem.id}`}>
                                <div className="flex items-center">
                                  <Badge 
                                    variant={userItem.role === 'admin' ? 'destructive' : 'default'}
                                    className={`cursor-pointer text-xs px-2 py-1 ${userItem.role === 'admin' ? '' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}
                                  >
                                    {userItem.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                                  </Badge>
                                  <ChevronDown className="w-3 h-3 ml-1 text-muted-foreground" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">
                                  <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Użytkownik</Badge>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <Badge variant="destructive">Administrator</Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell data-testid={`text-created-${userItem.id}`}>
                            {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString('pl-PL') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                                disabled={userItem.id === user?.id || deleteUserMutation.isPending}
                                data-testid={`button-delete-${userItem.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Brak użytkowników do wyświetlenia
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}