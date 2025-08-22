import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Offer, Contractor } from "@shared/schema";

export default function Offers() {
  const [newOffer, setNewOffer] = useState({
    contractorName: "",
    amount: "",
    status: "draft"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offers, isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  const { data: contractors } = useQuery<Contractor[]>({
    queryKey: ["/api/contractors"],
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: typeof newOffer) => {
      await apiRequest("POST", "/api/offers", {
        ...data,
        amount: parseInt(data.amount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setNewOffer({ contractorName: "", amount: "", status: "draft" });
      toast({
        title: "Sukces",
        description: "Oferta została utworzona",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się utworzyć oferty",
        variant: "destructive",
      });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/offers/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Sukces",
        description: "Oferta została wysłana",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.contractorName || !newOffer.amount) {
      toast({
        title: "Błąd",
        description: "Wszystkie pola są wymagane",
        variant: "destructive",
      });
      return;
    }
    createOfferMutation.mutate(newOffer);
  };

  const sendOffer = (id: string) => {
    updateOfferMutation.mutate({ id, status: "sent" });
  };

  if (offersLoading) {
    return (
      <MainLayout title="Oferty">
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Oferty">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Planowanie ofert</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Nowa oferta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contractor">Kontrahent</Label>
                  <Select 
                    value={newOffer.contractorName}
                    onValueChange={(value) => setNewOffer(prev => ({ ...prev, contractorName: value }))}
                  >
                    <SelectTrigger data-testid="select-offer-contractor">
                      <SelectValue placeholder="Wybierz kontrahenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractors?.map((contractor) => (
                        <SelectItem key={contractor.id} value={contractor.name}>
                          {contractor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Kwota (PLN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Kwota"
                    value={newOffer.amount}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    data-testid="input-offer-amount"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={createOfferMutation.isPending}
                    className="w-full"
                    data-testid="button-create-offer"
                  >
                    {createOfferMutation.isPending ? "Tworzenie..." : "Utwórz ofertę"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kontrahent</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers?.map((offer) => (
                  <TableRow key={offer.id} data-testid={`offer-row-${offer.id}`}>
                    <TableCell className="font-medium">{offer.contractorName}</TableCell>
                    <TableCell>{offer.amount.toLocaleString()} PLN</TableCell>
                    <TableCell>
                      <Badge 
                        variant={offer.status === "sent" ? "default" : "secondary"}
                        className={offer.status === "sent" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {offer.status === "sent" ? "Wysłana" : "Szkic"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('pl-PL') : '-'}
                    </TableCell>
                    <TableCell>
                      {offer.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => sendOffer(offer.id)}
                          disabled={updateOfferMutation.isPending}
                          data-testid={`button-send-offer-${offer.id}`}
                        >
                          Wyślij
                        </Button>
                      )}
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
