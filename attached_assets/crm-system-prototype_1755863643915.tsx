import React, { useState, useEffect } from 'react';
import { Calendar, Users, Mail, Shield, FileText, BarChart, Bell, Settings, LogOut, Plus, Edit, Trash2, Check, X, Eye, Clock, AlertCircle, CheckCircle, Send, Archive } from 'lucide-react';

const CRMSystem = () => {
  // Stan główny aplikacji
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('login');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  // Dane systemowe
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@crm.pl' },
    { id: 2, username: 'user', password: 'user123', role: 'user', email: 'user@crm.pl' }
  ]);
  
  const [contractors, setContractors] = useState([
    { id: 1, name: 'Firma ABC', email: 'kontakt@abc.pl', phone: '123456789', status: 'active' },
    { id: 2, name: 'XYZ Sp. z o.o.', email: 'biuro@xyz.pl', phone: '987654321', status: 'active' }
  ]);
  
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Spotkanie z klientem', date: '2024-12-20', time: '10:00', status: 'pending' },
    { id: 2, title: 'Przygotowanie oferty', date: '2024-12-21', time: '14:00', status: 'pending' }
  ]);
  
  const [offers, setOffers] = useState([
    { id: 1, contractor: 'Firma ABC', amount: 15000, status: 'draft', created: '2024-12-15' },
    { id: 2, contractor: 'XYZ Sp. z o.o.', amount: 25000, status: 'sent', created: '2024-12-10' }
  ]);
  
  const [emails, setEmails] = useState([
    { id: 1, to: 'kontakt@abc.pl', subject: 'Oferta współpracy', status: 'sent', date: '2024-12-15' },
    { id: 2, to: 'biuro@xyz.pl', subject: 'Potwierdzenie spotkania', status: 'draft', date: '2024-12-16' }
  ]);
  
  const [supportTickets, setSupportTickets] = useState([
    { id: 1, user: 'Jan Kowalski', issue: 'Problem z logowaniem', status: 'open', priority: 'high' },
    { id: 2, user: 'Anna Nowak', issue: 'Pytanie o fakturę', status: 'resolved', priority: 'low' }
  ]);
  
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nowa wiadomość od kontrahenta', time: '5 min temu', read: false },
    { id: 2, message: 'Zbliżające się spotkanie', time: '1 godz. temu', read: false }
  ]);

  // Komponenty autoryzacji i autentykacji
  const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaCode] = useState(Math.floor(1000 + Math.random() * 9000).toString());
    
    const handleLogin = () => {
      if (captchaInput !== captchaCode) {
        alert('Nieprawidłowy kod CAPTCHA');
        return;
      }
      
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        setCurrentUser(user);
        setCaptchaVerified(true);
        setActiveView('dashboard');
      } else {
        alert('Nieprawidłowe dane logowania');
      }
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">System CRM - Logowanie</h2>
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            className="w-full p-2 mb-4 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Hasło"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {/* CAPTCHA */}
          <div className="mb-4 p-3 bg-gray-200 rounded text-center">
            <div className="text-2xl font-mono mb-2">{captchaCode}</div>
            <input
              type="text"
              placeholder="Wpisz kod CAPTCHA"
              className="w-full p-2 border rounded"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
            />
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Zaloguj się
          </button>
          <div className="mt-4 text-sm text-gray-600">
            <p>Demo: admin/admin123 lub user/user123</p>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard główny
  const Dashboard = () => {
    const stats = {
      contractors: contractors.length,
      activeTasks: tasks.filter(t => t.status === 'pending').length,
      openTickets: supportTickets.filter(t => t.status === 'open').length,
      sentOffers: offers.filter(o => o.status === 'sent').length
    };
    
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Panel główny</h2>
        
        {/* Statystyki */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded">
            <div className="text-blue-600 text-2xl font-bold">{stats.contractors}</div>
            <div className="text-gray-600">Kontrahenci</div>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <div className="text-green-600 text-2xl font-bold">{stats.activeTasks}</div>
            <div className="text-gray-600">Aktywne zadania</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded">
            <div className="text-yellow-600 text-2xl font-bold">{stats.openTickets}</div>
            <div className="text-gray-600">Otwarte zgłoszenia</div>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <div className="text-purple-600 text-2xl font-bold">{stats.sentOffers}</div>
            <div className="text-gray-600">Wysłane oferty</div>
          </div>
        </div>
        
        {/* Powiadomienia */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-3">Ostatnie powiadomienia</h3>
          {notifications.map(n => (
            <div key={n.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                <span>{n.message}</span>
              </div>
              <span className="text-sm text-gray-500">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Moduł kontrahentów
  const ContractorsModule = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContractor, setNewContractor] = useState({ name: '', email: '', phone: '' });
    
    const addContractor = () => {
      setContractors([...contractors, {
        id: contractors.length + 1,
        ...newContractor,
        status: 'active'
      }]);
      setShowAddForm(false);
      setNewContractor({ name: '', email: '', phone: '' });
    };
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Kontrahenci</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj kontrahenta
          </button>
        </div>
        
        {showAddForm && (
          <div className="bg-white p-4 rounded shadow mb-4">
            <input
              placeholder="Nazwa firmy"
              className="w-full p-2 mb-2 border rounded"
              value={newContractor.name}
              onChange={(e) => setNewContractor({...newContractor, name: e.target.value})}
            />
            <input
              placeholder="Email"
              className="w-full p-2 mb-2 border rounded"
              value={newContractor.email}
              onChange={(e) => setNewContractor({...newContractor, email: e.target.value})}
            />
            <input
              placeholder="Telefon"
              className="w-full p-2 mb-2 border rounded"
              value={newContractor.phone}
              onChange={(e) => setNewContractor({...newContractor, phone: e.target.value})}
            />
            <button
              onClick={addContractor}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Zapisz
            </button>
          </div>
        )}
        
        <div className="bg-white rounded shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Nazwa</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Telefon</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {contractors.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="text-blue-500 hover:text-blue-700 mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Planer zadań
  const PlannerModule = () => {
    const [newTask, setNewTask] = useState({ title: '', date: '', time: '' });
    
    const addTask = () => {
      setTasks([...tasks, {
        id: tasks.length + 1,
        ...newTask,
        status: 'pending'
      }]);
      setNewTask({ title: '', date: '', time: '' });
    };
    
    const completeTask = (id) => {
      setTasks(tasks.map(t => 
        t.id === id ? {...t, status: 'completed'} : t
      ));
    };
    
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Planer zadań</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Dodaj zadanie</h3>
            <div className="bg-white p-4 rounded shadow">
              <input
                placeholder="Tytuł zadania"
                className="w-full p-2 mb-2 border rounded"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
              <input
                type="date"
                className="w-full p-2 mb-2 border rounded"
                value={newTask.date}
                onChange={(e) => setNewTask({...newTask, date: e.target.value})}
              />
              <input
                type="time"
                className="w-full p-2 mb-2 border rounded"
                value={newTask.time}
                onChange={(e) => setNewTask({...newTask, time: e.target.value})}
              />
              <button
                onClick={addTask}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Dodaj zadanie
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-3">Lista zadań</h3>
            <div className="bg-white rounded shadow">
              {tasks.map(t => (
                <div key={t.id} className="p-3 border-b hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-sm text-gray-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {t.date} {t.time}
                      </div>
                    </div>
                    <button
                      onClick={() => completeTask(t.id)}
                      className={`px-3 py-1 rounded text-sm ${
                        t.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {t.status === 'completed' ? 'Ukończone' : 'W trakcie'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Moduł ofert
  const OffersModule = () => {
    const [newOffer, setNewOffer] = useState({ contractor: '', amount: '' });
    
    const createOffer = () => {
      setOffers([...offers, {
        id: offers.length + 1,
        ...newOffer,
        status: 'draft',
        created: new Date().toISOString().split('T')[0]
      }]);
      setNewOffer({ contractor: '', amount: '' });
    };
    
    const sendOffer = (id) => {
      setOffers(offers.map(o => 
        o.id === id ? {...o, status: 'sent'} : o
      ));
    };
    
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Planowanie ofert</h2>
        
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-3">Nowa oferta</h3>
          <div className="grid grid-cols-3 gap-2">
            <select
              className="p-2 border rounded"
              value={newOffer.contractor}
              onChange={(e) => setNewOffer({...newOffer, contractor: e.target.value})}
            >
              <option value="">Wybierz kontrahenta</option>
              {contractors.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Kwota (PLN)"
              className="p-2 border rounded"
              value={newOffer.amount}
              onChange={(e) => setNewOffer({...newOffer, amount: e.target.value})}
            />
            <button
              onClick={createOffer}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Utwórz ofertę
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Kontrahent</th>
                <th className="p-3 text-left">Kwota</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Data utworzenia</th>
                <th className="p-3 text-left">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{o.contractor}</td>
                  <td className="p-3">{o.amount} PLN</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      o.status === 'sent' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {o.status === 'sent' ? 'Wysłana' : 'Szkic'}
                    </span>
                  </td>
                  <td className="p-3">{o.created}</td>
                  <td className="p-3">
                    {o.status === 'draft' && (
                      <button
                        onClick={() => sendOffer(o.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Wyślij
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Moduł email
  const EmailModule = () => {
    const [newEmail, setNewEmail] = useState({ to: '', subject: '', content: '' });
    
    const sendEmail = () => {
      setEmails([...emails, {
        id: emails.length + 1,
        to: newEmail.to,
        subject: newEmail.subject,
        status: 'sent',
        date: new Date().toISOString().split('T')[0]
      }]);
      alert('Email wysłany!');
      setNewEmail({ to: '', subject: '', content: '' });
    };
    
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Serwis e-mail</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Nowa wiadomość</h3>
            <div className="bg-white p-4 rounded shadow">
              <input
                placeholder="Do (email)"
                className="w-full p-2 mb-2 border rounded"
                value={newEmail.to}
                onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
              />
              <input
                placeholder="Temat"
                className="w-full p-2 mb-2 border rounded"
                value={newEmail.subject}
                onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
              />
              <textarea
                placeholder="Treść wiadomości"
                className="w-full p-2 mb-2 border rounded h-32"
                value={newEmail.content}
                onChange={(e) => setNewEmail({...newEmail, content: e.target.value})}
              />
              <button
                onClick={sendEmail}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Wyślij
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-3">Historia wiadomości</h3>
            <div className="bg-white rounded shadow">
              {emails.map(e => (
                <div key={e.id} className="p-3 border-b hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{e.subject}</div>
                      <div className="text-sm text-gray-600">Do: {e.to}</div>
                    </div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded ${
                        e.status === 'sent' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {e.status === 'sent' ? 'Wysłano' : 'Szkic'}
                      </span>
                      <div className="text-gray-500 mt-1">{e.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Moduł wsparcia
  const SupportModule = () => {
    const resolveTicket = (id) => {
      setSupportTickets(supportTickets.map(t => 
        t.id === id ? {...t, status: 'resolved'} : t
      ));
    };
    
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Wsparcie użytkowników</h2>
        
        <div className="bg-white rounded shadow">
          <div className="grid grid-cols-1 gap-4 p-4">
            {supportTickets.map(t => (
              <div key={t.id} className="border rounded p-4 hover:shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{t.user}</div>
                    <div className="text-gray-600 mt-1">{t.issue}</div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-sm ${
                      t.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      Priorytet: {t.priority === 'high' ? 'Wysoki' : 'Niski'}
                    </span>
                  </div>
                  <div>
                    {t.status === 'open' ? (
                      <button
                        onClick={() => resolveTicket(t.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Rozwiąż
                      </button>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">
                        Rozwiązane
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Moduł raportów
  const ReportsModule = () => {
    const generateReport = (type) => {
      alert(`Generowanie raportu: ${type}`);
    };
    
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Raporty</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
               onClick={() => generateReport('Miesięczny')}>
            <BarChart className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-bold">Raport miesięczny</h3>
            <p className="text-sm text-gray-600 mt-1">Podsumowanie działań z ostatniego miesiąca</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
               onClick={() => generateReport('Kontrahenci')}>
            <Users className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-bold">Raport kontrahentów</h3>
            <p className="text-sm text-gray-600 mt-1">Analiza współpracy z kontrahentami</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
               onClick={() => generateReport('Finansowy')}>
            <FileText className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-bold">Raport finansowy</h3>
            <p className="text-sm text-gray-600 mt-1">Zestawienie ofert i transakcji</p>
          </div>
        </div>
        
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-3">Ostatnie raporty</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Typ</th>
                <th className="p-2 text-left">Data</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">Miesięczny</td>
                <td className="p-2">2024-11-30</td>
                <td className="p-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    Gotowy
                  </span>
                </td>
                <td className="p-2">
                  <button className="text-blue-500 hover:text-blue-700">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Kontrahenci</td>
                <td className="p-2">2024-11-15</td>
                <td className="p-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    Gotowy
                  </span>
                </td>
                <td className="p-2">
                  <button className="text-blue-500 hover:text-blue-700">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Moduł monitoringu
  const MonitoringModule = () => {
    const [systemStatus] = useState({
      server: 'online',
      database: 'online',
      email: 'online',
      api: 'warning'
    });
    
    const [activities] = useState([
      { time: '12:45', user: 'admin', action: 'Zalogowanie do systemu' },
      { time: '12:30', user: 'user', action: 'Utworzenie nowej oferty' },
      { time: '11:15', user: 'admin', action: 'Dodanie kontrahenta' },
      { time: '10:00', user: 'user', action: 'Wysłanie emaila' }
    ]);
    
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Monitoring systemu</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Status systemu</h3>
            <div className="bg-white rounded shadow p-4">
              {Object.entries(systemStatus).map(([service, status]) => (
                <div key={service} className="flex justify-between items-center p-2 border-b">
                  <span className="capitalize">{service}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    status === 'online' ? 'bg-green-100 text-green-800' :
                    status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status === 'online' ? 'Aktywny' : 
                     status === 'warning' ? 'Ostrzeżenie' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-3">Ostatnia aktywność</h3>
            <div className="bg-white rounded shadow p-4">
              {activities.map((a, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border-b">
                  <div>
                    <span className="font-semibold">{a.user}</span>
                    <span className="text-gray-600 ml-2">{a.action}</span>
                  </div>
                  <span className="text-sm text-gray-500">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded shadow p-4">
          <h3 className="font-bold mb-3">Metryki wydajności</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-gray-600">Dostępność</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">142ms</div>
              <div className="text-sm text-gray-600">Czas odpowiedzi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.3GB</div>
              <div className="text-sm text-gray-600">Użycie pamięci</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">45%</div>
              <div className="text-sm text-gray-600">Użycie CPU</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Główny interfejs aplikacji
  const MainApp = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart },
      { id: 'contractors', label: 'Kontrahenci', icon: Users },
      { id: 'planner', label: 'Planer', icon: Calendar },
      { id: 'offers', label: 'Oferty', icon: FileText },
      { id: 'email', label: 'Email', icon: Mail },
      { id: 'support', label: 'Wsparcie', icon: Shield },
      { id: 'reports', label: 'Raporty', icon: BarChart },
      { id: 'monitoring', label: 'Monitoring', icon: Settings }
    ];
    
    const renderContent = () => {
      switch(activeView) {
        case 'dashboard': return <Dashboard />;
        case 'contractors': return <ContractorsModule />;
        case 'planner': return <PlannerModule />;
        case 'offers': return <OffersModule />;
        case 'email': return <EmailModule />;
        case 'support': return <SupportModule />;
        case 'reports': return <ReportsModule />;
        case 'monitoring': return <MonitoringModule />;
        default: return <Dashboard />;
      }
    };
    
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white">
          <div className="p-4">
            <h1 className="text-xl font-bold">System CRM</h1>
            <div className="text-sm text-gray-400 mt-1">
              Zalogowany: {currentUser?.username}
            </div>
          </div>
          
          <nav className="mt-8">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${
                    activeView === item.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <button
            onClick={() => {
              setCurrentUser(null);
              setActiveView('login');
            }}
            className="absolute bottom-4 left-4 right-4 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Wyloguj
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Top bar */}
          <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                {currentUser?.username[0].toUpperCase()}
              </div>
            </div>
          </div>
          
          {/* Content */}
          {renderContent()}
        </div>
      </div>
    );
  };

  // Główny render
  return currentUser ? <MainApp /> : <LoginForm />;
};

export default CRMSystem;