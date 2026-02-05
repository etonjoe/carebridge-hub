
import React, { useState, useMemo } from 'react';
import { Staff, Client, StaffStatus, ServiceType, Gender } from '../types';
import { Link2, Plus, Trash2, Filter, Search, MapPin, CreditCard, User, Users } from 'lucide-react';
import { NIGERIA_STATES } from '../constants';

interface Props {
  staff: Staff[];
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

const AssignmentView: React.FC<Props> = ({ staff, clients, setClients, addNotification }) => {
  // Filter States
  const [stateFilter, setStateFilter] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [ageRange, setAgeRange] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeStaff = staff.filter(s => s.status === StaffStatus.ACTIVE || s.status === StaffStatus.VERIFIED || s.status === StaffStatus.SHADOWING);

  // Filtered Clients Logic
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesState = stateFilter === '' || client.state === stateFilter;
      const matchesService = serviceFilter === '' || client.serviceType === serviceFilter;
      const matchesGender = genderFilter === '' || client.gender === genderFilter;
      const matchesPayment = paymentFilter === '' || 
        (paymentFilter === 'Paid' ? (client.balance || 0) <= 0 : (client.balance || 0) > 0);
      
      let matchesAge = true;
      if (ageRange === 'under-60') matchesAge = client.age < 60;
      else if (ageRange === '60-75') matchesAge = client.age >= 60 && client.age <= 75;
      else if (ageRange === 'over-75') matchesAge = client.age > 75;

      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesState && matchesService && matchesGender && matchesPayment && matchesAge && matchesSearch;
    });
  }, [clients, stateFilter, serviceFilter, genderFilter, paymentFilter, ageRange, searchQuery]);

  const handleAssign = (clientId: string, staffId: string) => {
    if (!staffId) return;
    
    const client = clients.find(c => c.id === clientId);
    const assignedStaff = staff.find(s => s.id === staffId);
    
    if (client && assignedStaff) {
      if (client.assignedStaffIds.includes(staffId)) {
        addNotification('Already Assigned', `${assignedStaff.name} is already part of the care team for this client.`, 'warning');
        return;
      }

      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, assignedStaffIds: [...c.assignedStaffIds, staffId] } 
          : c
      ));
      addNotification(
        'Staff Assigned',
        `${assignedStaff.name} (${assignedStaff.cadre}) has been added to ${client.name}'s care team.`,
        'success'
      );
    }
  };

  const handleUnassign = (clientId: string, staffId: string) => {
    setClients(prev => prev.map(c => 
      c.id === clientId 
        ? { ...c, assignedStaffIds: c.assignedStaffIds.filter(id => id !== staffId) } 
        : c
    ));
    addNotification('Staff Removed', 'The professional has been removed from the care team.', 'info');
  };

  const getStaffById = (id: string) => staff.find(s => s.id === id);

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by client name or email..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <Filter size={16} /> Filters
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* State Filter */}
          <select 
            className="filter-select"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All States</option>
            {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Service Type Filter */}
          <select 
            className="filter-select"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="">All Care Types</option>
            {Object.values(ServiceType).map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          {/* Age Filter */}
          <select 
            className="filter-select"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
          >
            <option value="">Any Age</option>
            <option value="under-60">Under 60</option>
            <option value="60-75">60 - 75</option>
            <option value="over-75">Over 75</option>
          </select>

          {/* Gender Filter */}
          <select 
            className="filter-select"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">Any Gender</option>
            {Object.values(Gender).map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          {/* Payment Filter */}
          <select 
            className="filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">Payment Status</option>
            <option value="Paid">Fully Paid</option>
            <option value="Owed">Outstanding Balance</option>
          </select>
        </div>
      </div>

      {/* Management Grid */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Link2 className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Care Team Management</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
              Showing {filteredClients.length} of {clients.length} Clients
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredClients.map(client => (
            <div key={client.id} className="p-8 flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300">
              {/* Client Info Section */}
              <div className="w-full lg:w-1/3">
                <div className="flex items-start gap-4 mb-4">
                   <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center font-bold text-blue-600 shadow-sm shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{client.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{client.serviceType}</span>
                      <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{client.gender} • Age {client.age}</span>
                    </div>
                    <div className="flex flex-col mt-2 gap-1">
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><MapPin size={10} /> {client.state} State</p>
                      <p className={`text-[10px] font-black flex items-center gap-1 ${ (client.balance || 0) > 0 ? 'text-amber-600' : 'text-emerald-600' }`}>
                        <CreditCard size={10} /> Balance: ₦{client.balance?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
                  "{client.carePlan || 'No care strategy defined'}"
                </div>
              </div>

              {/* Assignments Section */}
              <div className="w-full lg:w-2/3 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14} /> Active Care Team ({client.assignedStaffIds.length})
                  </h5>
                  
                  {/* Assignment Picker */}
                  <div className="relative">
                    <select 
                      className="appearance-none bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 pr-10 rounded-xl cursor-pointer hover:bg-blue-700 transition-all focus:outline-none shadow-lg shadow-blue-100"
                      onChange={(e) => handleAssign(client.id, e.target.value)}
                      value=""
                    >
                      <option value="" disabled>+ Add Professional</option>
                      {activeStaff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.cadre})</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Plus size={14} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {client.assignedStaffIds.map(staffId => {
                    const member = getStaffById(staffId);
                    if (!member) return null;
                    return (
                      <div key={staffId} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all group shadow-sm">
                        <div className="flex items-center gap-3">
                          <img src={member.avatar} className="w-8 h-8 rounded-full border border-slate-50 shadow-sm" alt="" />
                          <div>
                            <p className="text-xs font-black text-slate-900 line-clamp-1">{member.name}</p>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{member.cadre}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUnassign(client.id, staffId)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {client.assignedStaffIds.length === 0 && (
                    <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No professionals assigned yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <div className="p-20 text-center opacity-40">
               <Search size={48} className="mx-auto mb-4 text-slate-300" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No clients match the current filter criteria</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .filter-select {
          @apply w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer hover:bg-white;
        }
      `}</style>
    </div>
  );
};

export default AssignmentView;
