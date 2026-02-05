
import React, { useState } from 'react';
import { Staff, StaffCadre, StaffStatus, Gender, MaritalStatus, VerificationReport } from '../types';
import { Plus, UserCheck, Shield, GraduationCap, Users2, X, Clock, MapPin, Save, Trash2, ShieldCheck, Mail, Briefcase, ExternalLink, Fingerprint, Phone, Heart, Search } from 'lucide-react';
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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    const bioText = `${newStaff.training} (${newStaff.completionYear}). ${newStaff.bio}`;
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
    addNotification('Verification Initiated', `Council audit started for ${newStaff.name}.`, 'info');
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setStaff(prev => prev.map(s => s.id === selectedStaff.id ? selectedStaff : s));
    setIsEditModalOpen(false);
    addNotification('Success', 'Record updated.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Users2 className="text-blue-600" /> Professional Registry
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg">
          <Plus size={20} /> Onboard New Staff
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Professional</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Role & Region</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Status</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5 flex items-center gap-4">
                  <img src={s.avatar} className="w-10 h-10 rounded-xl border" />
                  <div>
                    <p className="font-black text-slate-900">{s.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{s.mobileNumber}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-slate-700">{s.cadre}</p>
                  <p className="text-[10px] font-bold text-slate-400">{s.state}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">{s.status}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => { setSelectedStaff({...s}); setIsEditModalOpen(true); }} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">Staff Onboarding</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              {!verificationResult ? (
                <form onSubmit={handleAddStaff} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Full Name</label>
                        <input required className="staff-input" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Mobile</label>
                        <input required className="staff-input" value={newStaff.mobileNumber} onChange={e => setNewStaff({...newStaff, mobileNumber: e.target.value})} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Gender</label>
                        <select className="staff-input" value={newStaff.gender} onChange={e => setNewStaff({...newStaff, gender: e.target.value as Gender})}>
                          {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Marital Status</label>
                        <select className="staff-input" value={newStaff.maritalStatus} onChange={e => setNewStaff({...newStaff, maritalStatus: e.target.value as MaritalStatus})}>
                          {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Role</label>
                        <select className="staff-input" value={newStaff.cadre} onChange={e => setNewStaff({...newStaff, cadre: e.target.value as StaffCadre})}>
                          {Object.values(StaffCadre).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Council ID</label>
                        <input required className="staff-input" value={newStaff.registrationNumber} onChange={e => setNewStaff({...newStaff, registrationNumber: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Education / Training</label>
                      <input required className="staff-input" placeholder="e.g. B.NSc Nursing - UNILAG" value={newStaff.training} onChange={e => setNewStaff({...newStaff, training: e.target.value})} />
                   </div>
                   <button disabled={isVerifying} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                    {isVerifying ? 'AI Audit in Progress...' : 'Submit for AI Verification'}
                   </button>
                </form>
              ) : (
                <div className="space-y-6">
                   <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <h4 className="text-emerald-800 font-black mb-2 flex items-center gap-2"><ShieldCheck size={18}/> AI Verification Report</h4>
                      <p className="text-sm text-emerald-700 italic leading-relaxed">{verificationResult.text}</p>
                   </div>
                   <button onClick={() => { setIsModalOpen(false); setVerificationResult(null); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase">Approve & Save to Registry</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <img src={selectedStaff.avatar} className="w-12 h-12 rounded-xl border" />
                  <h3 className="text-xl font-black text-slate-900">{selectedStaff.name}</h3>
               </div>
               <button onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="flex border-b bg-slate-50 p-2 gap-2">
               <button onClick={() => setActiveEditTab('personal')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${activeEditTab === 'personal' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Personal</button>
               <button onClick={() => setActiveEditTab('clinical')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${activeEditTab === 'clinical' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Clinical</button>
               <button onClick={() => setActiveEditTab('audit')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${activeEditTab === 'audit' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>AI Audit</button>
            </div>
            <form onSubmit={handleUpdateStaff} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
               {activeEditTab === 'personal' && (
                 <div className="grid grid-cols-2 gap-6 animate-in fade-in">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Mobile Number</label>
                       <input className="staff-input" value={selectedStaff.mobileNumber} onChange={e => setSelectedStaff({...selectedStaff, mobileNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Marital Status</label>
                       <select className="staff-input" value={selectedStaff.maritalStatus} onChange={e => setSelectedStaff({...selectedStaff, maritalStatus: e.target.value as MaritalStatus})}>
                          {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                 </div>
               )}
               {activeEditTab === 'clinical' && (
                 <div className="grid grid-cols-2 gap-6 animate-in fade-in">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Role</label>
                       <select className="staff-input" value={selectedStaff.cadre} onChange={e => setSelectedStaff({...selectedStaff, cadre: e.target.value as StaffCadre})}>
                          {Object.values(StaffCadre).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Training</label>
                       <input className="staff-input" value={selectedStaff.education.training} onChange={e => setSelectedStaff({...selectedStaff, education: {...selectedStaff.education, training: e.target.value}})} />
                    </div>
                 </div>
               )}
               {activeEditTab === 'audit' && (
                 <div className="space-y-4 animate-in fade-in">
                    {selectedStaff.verificationReport ? (
                      <div className="p-6 bg-slate-900 text-white rounded-3xl">
                         <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Council Registry Insight</p>
                         <p className="text-sm italic leading-relaxed text-slate-300">"{selectedStaff.verificationReport.summary}"</p>
                      </div>
                    ) : <p className="text-center py-10 text-slate-400 font-bold">No historical audit report found.</p>}
                 </div>
               )}
               <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => { if(confirm('Delete?')) { setStaff(staff.filter(s => s.id !== selectedStaff.id)); setIsEditModalOpen(false); }}} className="p-4 border border-rose-100 text-rose-500 rounded-2xl"><Trash2 size={20}/></button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-blue-100">Save Changes</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <style>{` .staff-input { @apply w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold text-sm transition-all; } `}</style>
    </div>
  );
};

export default StaffView;
