import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { notificationHelpers } from "@/lib/notifications";
import type { Contractor } from "@shared/schema";

export default function Contractors() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContractor, setNewContractor] = useState({
    name: "",
    email: "",
    phone: "",
    nip: "",
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
      setNewContractor({ name: "", email: "", phone: "", nip: "", status: "active" });
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
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractors?.map((contractor) => (
                  <TableRow key={contractor.id} data-testid={`contractor-row-${contractor.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{contractor.name}</div>
                        {contractor.nip && (
                          <div className="text-sm text-gray-500">NIP: {contractor.nip}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">{contractor.email}</TableCell>
                    <TableCell className="text-sm text-gray-900">{contractor.phone}</TableCell>
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
                        <Button variant="ghost" size="icon" data-testid={`button-view-${contractor.id}`}>
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
    </MainLayout>
  );
}
