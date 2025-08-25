import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Edit, Trash2, X, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { notificationHelpers } from "@/lib/notifications";
import type { Contractor } from "@shared/schema";

export default function Contractors() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: [] as string[],
    province: [] as string[],
    country: [] as string[]
  });
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

  const filteredContractors = contractors?.filter(contractor => {
    const matchesSearch = !searchTerm || 
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.phone?.includes(searchTerm) ||
      contractor.nip?.includes(searchTerm) ||
      contractor.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status.length === 0 || 
      filters.status.includes(contractor.status);

    const matchesProvince = filters.province.length === 0 || 
      (contractor.province && filters.province.includes(contractor.province));

    const matchesCountry = filters.country.length === 0 || 
      (contractor.country && filters.country.includes(contractor.country));

    return matchesSearch && matchesStatus && matchesProvince && matchesCountry;
  }) || [];

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

  const updateContractorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contractor> }) => {
      await apiRequest("PUT", `/api/contractors/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contractors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setEditingContractor(null);
      toast({
        title: "Sukces",
        description: "Kontrahent został zaktualizowany",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się zaktualizować kontrahenta",
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

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContractor) return;
    updateContractorMutation.mutate({ id: editingContractor.id, data: editingContractor });
  };

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const toggleProvinceFilter = (province: string) => {
    setFilters(prev => ({
      ...prev,
      province: prev.province.includes(province)
        ? prev.province.filter(p => p !== province)
        : [...prev.province, province]
    }));
  };

  const toggleCountryFilter = (country: string) => {
    setFilters(prev => ({
      ...prev,
      country: prev.country.includes(country)
        ? prev.country.filter(c => c !== country)
        : [...prev.country, country]
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      province: [],
      country: []
    });
    setSearchTerm("");
  };

  const uniqueStatuses = Array.from(new Set(contractors?.map(c => c.status) || []));
  const uniqueProvinces = Array.from(new Set(contractors?.map(c => c.province).filter(Boolean) || []));
  const uniqueCountries = Array.from(new Set(contractors?.map(c => c.country).filter(Boolean) || []));

  const activeFiltersCount = filters.status.length + filters.province.length + filters.country.length + (searchTerm ? 1 : 0);

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
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj kontrahentów po nazwie, email, telefonie, NIP lub adresie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-contractors-input"
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[120px]">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtry
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-4 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {uniqueStatuses.map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => toggleStatusFilter(status)}
                  >
                    {status === 'active' ? 'Aktywny' : status === 'inactive' ? 'Nieaktywny' : status}
                  </DropdownMenuCheckboxItem>
                ))}
                
                {uniqueProvinces.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Województwo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {uniqueProvinces.map(province => (
                      <DropdownMenuCheckboxItem
                        key={province}
                        checked={filters.province.includes(province!)}
                        onCheckedChange={() => toggleProvinceFilter(province!)}
                      >
                        {province}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
                
                {uniqueCountries.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Kraj</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {uniqueCountries.map(country => (
                      <DropdownMenuCheckboxItem
                        key={country}
                        checked={filters.country.includes(country!)}
                        onCheckedChange={() => toggleCountryFilter(country!)}
                      >
                        {country}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
                
                {activeFiltersCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={clearFilters}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Wyczyść filtry
                    </DropdownMenuCheckboxItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          {filteredContractors.length === 0 && contractors && contractors.length > 0 && (
            "Brak wyników dla wybranych kryteriów"
          )}
          {filteredContractors.length > 0 && (
            `Znaleziono ${filteredContractors.length} z ${contractors?.length || 0} kontrahentów`
          )}
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
                {filteredContractors.map((contractor) => (
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
                        className={contractor.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditContractor(contractor)}
                          data-testid={`button-edit-${contractor.id}`}
                        >
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
                          className={selectedContractor.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}
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

      {/* Edit Contractor Dialog */}
      <Dialog open={!!editingContractor} onOpenChange={() => setEditingContractor(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edytuj kontrahenta</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingContractor(null)}
                data-testid="button-close-edit-contractor"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {editingContractor && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nazwa firmy</Label>
                  <Input
                    id="edit-name"
                    placeholder="Wprowadź nazwę firmy"
                    value={editingContractor.name}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                    data-testid="input-edit-contractor-name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="kontakt@firma.pl"
                    value={editingContractor.email || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, email: e.target.value } : null)}
                    data-testid="input-edit-contractor-email"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Telefon</Label>
                  <Input
                    id="edit-phone"
                    placeholder="+48 123 456 789"
                    value={editingContractor.phone || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    data-testid="input-edit-contractor-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-nip">NIP</Label>
                  <Input
                    id="edit-nip"
                    placeholder="1234567890"
                    value={editingContractor.nip || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, nip: e.target.value } : null)}
                    data-testid="input-edit-contractor-nip"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingContractor.status} 
                    onValueChange={(value) => setEditingContractor(prev => prev ? { ...prev, status: value } : null)}
                  >
                    <SelectTrigger data-testid="select-edit-contractor-status">
                      <SelectValue placeholder="Wybierz status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktywny</SelectItem>
                      <SelectItem value="inactive">Nieaktywny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-regon">REGON</Label>
                  <Input
                    id="edit-regon"
                    placeholder="123456789"
                    value={editingContractor.regon || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, regon: e.target.value } : null)}
                    data-testid="input-edit-contractor-regon"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-krs">KRS</Label>
                  <Input
                    id="edit-krs"
                    placeholder="0000123456"
                    value={editingContractor.krs || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, krs: e.target.value } : null)}
                    data-testid="input-edit-contractor-krs"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-accountNumber">Numer konta</Label>
                  <Input
                    id="edit-accountNumber"
                    placeholder="12 3456 7890 1234 5678 9012 3456"
                    value={editingContractor.accountNumber || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, accountNumber: e.target.value } : null)}
                    data-testid="input-edit-contractor-account-number"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-province">Województwo</Label>
                  <Input
                    id="edit-province"
                    placeholder="Mazowieckie"
                    value={editingContractor.province || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, province: e.target.value } : null)}
                    data-testid="input-edit-contractor-province"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address">Adres siedziby</Label>
                  <Input
                    id="edit-address"
                    placeholder="ul. Przykładowa 123"
                    value={editingContractor.address || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, address: e.target.value } : null)}
                    data-testid="input-edit-contractor-address"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-city">Miasto</Label>
                  <Input
                    id="edit-city"
                    placeholder="Warszawa"
                    value={editingContractor.city || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, city: e.target.value } : null)}
                    data-testid="input-edit-contractor-city"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-postalCode">Kod pocztowy</Label>
                  <Input
                    id="edit-postalCode"
                    placeholder="00-001"
                    value={editingContractor.postalCode || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, postalCode: e.target.value } : null)}
                    data-testid="input-edit-contractor-postal-code"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-country">Kraj</Label>
                  <Input
                    id="edit-country"
                    placeholder="Polska"
                    value={editingContractor.country || ''}
                    onChange={(e) => setEditingContractor(prev => prev ? { ...prev, country: e.target.value } : null)}
                    data-testid="input-edit-contractor-country"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingContractor(null)}
                  data-testid="button-cancel-edit-contractor"
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  disabled={updateContractorMutation.isPending}
                  data-testid="button-save-edit-contractor"
                >
                  {updateContractorMutation.isPending ? "Zapisywanie..." : "Zaktualizuj kontrahenta"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
