
import React, { useState, useMemo } from 'react';
import { Transaction, Timesheet, Staff, Client, TransactionStatus } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';

interface Props {
  transactions: Transaction[];
  timesheets: Timesheet[];
  staff: Staff[];
  clients: Client[];
  setTimesheets: React.Dispatch<React.SetStateAction<Timesheet[]>>;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

const AccountingView: React.FC<Props> = ({ 
  transactions, 
  timesheets, 
  staff, 
  clients, 
  setTimesheets,
  addNotification 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'revenue' | 'payroll'>('dashboard');

  // Aggregated calculations
  const totalRevenue = useMemo(() => transactions
    .filter(t => t.type === 'income' && t.status === TransactionStatus.COMPLETED)
    .reduce((acc, t) => acc + t.amount, 0), [transactions]);

  const totalPayroll = useMemo(() => timesheets
    .reduce((acc, ts) => acc + ts.totalEarnings, 0), [timesheets]);

  const pendingPayroll = useMemo(() => timesheets
    .filter(ts => ts.payoutStatus === 'Pending')
    .reduce((acc, ts) => acc + ts.totalEarnings, 0), [timesheets]);

  const totalOutstanding = useMemo(() => clients
    .reduce((acc, c) => acc + (c.balance || 0), 0), [clients]);

  const netProfit = totalRevenue - totalPayroll;

  // Prepare chart data: Monthly Revenue vs Payroll
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { month: string, revenue: number, payroll: number } } = {};
    
    // Process Revenue
    transactions.filter(t => t.type === 'income').forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) monthlyData[month] = { month, revenue: 0, payroll: 0 };
      monthlyData[month].revenue += t.amount;
    });

    // Process Payroll
    timesheets.forEach(ts => {
      const month = ts.month;
      if (!monthlyData[month]) monthlyData[month] = { month, revenue: 0, payroll: 0 };
      monthlyData[month].payroll += ts.totalEarnings;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions, timesheets]);

  const handleProcessPayroll = (id: string) => {
    setTimesheets(prev => prev.map(ts => 
      ts.id === id ? { ...ts, payoutStatus: 'Paid' } : ts
    ));
    addNotification('Payroll Processed', 'Salary payment has been marked as completed.', 'success');
  };

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Unknown Staff';
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown Client';

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-black text-slate-900">₦{totalRevenue.toLocaleString()}</p>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="text-emerald-600 w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Payroll</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-black text-slate-900">₦{totalPayroll.toLocaleString()}</p>
            <div className="p-2 bg-rose-50 rounded-lg">
              <Briefcase className="text-rose-600 w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Margin</p>
          <div className="flex items-center justify-between">
            <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              ₦{netProfit.toLocaleString()}
            </p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <PieChartIcon className="text-blue-600 w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200 text-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Receivables</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-black">₦{totalOutstanding.toLocaleString()}</p>
            <div className="p-2 bg-white/10 rounded-lg">
              <CreditCard className="text-white w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChart3 size={18} /> Financial Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('revenue')}
            className={`px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'revenue' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <DollarSign size={18} /> Revenue History
          </button>
          <button 
            onClick={() => setActiveTab('payroll')}
            className={`px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'payroll' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Briefcase size={18} /> Payroll List
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'dashboard' ? (
            <div className="p-8 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue vs Payroll Chart */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Revenue vs. Operational Cost</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${(value/1000)}k`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" />
                        <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                        <Area type="monotone" dataKey="payroll" name="Total Payroll" stroke="#f43f5e" fillOpacity={1} fill="url(#colorPay)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Profit Distribution */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Financial Health Summary</h4>
                  <div className="space-y-4">
                    <SummaryCard 
                      label="Gross Margin" 
                      value={`${Math.round((netProfit / totalRevenue) * 100) || 0}%`} 
                      desc="Profit after direct labor costs" 
                      color="bg-emerald-500"
                    />
                    <SummaryCard 
                      label="Retention Rate" 
                      value="94%" 
                      desc="Client subscription renewal rate" 
                      color="bg-blue-500"
                    />
                    <SummaryCard 
                      label="Avg. Client LTV" 
                      value="₦1.2M" 
                      desc="Lifetime value per healthcare contract" 
                      color="bg-violet-500"
                    />
                    <div className="pt-4 mt-4 border-t border-slate-200">
                      <div className={`p-4 rounded-2xl flex items-center justify-between ${pendingPayroll > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        <div className="flex items-center gap-3">
                          <Clock size={20} />
                          <div>
                            <p className="text-xs font-bold">Pending Disbursements</p>
                            <p className="text-sm font-black">₦{pendingPayroll.toLocaleString()}</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                          Review All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'revenue' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-500">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Client</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Description</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.filter(t => t.type === 'income').map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-medium text-slate-500">{t.date}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-900">{getClientName(t.relatedEntityId)}</td>
                      <td className="px-8 py-5 text-sm text-slate-600">{t.description}</td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          t.status === TransactionStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-emerald-600">₦{t.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-500">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Month</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Staff Name</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Hours</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Earnings</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timesheets.map(ts => (
                    <tr key={ts.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-medium text-slate-500">{ts.month}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-900">{getStaffName(ts.staffId)}</td>
                      <td className="px-8 py-5 text-sm text-slate-600">{ts.hoursWorked} hrs</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900">₦{ts.totalEarnings.toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          ts.payoutStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ts.payoutStatus}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {ts.payoutStatus === 'Pending' && (
                          <button 
                            onClick={() => handleProcessPayroll(ts.id)}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, desc, color }: { label: string, value: string, desc: string, color: string }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
    </div>
    <div className={`w-2 h-12 rounded-full ${color}`} />
  </div>
);

export default AccountingView;
