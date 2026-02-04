
import React, { useState, useCallback } from 'react';
import { 
  Users, 
  Settings, 
  LayoutDashboard, 
  HeartPulse,
  UserRound,
  Search,
  ClipboardList,
  LogOut,
  Wallet,
  FileText
} from 'lucide-react';
import { View, Staff, Client, AppNotification, Transaction, Timesheet, ServicePackage, Task, DailyReport } from './types';
import { MOCK_STAFF, MOCK_CLIENTS, MOCK_TRANSACTIONS, MOCK_TIMESHEETS, SERVICE_PACKAGES, MOCK_TASKS } from './constants';
import DashboardView from './components/DashboardView';
import StaffView from './components/StaffView';
import ClientView from './components/ClientView';
import ServiceView from './components/ServiceView';
import AssignmentView from './components/AssignmentView';
import AccountingView from './components/AccountingView';
import ClientReportingView from './components/ClientReportingView';
import StaffPortal from './components/StaffPortal';
import ClientPortal from './components/ClientPortal';
import AuthPortal from './components/AuthPortal';
import NotificationCenter from './components/NotificationCenter';

type AppRole = 'admin' | 'staff' | 'client' | null;

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<AppRole>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [timesheets, setTimesheets] = useState<Timesheet[]>(MOCK_TIMESHEETS);
  const [services, setServices] = useState<ServicePackage[]>(SERVICE_PACKAGES);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [reports, setReports] = useState<DailyReport[]>([]);

  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const loggedInStaff = staff.find(s => s.id === activeUserId) || staff[0]; 
  const loggedInClient = clients.find(c => c.id === activeUserId) || clients[0];

  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleLogin = (role: AppRole, id: string) => {
    setUserRole(role);
    setActiveUserId(id);
    addNotification('Login Successful', `Welcome back to CareBridge Hub as ${role}.`, 'success');
  };

  const NavItem: React.FC<{ view: View; icon: React.ReactNode; label: string }> = ({ view, icon, label }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  if (!userRole) {
    return (
      <>
        <AuthPortal 
          onLogin={handleLogin} 
          staff={staff} 
          setStaff={setStaff} 
          clients={clients} 
          setClients={setClients}
        />
        <NotificationCenter notifications={notifications} removeNotification={removeNotification} />
      </>
    );
  }

  if (userRole === 'staff') {
    return (
      <>
        <StaffPortal 
          staffMember={loggedInStaff} 
          onLogout={() => setUserRole(null)} 
          clients={clients} 
          timesheets={timesheets}
          tasks={tasks}
          setTasks={setTasks}
          reports={reports}
          setReports={setReports}
        />
        <NotificationCenter notifications={notifications} removeNotification={removeNotification} />
      </>
    );
  }

  if (userRole === 'client') {
    return (
      <>
        <ClientPortal 
          client={loggedInClient} 
          onLogout={() => setUserRole(null)} 
          staff={staff} 
          transactions={transactions}
          tasks={tasks}
          reports={reports}
          setReports={setReports}
        />
        <NotificationCenter notifications={notifications} removeNotification={removeNotification} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full">
        <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => setUserRole(null)}>
          <div className="bg-blue-600 p-2 rounded-xl">
            <HeartPulse className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">CareBridge<span className="text-blue-600">Hub</span></h1>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem view="dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem view="staff" icon={<UserRound size={20} />} label="Staff Management" />
          <NavItem view="clients" icon={<Users size={20} />} label="Clients" />
          <NavItem view="services" icon={<Settings size={20} />} label="Service Pricing" />
          <NavItem view="assignments" icon={<ClipboardList size={20} />} label="Assignments" />
          <NavItem view="reporting" icon={<FileText size={20} />} label="Client Reporting" />
          <NavItem view="accounting" icon={<Wallet size={20} />} label="Accounting" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button 
            onClick={() => {
              setUserRole(null);
              addNotification('Signed Out', 'You have been successfully signed out.', 'info');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">
              Agency {currentView.replace(/([A-Z])/g, ' $1').trim()}
            </h2>
            <p className="text-slate-500 font-medium">Main Admin Management Dashboard</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {currentView === 'dashboard' && <DashboardView staff={staff} clients={clients} />}
          {currentView === 'staff' && <StaffView staff={staff} setStaff={setStaff} addNotification={addNotification} />}
          {currentView === 'clients' && <ClientView clients={clients} setClients={setClients} addNotification={addNotification} />}
          {currentView === 'services' && <ServiceView services={services} setServices={setServices} addNotification={addNotification} />}
          {currentView === 'assignments' && <AssignmentView staff={staff} clients={clients} setClients={setClients} addNotification={addNotification} />}
          {currentView === 'reporting' && <ClientReportingView reports={reports} staff={staff} clients={clients} setReports={setReports} addNotification={addNotification} />}
          {currentView === 'accounting' && (
            <AccountingView 
              transactions={transactions} 
              timesheets={timesheets} 
              staff={staff} 
              clients={clients} 
              setTimesheets={setTimesheets}
              addNotification={addNotification}
            />
          )}
        </div>
      </main>
      <NotificationCenter notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
};

export default App;
