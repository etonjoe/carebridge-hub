
import React, { useState } from 'react';
import { ServicePackage, StaffCadre } from '../types';
import { Stethoscope, Heart, Utensils, Check, TrendingUp, Plus, X, ShieldCheck, Save, Trash2, Edit3, Settings2 } from 'lucide-react';

interface Props {
  services: ServicePackage[];
  setServices: React.Dispatch<React.SetStateAction<ServicePackage[]>>;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

const ServiceView: React.FC<Props> = ({ services, setServices, addNotification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    hourlyRate: '',
    cadreRequired: StaffCadre.CARER
  });

  const getCadreIcon = (cadre: string) => {
    switch(cadre) {
      case 'Doctor': return <Stethoscope className="text-blue-500" />;
      case 'Nurse': return <Heart className="text-rose-500" />;
      case 'Cook': return <Utensils className="text-amber-500" />;
      default: return <Heart className="text-emerald-500" />;
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const service: ServicePackage = {
      id: `p-${Date.now()}`,
      name: newService.name,
      description: newService.description,
      hourlyRate: parseFloat(newService.hourlyRate),
      cadreRequired: newService.cadreRequired
    };

    setServices(prev => [...prev, service]);
    setIsModalOpen(false);
    setNewService({
      name: '',
      description: '',
      hourlyRate: '',
      cadreRequired: StaffCadre.CARER
    });
    addNotification('Service Created', `New service "${service.name}" has been added to the registry.`, 'success');
  };

  const handleManageService = (service: ServicePackage) => {
    setSelectedService({ ...service });
    setIsEditModalOpen(true);
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setServices(prev => prev.map(s => s.id === selectedService.id ? selectedService : s));
    setIsEditModalOpen(false);
    addNotification('Service Updated', `Pricing and details for "${selectedService.name}" have been updated.`, 'success');
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Are you sure you want to remove this service package? This may affect existing client billings.')) {
      setServices(prev => prev.filter(s => s.id !== id));
      setIsEditModalOpen(false);
      addNotification('Service Removed', 'The service package has been deleted from the registry.', 'info');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Agency Pricing Engine</h3>
          <p className="text-slate-500 font-medium">Define service rates and clinical requirements across our Nigerian network.</p>
        </div>
        <div className="flex gap-8 items-center shrink-0">
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Avg Platform Margin</p>
              <p className="text-2xl font-black text-emerald-600">28%</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <TrendingUp className="text-emerald-600" />
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-blue-100"
          >
            <Plus size={20} />
            New Service Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map(pkg => (
          <div key={pkg.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-blue-200 transition-all group hover:shadow-2xl hover:-translate-y-1 flex flex-col">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors shadow-sm">
                  {getCadreIcon(pkg.cadreRequired)}
                </div>
                <button 
                  onClick={() => handleManageService(pkg)}
                  className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit3 size={18} />
                </button>
              </div>
              
              <h4 className="text-xl font-black text-slate-900 mb-2">{pkg.name}</h4>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed font-medium italic line-clamp-2">
                "{pkg.description}"
              </p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-3xl font-black text-slate-900">₦{pkg.hourlyRate.toLocaleString()}</span>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">/ hour</span>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="p-1 bg-emerald-50 rounded-md"><Check size={12} className="text-emerald-500" /></div>
                  Staff: <span className="text-slate-900 ml-auto">{pkg.cadreRequired}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="p-1 bg-emerald-50 rounded-md"><Check size={12} className="text-emerald-500" /></div>
                  Verification: <span className="text-slate-900 ml-auto">Clinical Vetting</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="p-1 bg-emerald-50 rounded-md"><Check size={12} className="text-emerald-500" /></div>
                  Availability: <span className="text-slate-900 ml-auto">State-wide</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleManageService(pkg)}
              className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Settings2 size={14} /> Adjust Configuration
            </button>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
                  <ShieldCheck className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Add New Service Package</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddService} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Package Name</label>
                <input 
                  required
                  className="service-input"
                  placeholder="e.g. Critical Care Support"
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Hourly Rate (₦)</label>
                  <input 
                    required
                    type="number"
                    className="service-input"
                    placeholder="25000"
                    value={newService.hourlyRate}
                    onChange={e => setNewService({...newService, hourlyRate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Required Cadre</label>
                  <select 
                    className="service-input"
                    value={newService.cadreRequired}
                    onChange={e => setNewService({...newService, cadreRequired: e.target.value as StaffCadre})}
                  >
                    {Object.values(StaffCadre).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Service Description</label>
                <textarea 
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl h-32 focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium resize-none leading-relaxed italic"
                  placeholder="Detailed explanation of what this service covers..."
                  value={newService.description}
                  onChange={e => setNewService({...newService, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
              >
                Launch Service Package
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-xl shadow-lg shadow-slate-200">
                  <Settings2 className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Modify Service Package</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-white p-2 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateService} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Package Name</label>
                <input 
                  required
                  className="service-input"
                  value={selectedService.name}
                  onChange={e => setSelectedService({...selectedService, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Hourly Rate (₦)</label>
                  <input 
                    required
                    type="number"
                    className="service-input"
                    value={selectedService.hourlyRate}
                    onChange={e => setSelectedService({...selectedService, hourlyRate: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Required Cadre</label>
                  <select 
                    className="service-input"
                    value={selectedService.cadreRequired}
                    onChange={e => setSelectedService({...selectedService, cadreRequired: e.target.value as StaffCadre})}
                  >
                    {Object.values(StaffCadre).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Service Description</label>
                <textarea 
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl h-32 focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium resize-none leading-relaxed italic"
                  value={selectedService.description}
                  onChange={e => setSelectedService({...selectedService, description: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => handleDeleteService(selectedService.id)}
                  className="px-6 py-4 border border-rose-100 text-rose-500 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} /> Delete
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .service-input {
          @apply w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-black text-sm transition-all;
        }
      `}</style>
    </div>
  );
};

export default ServiceView;
