
import React, { useState } from 'react';
import { Staff, StaffCadre, StaffStatus, Gender, MaritalStatus, VerificationReport } from '../types';
import { 
  Plus, 
  UserCheck, 
  Shield, 
  GraduationCap, 
  Users2, 
  X, 
  Clock, 
  MapPin, 
  Save, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Briefcase, 
  ExternalLink, 
  Fingerprint, 
  Phone, 
  Heart, 
  Search, 
  CheckCircle,
  Sparkles 
} from 'lucide-react';
import { verifyStaffBio } from '../geminiService';
import { NIGERIA_STATES } from '../constants';

interface Props {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

const StaffView: React.FC<Props> = ({ staff, setStaff, addNotification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<'personal' | 'clinical' | 'audit'>('personal');
  const [verificationResult, setVerificationResult] = useState<{ text: string, sources: any[] } | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    cadre: StaffCadre.CARER,
    state: 'Lagos',
    registrationNumber: '',
    training: '',
    completionYear: new Date().getFullYear().toString(),
    bio: ''
  });

  const updateStatus = (id: string, field: keyof Staff, value: any) => {
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        
        let newStatus = updated.status;
        if (updated.verified && updated.trainingCompleted && updated.shadowingCompleted) {
          newStatus = StaffStatus.ACTIVE;
        } else if (updated.verified && updated.trainingCompleted) {
          newStatus = StaffStatus.SHADOWING;
        } else if (updated.verified) {
          newStatus = StaffStatus.TRAINING;
        } else {
          newStatus = StaffStatus.PENDING_VERIFICATION;
        }

        if (newStatus !== s.status) {
          addNotification('Status Progression', `${s.name} moved to ${newStatus}.`, 'success');
        }

        return { ...updated, status: newStatus };
      }
      return s;
    }));
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    const bioText = `${newStaff.training} (${newStaff.completionYear}). ${newStaff.bio}`;
    
    try {
      const result = await verifyStaffBio(newStaff.name, newStaff.cadre, newStaff.registrationNumber, bioText);
      setVerificationResult(result);
      
      const entry: Staff = {
        id: Math.random().toString(36).substr(2, 9),
        name: newStaff.name,
        email: newStaff.email,
        mobileNumber: newStaff.mobileNumber,
        gender: newStaff.gender,
        maritalStatus: newStaff.maritalStatus,
        cadre: newStaff.cadre,
        registrationNumber: newStaff.registrationNumber,
        education: { training: newStaff.training, completionYear: newStaff.completionYear },
        status: StaffStatus.PENDING_VERIFICATION,
        joinedDate: new Date().toISOString().split('T')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStaff.name}`,
        verified: false,
        trainingCompleted: false,
        shadowingCompleted: false,
        state: newStaff.state,
        verificationReport: { summary: result.text, sources: result.sources, verifiedAt: new Date().toISOString() }
      };

      setStaff([...staff, entry]);
      setIsVerifying(false);
      addNotification('Onboarding Started', `Council audit initiated for ${newStaff.name}.`, 'info');
    } catch (err) {
      addNotification('Verification Error', 'AI failed to reach council registry.', 'warning');
      setIsVerifying(false);
    }
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setStaff(prev => prev.map(s => s.id === selectedStaff.id ? selectedStaff : s));
    setIsEditModalOpen(false);
    addNotification('Success', 'Professional record updated.', 'success');
  };

  const getStatusColor = (status: StaffStatus) => {
    switch(status) {
      case StaffStatus.ACTIVE: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case StaffStatus.PENDING_VERIFICATION: return 'bg-amber-50 text-amber-700 border-amber-100';
      case StaffStatus.TRAINING: return 'bg-blue-50 text-blue-700 border-blue-100';
      case StaffStatus.SHADOWING: return 'bg-violet-50 text-violet-700 border-violet-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl"><Users2 className="text-white" size={20} /></div>
          Workforce Registry
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 transition-all">
          <Plus size={20} /> Register Professional
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Professional Identity</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Clinical Standing</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Workflow Step</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Compliance Actions</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5 flex items-center gap-4">
                  <div className="relative">
                    <img src={s.avatar} className="w-12 h-12 rounded-2xl border shadow-sm" />
                    {s.verified && <div className="absolute -top-1 -right-1 bg-blue-600 p-0.5 rounded-md border-2 border-white"><ShieldCheck size={10} className="text-white" /></div>}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{s.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{s.email}</p>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter mt-1">{s.mobileNumber}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-slate-700">{s.cadre}</p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><MapPin size={10} className="text-blue-500" /> {s.state}</p>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(s.status)}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex gap-2">
                    <ActionButton active={s.verified} icon={<Shield size={16} />} onClick={() => updateStatus(s.id, 'verified', !s.verified)} tooltip="Verify License" color="emerald" />
                    <ActionButton active={s.trainingCompleted} icon={<GraduationCap size={16} />} onClick={() => updateStatus(s.id, 'trainingCompleted', !s.trainingCompleted)} tooltip="Complete Training" color="blue" />
                    <ActionButton active={s.shadowingCompleted} icon={<UserCheck size={16} />} onClick={() => updateStatus(s.id, 'shadowingCompleted', !s.shadowingCompleted)} tooltip="Confirm Shadowing" color="violet" />
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => { setSelectedStaff({...s}); setIsEditModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-blue-600">
                    Full Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Fingerprint className="text-blue-600" /> Professional Onboarding</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all duration-300"><X size={24} /></button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              {!verificationResult ? (
                <form onSubmit={handleAddStaff} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Legal Name</label>
                        <input required className="staff-input" placeholder="e.g. Dr. Kolawole" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Mobile No.</label>
                        <input required className="staff-input" placeholder="+234..." value={newStaff.mobileNumber} onChange={e => setNewStaff({...newStaff, mobileNumber: e.target.value})} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Gender</label>
                        <select className="staff-input" value={newStaff.gender} onChange={e => setNewStaff({...newStaff, gender: e.target.value as Gender})}>
                          {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">State of Residence</label>
                        <select className="staff-input" value={newStaff.state} onChange={e => setNewStaff({...newStaff, state: e.target.value})}>
                          {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Primary Role</label>
                        <select className="staff-input" value={newStaff.cadre} onChange={e => setNewStaff({...newStaff, cadre: e.target.value as StaffCadre})}>
                          {Object.values(StaffCadre).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Council Reg No.</label>
                        <input required className="staff-input" placeholder="MDCN/NMCN ID" value={newStaff.registrationNumber} onChange={e => setNewStaff({...newStaff, registrationNumber: e.target.value})} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Training Institution</label>
                        <input required className="staff-input" placeholder="University / Hospital" value={newStaff.training} onChange={e => setNewStaff({...newStaff, training: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Graduation Year</label>
                        <input required className="staff-input" placeholder="YYYY" value={newStaff.completionYear} onChange={e => setNewStaff({...newStaff, completionYear: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Education & Background</label>
                      <textarea required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium text-sm transition-all" placeholder="Tell us about your training and experience..." value={newStaff.bio} onChange={e => setNewStaff({...newStaff, bio: e.target.value})} />
                   </div>
                   <button disabled={isVerifying} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    {isVerifying ? <><Clock className="animate-spin" size={20}/> Consulting Council Databases...</> : <><Sparkles size={20}/> Submit for AI Verification</>}
                   </button>
                </form>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 relative">
                      <ShieldCheck className="absolute top-4 right-4 text-emerald-100" size={64} />
                      <h4 className="text-emerald-800 font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-xs"> Registry Integrity Audit</h4>
                      <p className="text-sm text-emerald-700 italic leading-relaxed mb-6">"{verificationResult.text}"</p>
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-emerald-200">
                        {verificationResult.sources.map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="bg-white px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-black text-emerald-600 flex items-center gap-1 hover:bg-emerald-600 hover:text-white transition-all">
                            {s.title} <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                   </div>
                   <button onClick={() => { setIsModalOpen(false); setVerificationResult(null); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Approve & Join Workforce</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <img src={selectedStaff.avatar} className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg" />
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedStaff.name}</h3>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedStaff.cadre}</p>
                  </div>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white border rounded-full hover:bg-slate-50 transition-all"><X size={20} /></button>
            </div>
            <div className="flex border-b bg-slate-50/50 p-2 gap-2">
               <TabLink active={activeEditTab === 'personal'} onClick={() => setActiveEditTab('personal')} icon={<Mail size={16}/>} label="Registry Data" />
               <TabLink active={activeEditTab === 'clinical'} onClick={() => setActiveEditTab('clinical')} icon={<Briefcase size={16}/>} label="Compliance" />
               <TabLink active={activeEditTab === 'audit'} onClick={() => setActiveEditTab('audit')} icon={<ShieldCheck size={16}/>} label="AI Audit Report" />
            </div>
            <form onSubmit={handleUpdateStaff} className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
               {activeEditTab === 'personal' && (
                 <div className="grid grid-cols-2 gap-8 animate-in fade-in">
                    <div className="space-y-4">
                       <InputGroup label="Email Contact" value={selectedStaff.email} onChange={e => setSelectedStaff({...selectedStaff, email: e.target.value})} icon={<Mail size={14}/>} />
                       <InputGroup label="Phone Number" value={selectedStaff.mobileNumber} onChange={e => setSelectedStaff({...selectedStaff, mobileNumber: e.target.value})} icon={<Phone size={14}/>} />
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Heart size={14}/> Marital Status</label>
                          <select className="staff-input" value={selectedStaff.maritalStatus} onChange={e => setSelectedStaff({...selectedStaff, maritalStatus: e.target.value as MaritalStatus})}>
                             {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Users2 size={14}/> Work State</label>
                          <select className="staff-input" value={selectedStaff.state} onChange={e => setSelectedStaff({...selectedStaff, state: e.target.value})}>
                            {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>
               )}
               {activeEditTab === 'clinical' && (
                 <div className="grid grid-cols-2 gap-8 animate-in fade-in">
                    <div className="space-y-4">
                       <InputGroup label="Council ID" value={selectedStaff.registrationNumber || ''} onChange={e => setSelectedStaff({...selectedStaff, registrationNumber: e.target.value})} icon={<Fingerprint size={14}/>} />
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Clock size={14}/> System Status</label>
                          <select className="staff-input" value={selectedStaff.status} onChange={e => setSelectedStaff({...selectedStaff, status: e.target.value as StaffStatus})}>
                             {Object.values(StaffStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <InputGroup label="Clinical Education" value={selectedStaff.education.training} onChange={e => setSelectedStaff({...selectedStaff, education: {...selectedStaff.education, training: e.target.value}})} icon={<GraduationCap size={14}/>} />
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Checklist</p>
                          <div className="flex gap-2">
                             <CheckBadge active={selectedStaff.verified} label="Reg Verified" />
                             <CheckBadge active={selectedStaff.trainingCompleted} label="In-house Trained" />
                          </div>
                       </div>
                    </div>
                 </div>
               )}
               {activeEditTab === 'audit' && (
                 <div className="space-y-4 animate-in fade-in">
                    {selectedStaff.verificationReport ? (
                      <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                         <ShieldCheck className="absolute -bottom-10 -right-10 text-white/5" size={200} />
                         <p className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                           <Shield size={14} /> Official Intelligence Snapshot
                         </p>
                         <p className="text-sm italic leading-relaxed text-slate-300 mb-8 relative z-10">"{selectedStaff.verificationReport.summary}"</p>
                         <div className="pt-6 border-t border-white/10">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Verification Sources</p>
                            <div className="flex flex-wrap gap-2 relative z-10">
                              {selectedStaff.verificationReport.sources.map((src, i) => (
                                <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/10 flex items-center gap-2 transition-all">
                                  {src.title} <ExternalLink size={12} />
                                </a>
                              ))}
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="p-20 text-center opacity-40 border-2 border-dashed rounded-[2.5rem]">
                         <Search size={48} className="mx-auto mb-4 text-slate-300" />
                         <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No persistent audit trail found</p>
                      </div>
                    )}
                 </div>
               )}
               <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => { if(confirm('Permanently remove from registry?')) { setStaff(staff.filter(s => s.id !== selectedStaff.id)); setIsEditModalOpen(false); }}} className="p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={24}/></button>
                  <div className="flex-1" />
                  <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Save size={20} /> Update Registry Profile
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .staff-input {
          @apply w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold text-sm transition-all;
        }
      `}</style>
    </div>
  );
};

const ActionButton = ({ active, icon, onClick, tooltip, color }: { active: boolean, icon: React.ReactNode, onClick: () => void, tooltip: string, color: string }) => {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    violet: 'text-violet-600 bg-violet-50 border-violet-100'
  };
  
  return (
    <button 
      onClick={onClick}
      title={tooltip}
      className={`p-2.5 rounded-xl border transition-all ${active ? colors[color] + ' shadow-sm' : 'bg-white text-slate-300 border-slate-200 hover:border-slate-300'}`}
    >
      {icon}
    </button>
  );
};

const TabLink = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon} {label}
  </button>
);

const InputGroup = ({ label, value, onChange, icon }: { label: string, value: string, onChange: (e: any) => void, icon: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">{icon} {label}</label>
    <input className="staff-input" value={value} onChange={onChange} />
  </div>
);

const CheckBadge = ({ active, label }: { active: boolean, label: string }) => (
  <div className={`px-2 py-1 rounded-md border text-[8px] font-black uppercase flex items-center gap-1 ${active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
    {active ? <CheckCircle size={10} /> : <Clock size={10} />} {label}
  </div>
);

export default StaffView;
