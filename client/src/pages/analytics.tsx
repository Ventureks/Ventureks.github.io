import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";

interface AnalyticsData {
  overview: {
    totalContractors: number;
    activeTasks: number;
    completedTasks: number;
    openTickets: number;
    resolvedTickets: number;
    totalOffers: number;
    acceptedOffers: number;
    totalEmails: number;
  };
  charts: {
    tasksOverTime: Array<{ month: string; created: number; completed: number }>;
    ticketsByStatus: Array<{ status: string; count: number; color: string }>;
    contractorsByType: Array<{ type: string; count: number }>;
    offersByStatus: Array<{ status: string; count: number; color: string }>;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", { range: dateRange }],
  });

  // Fetch data based on report type for detailed view
  const { data: reportData } = useQuery({
    queryKey: [
      reportType === 'contractors' ? '/api/contractors' : 
      reportType === 'tasks' ? '/api/tasks' : 
      reportType === 'offers' ? '/api/offers' : 
      reportType === 'support' ? '/api/support-tickets' : '/api/contractors'
    ],
    enabled: reportType !== 'overview',
  });

  // Show loading or use empty data structure if no data
  const currentData = analyticsData || {
    overview: {
      totalContractors: 0,
      activeTasks: 0,
      completedTasks: 0,
      openTickets: 0,
      resolvedTickets: 0,
      totalOffers: 0,
      acceptedOffers: 0,
      totalEmails: 0
    },
    charts: {
      tasksOverTime: [],
      ticketsByStatus: [],
      contractorsByType: [],
      offersByStatus: []
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // Implementation for export functionality
    console.log(`Eksportowanie raportu w formacie: ${format}`);
  };

  const handleViewDetails = (item: any, type: string) => {
    setSelectedDetail({ ...item, type });
    setIsDetailModalOpen(true);
  };

  const getDisplayData = () => {
    if (reportType === 'overview') {
      // Mix of sample data for overview
      return [
        {
          id: '1',
          date: '2025-08-25',
          type: 'Kontrahent',
          name: 'Firma ABC Sp. z o.o.',
          status: 'aktywny',
          value: null
        },
        {
          id: '2', 
          date: '2025-08-25',
          type: 'Kontrahent',
          name: 'XYZ Technologies',
          status: 'aktywny',
          value: null
        }
      ];
    }
    
    if (reportData && Array.isArray(reportData)) {
      return reportData.map((item: any) => ({
        ...item,
        date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: reportType === 'contractors' ? 'Kontrahent' : 
              reportType === 'tasks' ? 'Zadanie' : 
              reportType === 'offers' ? 'Oferta' : 'Zgłoszenie',
        name: item.name || item.title || item.subject || item.user || 'Bez nazwy',
        value: item.amount || item.finalAmount || null
      }));
    }
    
    return [];
  };

  return (
    <MainLayout title="Analityka i Raporty">
      <div className="space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analityka i Raporty</h1>
            <p className="text-gray-600 dark:text-gray-400">Przegląd danych i szczegółowe raporty</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40" data-testid="select-date-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Ostatnie 7 dni</SelectItem>
                <SelectItem value="30">Ostatnie 30 dni</SelectItem>
                <SelectItem value="90">Ostatnie 3 miesiące</SelectItem>
                <SelectItem value="365">Ostatni rok</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline" size="icon" data-testid="button-refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Raporty
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kontrahenci</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="metric-contractors">
                    {currentData?.overview?.totalContractors || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2 w tym miesiącu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktywne Zadania</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="metric-active-tasks">
                    {currentData?.overview?.activeTasks || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentData?.overview?.completedTasks || 0} ukończonych
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Otwarte Zgłoszenia</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="metric-open-tickets">
                    {currentData?.overview?.openTickets || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentData?.overview?.resolvedTickets || 0} rozwiązanych
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oferty</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="metric-offers">
                    {currentData?.overview?.totalOffers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentData?.overview?.acceptedOffers || 0} zaakceptowanych
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasks Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Zadania w czasie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={currentData?.charts?.tasksOverTime || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="created" fill="#8884d8" name="Utworzone" />
                      <Bar dataKey="completed" fill="#82ca9d" name="Ukończone" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tickets by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Zgłoszenia według statusu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={currentData?.charts?.ticketsByStatus || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(currentData?.charts?.ticketsByStatus || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Contractors by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Kontrahenci według typu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={currentData?.charts?.contractorsByType || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Offers by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Oferty według statusu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={currentData?.charts?.offersByStatus || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(currentData?.charts?.offersByStatus || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Szczegółowe Raporty</span>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleExport('csv')} variant="outline" size="sm" data-testid="button-export-csv">
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button onClick={() => handleExport('pdf')} variant="outline" size="sm" data-testid="button-export-pdf">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-48" data-testid="select-report-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Przegląd ogólny</SelectItem>
                      <SelectItem value="contractors">Kontrahenci</SelectItem>
                      <SelectItem value="tasks">Zadania</SelectItem>
                      <SelectItem value="offers">Oferty</SelectItem>
                      <SelectItem value="support">Wsparcie</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Szukaj w raporcie..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                      data-testid="input-search-report"
                    />
                  </div>
                </div>

                {/* Dynamic Report Table */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Nazwa</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Wartość</TableHead>
                        <TableHead>Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDisplayData()
                        .filter(item => 
                          searchTerm === '' || 
                          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.type?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item, index) => (
                          <TableRow key={item.id || index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  item.status === 'active' || item.status === 'aktywny' ? 'default' :
                                  item.status === 'completed' || item.status === 'zaakceptowana' ? 'secondary' :
                                  item.status === 'open' || item.status === 'otwarte' ? 'destructive' : 'outline'
                                }
                              >
                                {item.status || 'Aktywny'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.value ? `${item.value.toLocaleString()} PLN` : '-'}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleViewDetails(item, item.type)}
                                    data-testid="button-view-details"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Szczegóły
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Szczegóły: {item.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {selectedDetail && (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <h4 className="font-semibold">Podstawowe informacje</h4>
                                          <div className="text-sm space-y-1">
                                            <p><strong>ID:</strong> {selectedDetail.id}</p>
                                            <p><strong>Typ:</strong> {selectedDetail.type}</p>
                                            <p><strong>Data utworzenia:</strong> {selectedDetail.date}</p>
                                            <p><strong>Status:</strong> 
                                              <Badge className="ml-2" variant={
                                                selectedDetail.status === 'active' || selectedDetail.status === 'aktywny' ? 'default' :
                                                selectedDetail.status === 'completed' ? 'secondary' :
                                                selectedDetail.status === 'open' ? 'destructive' : 'outline'
                                              }>
                                                {selectedDetail.status || 'Aktywny'}
                                              </Badge>
                                            </p>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h4 className="font-semibold">Szczegółowe dane</h4>
                                          <div className="text-sm space-y-1">
                                            {selectedDetail.email && (
                                              <p><strong>Email:</strong> {selectedDetail.email}</p>
                                            )}
                                            {selectedDetail.phone && (
                                              <p><strong>Telefon:</strong> {selectedDetail.phone}</p>
                                            )}
                                            {selectedDetail.nip && (
                                              <p><strong>NIP:</strong> {selectedDetail.nip}</p>
                                            )}
                                            {selectedDetail.address && (
                                              <p><strong>Adres:</strong> {selectedDetail.address}</p>
                                            )}
                                            {selectedDetail.description && (
                                              <p><strong>Opis:</strong> {selectedDetail.description}</p>
                                            )}
                                            {selectedDetail.value && (
                                              <p><strong>Wartość:</strong> {selectedDetail.value.toLocaleString()} PLN</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      {getDisplayData().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Brak danych dla wybranego typu raportu
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Kluczowe trendy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Wzrost liczby kontrahentów</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +15%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Efektywność rozwiązywania zgłoszeń</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        92%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Średni czas odpowiedzi</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        2.3h
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rekomendacje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Zwiększenie automatyzacji
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Rozważ automatyzację rutynowych zadań
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Optymalizacja procesu ofert
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Czas odpowiedzi na oferty można skrócić o 30%
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        Szkolenie zespołu
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        Dodatkowe szkolenia mogą zwiększyć efektywność
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Trend wydajności</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={currentData?.charts?.tasksOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="1" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Ukończone zadania"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="created" 
                      stackId="2" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Utworzone zadania"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}