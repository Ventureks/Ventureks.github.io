import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { notificationHelpers } from "@/lib/notifications";
import type { Contractor } from "@shared/schema";

export default function Contractors() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [newContractor, setNewContractor] = useState({
    name: "",
    email: "",
    phone: "",
    nip: "",
    regon: "",
    krs: "",
    accountNumber: "",
    province: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Polska",
    status: "active"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contractors, isLoading } = useQuery<Contractor[]>({
    queryKey: ["/api/contractors"],
  });

  const createContractorMutation = useMutation({
    mutationFn: async (data: typeof newContractor) => {
      await apiRequest("POST", "/api/contractors", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contractors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      notificationHelpers.contractorCreated(variables.name);
      setShowAddForm(false);
      setNewContractor({ 
        name: "", 
        email: "", 
        phone: "", 
        nip: "", 
        regon: "",
        krs: "",
        accountNumber: "",
        province: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Polska",
        status: "active" 
      });
      toast({
        title: "Sukces",
        description: "Kontrahent został dodany",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się dodać kontrahenta",
        variant: "destructive",
      });
    },
  });

  const deleteContractorMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contractors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contractors"] });
      toast({
        title: "Sukces",
        description: "Kontrahent został usunięty",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się usunąć kontrahenta",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContractorMutation.mutate(newContractor);
  };

  const handleDelete = (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć tego kontrahenta?")) {
      deleteContractorMutation.mutate(id);
    }
  };

  const handleViewDetails = (contractor: Contractor) => {
    setSelectedContractor(contractor);
  };

  if (isLoading) {
    return (
      <MainLayout title="Kontrahenci">
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Kontrahenci">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kontrahenci</h2>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center"
            data-testid="button-add-contractor"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj kontrahenta
          </Button>
        </div>
        
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Dodaj nowego kontrahenta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nazwa firmy</Label>
                    <Input
                      id="name"
                      placeholder="Wprowadź nazwę firmy"
                      value={newContractor.name}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, name: e.target.value }))}
                      required
                      data-testid="input-contractor-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="kontakt@firma.pl"
                      value={newContractor.email}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, email: e.target.value }))}
                      required
                      data-testid="input-contractor-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+48 123 456 789"
                      value={newContractor.phone}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      data-testid="input-contractor-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nip">NIP</Label>
                    <Input
                      id="nip"
                      placeholder="1234567890"
                      value={newContractor.nip}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, nip: e.target.value }))}
                      data-testid="input-contractor-nip"
                    />
                  </div>
                  <div>
                    <Label htmlFor="regon">REGON</Label>
                    <Input
                      id="regon"
                      placeholder="123456789"
                      value={newContractor.regon}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, regon: e.target.value }))}
                      data-testid="input-contractor-regon"
                    />
                  </div>
                  <div>
                    <Label htmlFor="krs">KRS</Label>
                    <Input
                      id="krs"
                      placeholder="0000123456"
                      value={newContractor.krs}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, krs: e.target.value }))}
                      data-testid="input-contractor-krs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Numer konta</Label>
                    <Input
                      id="accountNumber"
                      placeholder="12 3456 7890 1234 5678 9012 3456"
                      value={newContractor.accountNumber}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, accountNumber: e.target.value }))}
                      data-testid="input-contractor-account-number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Województwo</Label>
                    <Input
                      id="province"
                      placeholder="Mazowieckie"
                      value={newContractor.province}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, province: e.target.value }))}
                      data-testid="input-contractor-province"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adres siedziby</Label>
                    <Input
                      id="address"
                      placeholder="ul. Przykładowa 123"
                      value={newContractor.address}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, address: e.target.value }))}
                      data-testid="input-contractor-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Miasto</Label>
                    <Input
                      id="city"
                      placeholder="Warszawa"
                      value={newContractor.city}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, city: e.target.value }))}
                      data-testid="input-contractor-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kod pocztowy</Label>
                    <Input
                      id="postalCode"
                      placeholder="00-001"
                      value={newContractor.postalCode}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, postalCode: e.target.value }))}
                      data-testid="input-contractor-postal-code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Kraj</Label>
                    <Input
                      id="country"
                      placeholder="Polska"
                      value={newContractor.country}
                      onChange={(e) => setNewContractor(prev => ({ ...prev, country: e.target.value }))}
                      data-testid="input-contractor-country"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    data-testid="button-cancel-contractor"
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    disabled={createContractorMutation.isPending}
                    data-testid="button-save-contractor"
                  >
                    {createContractorMutation.isPending ? "Zapisywanie..." : "Zapisz kontrahenta"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-900 dark:text-white">Nazwa</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Email</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Telefon</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractors?.map((contractor) => (
                  <TableRow key={contractor.id} data-testid={`contractor-row-${contractor.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{contractor.name}</div>
                        {contractor.nip && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">NIP: {contractor.nip}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900 dark:text-white">{contractor.email}</TableCell>
                    <TableCell className="text-sm text-gray-900 dark:text-white">{contractor.phone}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={contractor.status === "active" ? "default" : "secondary"}
                        className={contractor.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {contractor.status === "active" ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewDetails(contractor)}
                          data-testid={`button-view-${contractor.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-edit-${contractor.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(contractor.id)}
                          className="text-red-600 hover:text-red-900"
                          data-testid={`button-delete-${contractor.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Szczegóły kontrahenta */}
      <Dialog open={!!selectedContractor} onOpenChange={() => setSelectedContractor(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Szczegóły kontrahenta</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedContractor(null)}
                data-testid="button-close-contractor-details"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedContractor && (
            <div className="space-y-6">
              {/* Informacje podstawowe */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informacje podstawowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Nazwa firmy</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.name}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Status</Label>
                      <div className="mt-1">
                        <Badge 
                          variant={selectedContractor.status === "active" ? "default" : "secondary"}
                          className={selectedContractor.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {selectedContractor.status === "active" ? "Aktywny" : "Nieaktywny"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Data utworzenia</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedContractor.createdAt ? new Date(selectedContractor.createdAt).toLocaleDateString('pl-PL') : 'Brak danych'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dane kontaktowe */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dane kontaktowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Email</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.email}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Telefon</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dane firmy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dane firmy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="font-semibold">NIP</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.nip || 'Brak danych'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">REGON</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.regon || 'Brak danych'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">KRS</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.krs || 'Brak danych'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dane bankowe */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dane bankowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="font-semibold">Numer konta</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedContractor.accountNumber || 'Brak danych'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Adres */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adres siedziby</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Adres</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.address || 'Brak danych'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Miasto</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.city || 'Brak danych'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Kod pocztowy</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.postalCode || 'Brak danych'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Województwo</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.province || 'Brak danych'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Kraj</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedContractor.country || 'Brak danych'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
