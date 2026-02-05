
import React from 'react';
import { Staff, Client, StaffStatus, ClientStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserCheck, Clock, ShieldCheck, Activity, MapPin } from 'lucide-react';

interface Props {
  staff: Staff[];
  clients: Client[];
}

const DashboardView: React.FC<Props> = ({ staff, clients }) => {
  const activeStaff = staff.filter(s => s.status === StaffStatus.ACTIVE).length;
  const verifiedStaff = staff.filter(s => s.verified).length;
  const onboardingClients = clients.filter(c => c.status === ClientStatus.ONBOARDING).length;
  
  const staffCadreData = [
    { name: 'Doctors', value: staff.filter(s => s.cadre === 'Doctor').length },
    { name: 'Nurses', value: staff.filter(s => s.cadre === 'Nurse').length },
    { name: 'Carers', value: staff.filter(s => s.cadre === 'Carer').length },
    { name: 'Cooks', value: staff.filter(s => s.cadre === 'Cook').length },
  ];

  const stateDistribution = staff.reduce((acc: any, s) => {
    acc[s.state] = (acc[s.state] || 0) + 1;
    return acc;
  }, {});

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c'];

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`${color} p-3 rounded-xl`}>
        <Icon className="text-white w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Activity} label="Active Clients" value={clients.filter(c => c.status === ClientStatus.ACTIVE).length} color="bg-blue-600" />
        <StatCard icon={UserCheck} label="Verified Professionals" value={activeStaff} color="bg-emerald-600" />
        <StatCard icon={ShieldCheck} label="MDCN/NMCN Cleared" value={`${verifiedStaff}/${staff.length}`} color="bg-violet-600" />
        <StatCard icon={Clock} label="Pending Intake" value={onboardingClients} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Workforce Distribution by Cadre</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffCadreData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {staffCadreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-blue-600" />
            Top Coverage Areas
          </h3>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {Object.entries(stateDistribution).sort((a: any, b: any) => b[1] - a[1]).map(([state, count]: any) => (
              <div key={state} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-sm text-slate-700">{state} State</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {count} Staff
                </span>
              </div>
            ))}
            {Object.keys(stateDistribution).length === 0 && (
              <p className="text-slate-400 text-center py-10 italic">No location data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
