import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Edit, Trash2, Send, Calendar, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Offer, Contractor } from "@shared/schema";

export default function Offers() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [newOffer, setNewOffer] = useState({
    contractorName: "",
    title: "",
    description: "",
    amount: "",
    vatRate: "23",
    discountPercent: "0",
    currency: "PLN",
    validUntil: "",
    paymentTerms: "14 dni",
    category: "Standardowa",
    notes: "",
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
      const amount = parseInt(data.amount);
      const vatRate = parseInt(data.vatRate);
      const discountPercent = parseInt(data.discountPercent);
      
      // Calculate final amount: (amount - discount) + VAT
      const discountedAmount = amount - (amount * discountPercent / 100);
      const finalAmount = Math.round(discountedAmount + (discountedAmount * vatRate / 100));
      
      await apiRequest("POST", "/api/offers", {
        ...data,
        amount,
        vatRate,
        discountPercent,
        finalAmount,
        validUntil: data.validUntil || null,
        description: data.description || null,
        notes: data.notes || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setShowAddForm(false);
      setNewOffer({
        contractorName: "",
        title: "",
        description: "",
        amount: "",
        vatRate: "23",
        discountPercent: "0",
        currency: "PLN",
        validUntil: "",
        paymentTerms: "14 dni",
        category: "Standardowa",
        notes: "",
        status: "draft"
      });
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
      const updateData: any = { status };
      if (status === "sent") {
        updateData.sentAt = new Date().toISOString();
      }
      await apiRequest("PUT", `/api/offers/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Sukces",
        description: "Status oferty został zaktualizowany",
      });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Sukces",
        description: "Oferta została usunięta",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się usunąć oferty",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.contractorName || !newOffer.title || !newOffer.amount) {
      toast({
        title: "Błąd",
        description: "Kontrahent, tytuł i kwota są wymagane",
        variant: "destructive",
      });
      return;
    }
    createOfferMutation.mutate(newOffer);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateOfferMutation.mutate({ id, status });
  };

  const handleViewDetails = (offer: Offer) => {
    setSelectedOffer(offer);
  };

  const handleDelete = (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć tę ofertę?")) {
      deleteOfferMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "expired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Wysłana";
      case "accepted":
        return "Zaakceptowana";
      case "rejected":
        return "Odrzucona";
      case "expired":
        return "Wygasła";
      default:
        return "Szkic";
    }
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Planowanie ofert</h2>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center"
            data-testid="button-add-offer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj ofertę
          </Button>
        </div>
        
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nowa oferta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Podstawowe informacje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contractor">Kontrahent *</Label>
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
                    <Label htmlFor="title">Tytuł oferty *</Label>
                    <Input
                      id="title"
                      placeholder="Tytuł oferty"
                      value={newOffer.title}
                      onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                      required
                      data-testid="input-offer-title"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Opis oferty</Label>
                  <Textarea
                    id="description"
                    placeholder="Szczegółowy opis oferty..."
                    value={newOffer.description}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                    className="h-24"
                    data-testid="textarea-offer-description"
                  />
                </div>

                {/* Kwoty i kalkulacje */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="amount">Kwota netto *</Label>
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
                  
                  <div>
                    <Label htmlFor="vatRate">VAT (%)</Label>
                    <Select 
                      value={newOffer.vatRate}
                      onValueChange={(value) => setNewOffer(prev => ({ ...prev, vatRate: value }))}
                    >
                      <SelectTrigger data-testid="select-offer-vat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="8">8%</SelectItem>
                        <SelectItem value="23">23%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="discountPercent">Rabat (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={newOffer.discountPercent}
                      onChange={(e) => setNewOffer(prev => ({ ...prev, discountPercent: e.target.value }))}
                      data-testid="input-offer-discount"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Waluta</Label>
                    <Select 
                      value={newOffer.currency}
                      onValueChange={(value) => setNewOffer(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger data-testid="select-offer-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLN">PLN</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dodatkowe szczegóły */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="validUntil">Ważna do</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={newOffer.validUntil}
                      onChange={(e) => setNewOffer(prev => ({ ...prev, validUntil: e.target.value }))}
                      data-testid="input-offer-valid-until"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="paymentTerms">Termin płatności</Label>
                    <Select 
                      value={newOffer.paymentTerms}
                      onValueChange={(value) => setNewOffer(prev => ({ ...prev, paymentTerms: value }))}
                    >
                      <SelectTrigger data-testid="select-offer-payment-terms">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Natychmiast">Natychmiast</SelectItem>
                        <SelectItem value="7 dni">7 dni</SelectItem>
                        <SelectItem value="14 dni">14 dni</SelectItem>
                        <SelectItem value="30 dni">30 dni</SelectItem>
                        <SelectItem value="60 dni">60 dni</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Kategoria</Label>
                    <Select 
                      value={newOffer.category}
                      onValueChange={(value) => setNewOffer(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger data-testid="select-offer-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standardowa">Standardowa</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Promocyjna">Promocyjna</SelectItem>
                        <SelectItem value="Konsultacja">Konsultacja</SelectItem>
                        <SelectItem value="Usługa">Usługa</SelectItem>
                        <SelectItem value="Produkt">Produkt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Dodatkowe uwagi</Label>
                  <Textarea
                    id="notes"
                    placeholder="Dodatkowe informacje, warunki specjalne..."
                    value={newOffer.notes}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, notes: e.target.value }))}
                    className="h-20"
                    data-testid="textarea-offer-notes"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    data-testid="button-cancel-offer"
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    disabled={createOfferMutation.isPending}
                    data-testid="button-create-offer"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    {createOfferMutation.isPending ? "Tworzenie..." : "Utwórz ofertę"}
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
                  <TableHead>Tytuł/Kontrahent</TableHead>
                  <TableHead>Kwota netto</TableHead>
                  <TableHead>Kwota brutto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ważna do</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers?.map((offer) => (
                  <TableRow key={offer.id} data-testid={`offer-row-${offer.id}`}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{offer.title || 'Bez tytułu'}</div>
                        <div className="text-sm text-gray-600">{offer.contractorName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{offer.amount?.toLocaleString()} {offer.currency || 'PLN'}</TableCell>
                    <TableCell className="font-semibold">
                      {offer.finalAmount?.toLocaleString()} {offer.currency || 'PLN'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={offer.status === "sent" ? "default" : "secondary"}
                        className={getStatusColor(offer.status)}
                      >
                        {getStatusText(offer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString('pl-PL') : 'Bez ograniczeń'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(offer)}
                          data-testid={`button-view-offer-${offer.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {offer.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(offer.id, "sent")}
                            disabled={updateOfferMutation.isPending}
                            data-testid={`button-send-offer-${offer.id}`}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(offer.id)}
                          disabled={deleteOfferMutation.isPending}
                          data-testid={`button-delete-offer-${offer.id}`}
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

        {/* Dialog szczegółów oferty */}
        <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Szczegóły oferty</DialogTitle>
            </DialogHeader>
            {selectedOffer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Kontrahent</h4>
                    <p>{selectedOffer.contractorName}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Status</h4>
                    <Badge className={getStatusColor(selectedOffer.status)}>
                      {getStatusText(selectedOffer.status)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700">Tytuł</h4>
                  <p>{selectedOffer.title || 'Bez tytułu'}</p>
                </div>

                {selectedOffer.description && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Opis</h4>
                    <p className="text-gray-600">{selectedOffer.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Kwota netto</h4>
                    <p>{selectedOffer.amount?.toLocaleString()} {selectedOffer.currency || 'PLN'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">VAT</h4>
                    <p>{selectedOffer.vatRate || 23}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Rabat</h4>
                    <p>{selectedOffer.discountPercent || 0}%</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Kwota brutto</h4>
                    <p className="font-semibold text-lg">{selectedOffer.finalAmount?.toLocaleString()} {selectedOffer.currency || 'PLN'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Ważna do</h4>
                    <p>{selectedOffer.validUntil ? new Date(selectedOffer.validUntil).toLocaleDateString('pl-PL') : 'Bez ograniczeń'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Termin płatności</h4>
                    <p>{selectedOffer.paymentTerms || '14 dni'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Kategoria</h4>
                    <p>{selectedOffer.category || 'Standardowa'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Data utworzenia</h4>
                    <p>{selectedOffer.createdAt ? new Date(selectedOffer.createdAt).toLocaleDateString('pl-PL') : '-'}</p>
                  </div>
                </div>

                {selectedOffer.sentAt && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Data wysłania</h4>
                    <p>{new Date(selectedOffer.sentAt).toLocaleDateString('pl-PL')}</p>
                  </div>
                )}

                {selectedOffer.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Dodatkowe uwagi</h4>
                    <p className="text-gray-600">{selectedOffer.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {selectedOffer.status === "draft" && (
                    <Button
                      onClick={() => {
                        handleStatusChange(selectedOffer.id, "sent");
                        setSelectedOffer(null);
                      }}
                      disabled={updateOfferMutation.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Wyślij ofertę
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOffer(null)}
                  >
                    Zamknij
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
