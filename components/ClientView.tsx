
import React, { useState } from 'react';
import { Client, ServiceType, ClientStatus, Gender } from '../types';
import { UserPlus, Sparkles, FileText, CheckCircle, Clock, X, MapPin, Users2, Save, Trash2, ShieldCheck, UserCheck } from 'lucide-react';
import { generateCarePlan } from '../geminiService';
import { NIGERIA_STATES } from '../constants';

interface Props {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

const ClientView: React.FC<Props> = ({ clients, setClients, addNotification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [reviewersText, setReviewersText] = useState('');

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    serviceType: ServiceType.DAILY_VISIT,
    state: 'Lagos',
    notes: '',
    age: '65',
    gender: Gender.MALE
  });

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const planResult = await generateCarePlan(newClient.name, newClient.serviceType, newClient.notes);
      // Fixed: Extract the text property from the result object
      setGeneratedPlan(planResult.text);
    } catch (err) {
      addNotification('Error', 'Failed to generate care plan.', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalizeEnrollment = () => {
    const entry: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClient.name,
      email: newClient.email,
      serviceType: newClient.serviceType,
      status: ClientStatus.ONBOARDING,
      assignedStaffIds: [],
      signupDate: new Date().toISOString().split('T')[0],
      carePlan: generatedPlan || '',
      state: newClient.state,
      age: parseInt(newClient.age),
      gender: newClient.gender,
      reviewers: reviewersText.split(',').map(s => s.trim()).filter(s => s !== '')
    };

    setClients([...clients, entry]);
    setIsModalOpen(false);
    setGeneratedPlan(null);
    setReviewersText('');
    setNewClient({ name: '', email: '', serviceType: ServiceType.DAILY_VISIT, state: 'Lagos', notes: '', age: '65', gender: Gender.MALE });
    addNotification('Client Enrolled', `${newClient.name} has been added to the system.`, 'success');
  };

  const handleManageClient = (client: Client) => {
    setSelectedClient({ ...client });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setClients(prev => prev.map(c => c.id === selectedClient.id ? selectedClient : c));
    setIsEditModalOpen(false);
    addNotification('Success', 'Client record updated successfully.', 'success');
  };

  const getStatusIcon = (status: ClientStatus) => {
    switch(status) {
      case ClientStatus.ACTIVE: return <CheckCircle size={16} className="text-emerald-500" />;
      case ClientStatus.ONBOARDING: return <Clock size={16} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm font-medium">Overseeing {clients.length} active healthcare contracts across Nigeria</p>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setGeneratedPlan(null);
            setReviewersText('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          <UserPlus size={18} />
          New Enrollment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col border-b-4 border-b-slate-100 hover:border-b-blue-600">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl">
                <Users2 className="text-blue-600 w-6 h-6" />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                c.status === ClientStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {getStatusIcon(c.status)}
                {c.status}
              </div>
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-1">{c.name}</h4>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-4">
              <span className="flex items-center gap-1"><MapPin size={12} /> {c.state}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{c.gender} • {c.age} Yrs</span>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Clock size={14} className="text-blue-500" />
                <span className="uppercase tracking-wider">Service:</span>
                <span className="text-slate-900">{c.serviceType}</span>
              </div>
              <div className="flex items-start gap-2 text-xs font-bold text-slate-600">
                <FileText size={14} className="text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <span className="uppercase tracking-wider">Plan:</span>
                  <p className="text-slate-500 mt-1 line-clamp-2 font-medium italic">"{c.carePlan || 'Clinical review pending'}"</p>
                </div>
              </div>
              {c.reviewers && c.reviewers.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <ShieldCheck size={12} /> Approved by {c.reviewers.length} Reviewers
                </div>
              )}
            </div>

            <button 
              onClick={() => handleManageClient(c)}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-100"
            >
              Manage Client Record
            </button>
          </div>
        ))}
      </div>

      {/* ENROLLMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                   <UserPlus className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Patient Enrollment Engine</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              {!generatedPlan ? (
                <form onSubmit={handleGeneratePlan} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold"
                        placeholder="Chief Robert Thompson"
                        value={newClient.name}
                        onChange={e => setNewClient({...newClient, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input 
                        required
                        type="email"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold"
                        placeholder="robert.t@example.com"
                        value={newClient.email}
                        onChange={e => setNewClient({...newClient, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient Age</label>
                      <input 
                        required
                        type="number"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold"
                        value={newClient.age}
                        onChange={e => setNewClient({...newClient, age: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Gender</label>
                      <select 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold"
                        value={newClient.gender}
                        onChange={e => setNewClient({...newClient, gender: e.target.value as Gender})}
                      >
                        {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Preferred State</label>
                      <select 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold"
                        value={newClient.state}
                        onChange={e => setNewClient({...newClient, state: e.target.value})}
                      >
                        {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Service Level</label>
                      <select 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold"
                        value={newClient.serviceType}
                        onChange={e => setNewClient({...newClient, serviceType: e.target.value as ServiceType})}
                      >
                        {Object.values(ServiceType).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Context (for Gemini AI)</label>
                    <textarea 
                      required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl h-32 focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium resize-none"
                      placeholder="Specify medical history, specific care needs, and desired outcomes..."
                      value={newClient.notes}
                      onChange={e => setNewClient({...newClient, notes: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={isGenerating}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <><Sparkles className="animate-spin" size={20} /> Architecting Care Strategy...</>
                    ) : (
                      <><Sparkles size={20} /> Generate AI Care Plan</>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] relative overflow-hidden">
                    <Sparkles className="absolute -top-4 -right-4 text-blue-200 w-32 h-32 opacity-30" />
                    <div className="relative z-10">
                      <h4 className="text-blue-900 font-black mb-4 flex items-center gap-3">
                        <FileText size={20} />
                        AI Clinical Strategy
                      </h4>
                      <div className="text-sm text-blue-800 leading-relaxed italic whitespace-pre-wrap">
                        {generatedPlan}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <UserCheck size={16} className="text-blue-500" /> Internal Reviewers & Approvers
                    </label>
                    <input 
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold"
                      placeholder="Enter names (comma separated), e.g. Dr. Okafor, Nurse Amina"
                      value={reviewersText}
                      onChange={e => setReviewersText(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">Provide the names of clinical stakeholders who have audited this care strategy.</p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setGeneratedPlan(null)}
                      className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Back to Edit
                    </button>
                    <button 
                      onClick={handleFinalizeEnrollment}
                      className="flex-1 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      Finalize Enrollment <CheckCircle size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-xl">
                   <Users2 className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Manage Patient Record</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-white p-2 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Name</label>
                    <input 
                      required
                      className="edit-input"
                      value={selectedClient.name}
                      onChange={e => setSelectedClient({...selectedClient, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                    <input 
                      required
                      type="email"
                      className="edit-input"
                      value={selectedClient.email}
                      onChange={e => setSelectedClient({...selectedClient, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Age</label>
                      <input 
                        required
                        type="number"
                        className="edit-input"
                        value={selectedClient.age}
                        onChange={e => setSelectedClient({...selectedClient, age: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Gender</label>
                      <select 
                        className="edit-input"
                        value={selectedClient.gender}
                        onChange={e => setSelectedClient({...selectedClient, gender: e.target.value as Gender})}
                      >
                        {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select 
                      className="edit-input"
                      value={selectedClient.status}
                      onChange={e => setSelectedClient({...selectedClient, status: e.target.value as ClientStatus})}
                    >
                      {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">State</label>
                    <select 
                      className="edit-input"
                      value={selectedClient.state}
                      onChange={e => setSelectedClient({...selectedClient, state: e.target.value})}
                    >
                      {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Service Level</label>
                    <select 
                      className="edit-input"
                      value={selectedClient.serviceType}
                      onChange={e => setSelectedClient({...selectedClient, serviceType: e.target.value as ServiceType})}
                    >
                      {Object.values(ServiceType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Account Balance (₦)</label>
                    <input 
                      type="number"
                      className="edit-input"
                      value={selectedClient.balance}
                      onChange={e => setSelectedClient({...selectedClient, balance: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Approved Reviewers</label>
                    <input 
                      className="edit-input"
                      value={selectedClient.reviewers?.join(', ') || ''}
                      placeholder="Add reviewer names..."
                      onChange={e => setSelectedClient({...selectedClient, reviewers: e.target.value.split(',').map(s => s.trim())})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Care Strategy</label>
                <textarea 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl h-48 focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium leading-relaxed resize-none italic"
                  value={selectedClient.carePlan}
                  onChange={e => setSelectedClient({...selectedClient, carePlan: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this client?')) {
                      setClients(prev => prev.filter(c => c.id !== selectedClient.id));
                      setIsEditModalOpen(false);
                      addNotification('Deleted', 'Client record removed from database.', 'info');
                    }
                  }}
                  className="px-6 py-4 border border-rose-100 text-rose-500 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} /> Delete Record
                </button>
                <div className="flex-1" />
                <button 
                  type="submit"
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Save size={20} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .edit-input {
          @apply w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold text-sm transition-all;
        }
      `}</style>
    </div>
  );
};

export default ClientView;
