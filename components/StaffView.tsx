
import React, { useState } from 'react';
import { Staff, StaffCadre, StaffStatus, Gender, MaritalStatus } from '../types';
import { Plus, UserCheck, Shield, GraduationCap, Users2, MoreVertical, X, Clock, MapPin, Save, Trash2, ShieldCheck, Mail, Briefcase, CheckCircle, ExternalLink, Fingerprint, Phone, Heart } from 'lucide-react';
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
    
    const credentialBio = `${newStaff.training} (${newStaff.completionYear}). ${newStaff.bio}`;
    const result = await verifyStaffBio(newStaff.name, newStaff.cadre, newStaff.registrationNumber, credentialBio);
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
      education: {
        training: newStaff.training,
        completionYear: newStaff.completionYear
      },
      status: StaffStatus.PENDING_VERIFICATION,
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStaff.name}`,
      verified: false,
      trainingCompleted: false,
      shadowingCompleted: false,
      state: newStaff.state
    };

    setStaff([...staff, entry]);
    setIsVerifying(false);
    addNotification('Verification Initiated', `Council database query sent for ${newStaff.name}.`, 'info');
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setStaff(prev => prev.map(s => {
      if (s.id === selectedStaff.id) {
        const updated = { ...selectedStaff };
        if (updated.verified && updated.trainingCompleted && updated.shadowingCompleted && updated.status !== StaffStatus.ACTIVE) {
          updated.status = StaffStatus.ACTIVE;
        }
        return updated;
      }
      return s;
    }));
    setIsEditModalOpen(false);
    addNotification('Updated', `${selectedStaff.name}'s record has been updated.`, 'success');
  };

  const updateStatus = (id: string, field: keyof Staff, value: any) => {
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        if (updated.verified && updated.trainingCompleted && updated.shadowingCompleted) {
          updated.status = StaffStatus.ACTIVE;
        } else if (updated.verified && updated.trainingCompleted) {
          updated.status = StaffStatus.SHADOWING;
        } else if (updated.verified) {
          updated.status = StaffStatus.TRAINING;
        }
        
        if (updated.status !== s.status) {
          addNotification('Status Updated', `${s.name}'s status is now ${updated.status}.`, 'success');
        }
        return updated;
      }
      return s;
    }));
  };

  const getStatusColor = (status: StaffStatus) => {
    switch(status) {
      case StaffStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700';
      case StaffStatus.PENDING_VERIFICATION: return 'bg-amber-100 text-amber-700';
      case StaffStatus.TRAINING: return 'bg-blue-100 text-blue-700';
      case StaffStatus.SHADOWING: return 'bg-violet-100 text-violet-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
            <Users2 size={16} className="text-blue-600" />
            Active Professionals: {staff.filter(s => s.status === StaffStatus.ACTIVE).length} / {staff.length}
          </div>
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setVerificationResult(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={18} />
          Register New Professional
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Info</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Region & Cadre</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fast Audit</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img src={s.avatar} className="w-12 h-12 rounded-2xl border border-slate-200 shadow-sm" alt="" />
                    <div>
                      <p className="font-black text-slate-900">{s.name}</p>
                      <p className="text-xs font-medium text-slate-500">{s.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{s.mobileNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-700">{s.cadre}</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                      <MapPin size={10} className="text-blue-500" /> {s.state} State
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(s.status)}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(s.id, 'verified', !s.verified)}
                      className={`p-2 rounded-xl border transition-all ${s.verified ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm' : 'bg-white border-slate-200 text-slate-300 hover:border-emerald-200'}`}
                    >
                      <Shield size={16} />
                    </button>
                    <button 
                      onClick={() => updateStatus(s.id, 'trainingCompleted', !s.trainingCompleted)}
                      className={`p-2 rounded-xl border transition-all ${s.trainingCompleted ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-300 hover:border-blue-200'}`}
                    >
                      <GraduationCap size={16} />
                    </button>
                    <button 
                      onClick={() => updateStatus(s.id, 'shadowingCompleted', !s.shadowingCompleted)}
                      className={`p-2 rounded-xl border transition-all ${s.shadowingCompleted ? 'bg-violet-50 border-violet-200 text-violet-600 shadow-sm' : 'bg-white border-slate-200 text-slate-300 hover:border-violet-200'}`}
                    >
                      <UserCheck size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => {
                      setSelectedStaff({ ...s });
                      setIsEditModalOpen(true);
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 shadow-lg shadow-slate-200"
                  >
                    Edit Record
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
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Plus className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Council Verification Engine</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              {!verificationResult ? (
                <form onSubmit={handleAddStaff} className="space-y-6">
                  <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <UserCheck size={14} /> Personal Details
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                        <input 
                          required
                          className="staff-input"
                          placeholder="e.g. Adebayo Kunle"
                          value={newStaff.name}
                          onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Gender</label>
                        <select 
                          className="staff-input"
                          value={newStaff.gender}
                          onChange={e => setNewStaff({...newStaff, gender: e.target.value as Gender})}
                        >
                          {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            required
                            className="staff-input pl-12"
                            placeholder="+234 800 000 0000"
                            value={newStaff.mobileNumber}
                            onChange={e => setNewStaff({...newStaff, mobileNumber: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Marital Status</label>
                        <select 
                          className="staff-input"
                          value={newStaff.maritalStatus}
                          onChange={e => setNewStaff({...newStaff, maritalStatus: e.target.value as MaritalStatus})}
                        >
                          {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                        <input 
                          required
                          type="email"
                          className="staff-input"
                          placeholder="k.ade@carebridge.ng"
                          value={newStaff.email}
                          onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                        />
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <GraduationCap size={14} /> Academic Credentials
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Training/Institution</label>
                        <input 
                          required
                          className="staff-input"
                          placeholder="e.g. MBBS - UNILAG"
                          value={newStaff.training}
                          onChange={e => setNewStaff({...newStaff, training: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Completion Year</label>
                        <input 
                          required
                          type="number"
                          className="staff-input"
                          placeholder="2020"
                          value={newStaff.completionYear}
                          onChange={e => setNewStaff({...newStaff, completionYear: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Shield size={14} /> Clinical Registration
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Cadre</label>
                        <select 
                          className="staff-input"
                          value={newStaff.cadre}
                          onChange={e => setNewStaff({...newStaff, cadre: e.target.value as StaffCadre})}
                        >
                          {Object.values(StaffCadre).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Council Reg. No (MDCN/NMCN)</label>
                        <div className="relative">
                          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            required
                            className="staff-input pl-12"
                            placeholder="e.g. 123456/A"
                            value={newStaff.registrationNumber}
                            onChange={e => setNewStaff({...newStaff, registrationNumber: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Additional Bio Notes</label>
                    <textarea 
                      required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl h-24 focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium resize-none"
                      placeholder="Specializations, languages spoken, etc..."
                      value={newStaff.bio}
                      onChange={e => setNewStaff({...newStaff, bio: e.target.value})}
                    />
                  </div>
                  
                  <button 
                    disabled={isVerifying}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <><Clock className="animate-spin" size={20} /> Querying Council Registry...</>
                    ) : (
                      'Perform AI Professional Audit'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] relative overflow-hidden">
                    <ShieldCheck className="absolute -top-4 -right-4 text-emerald-100 w-32 h-32" />
                    <div className="relative z-10">
                      <h4 className="flex items-center gap-3 text-emerald-800 font-black mb-4">
                        <Shield className="text-emerald-500" />
                        Live Council Verification Report
                      </h4>
                      <p className="text-sm text-emerald-700 leading-relaxed italic whitespace-pre-wrap mb-6">
                        {verificationResult.text}
                      </p>

                      {verificationResult.sources.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-emerald-200">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Official Sources Found:</p>
                          <div className="flex flex-wrap gap-2">
                            {verificationResult.sources.map((source, i) => (
                              <a 
                                key={i} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-bold text-emerald-600 flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              >
                                {source.title} <ExternalLink size={10} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Discard</button>
                    <button 
                      onClick={() => {
                        setIsModalOpen(false);
                        setVerificationResult(null);
                        setNewStaff({
                          name: '', email: '', mobileNumber: '', gender: Gender.MALE, maritalStatus: MaritalStatus.SINGLE,
                          cadre: StaffCadre.CARER, state: 'Lagos', registrationNumber: '', training: '', completionYear: '2020', bio: ''
                        });
                      }}
                      className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                      Approve & Register Professional
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-xl">
                   <Users2 className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Manage Professional Credentials</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-white p-2 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserCheck size={14}/> Full Name</label>
                    <input 
                      required
                      className="staff-input"
                      value={selectedStaff.name}
                      onChange={e => setSelectedStaff({...selectedStaff, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail size={14}/> Email Address</label>
                    <input 
                      required
                      type="email"
                      className="staff-input"
                      value={selectedStaff.email}
                      onChange={e => setSelectedStaff({...selectedStaff, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone size={14}/> Mobile Number</label>
                    <input 
                      required
                      className="staff-input"
                      value={selectedStaff.mobileNumber}
                      onChange={e => setSelectedStaff({...selectedStaff, mobileNumber: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Gender</label>
                      <select 
                        className="staff-input"
                        value={selectedStaff.gender}
                        onChange={e => setSelectedStaff({...selectedStaff, gender: e.target.value as Gender})}
                      >
                        {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Marital Status</label>
                      <select 
                        className="staff-input"
                        value={selectedStaff.maritalStatus}
                        onChange={e => setSelectedStaff({...selectedStaff, maritalStatus: e.target.value as MaritalStatus})}
                      >
                        {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Fingerprint size={14}/> Council Reg. No</label>
                    <input 
                      className="staff-input"
                      value={selectedStaff.registrationNumber || ''}
                      onChange={e => setSelectedStaff({...selectedStaff, registrationNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><GraduationCap size={14}/> Education & Completion</label>
                    <div className="flex gap-2">
                      <input 
                        className="staff-input flex-1"
                        placeholder="Training/School"
                        value={selectedStaff.education.training}
                        onChange={e => setSelectedStaff({...selectedStaff, education: { ...selectedStaff.education, training: e.target.value }})}
                      />
                      <input 
                        className="staff-input w-24"
                        placeholder="Year"
                        value={selectedStaff.education.completionYear}
                        onChange={e => setSelectedStaff({...selectedStaff, education: { ...selectedStaff.education, completionYear: e.target.value }})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Workflow Status</label>
                    <select 
                      className="staff-input"
                      value={selectedStaff.status}
                      onChange={e => setSelectedStaff({...selectedStaff, status: e.target.value as StaffStatus})}
                    >
                      {Object.values(StaffStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Billing Rate (₦/hr)</label>
                    <input 
                      type="number"
                      className="staff-input"
                      value={selectedStaff.hourlyRate || 0}
                      onChange={e => setSelectedStaff({...selectedStaff, hourlyRate: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Compliance Checklist</h4>
                <div className="grid grid-cols-3 gap-4">
                  <ComplianceToggle 
                    label="MDCN/NMCN Verified" 
                    active={selectedStaff.verified} 
                    icon={<Shield size={18} />}
                    onClick={() => setSelectedStaff({...selectedStaff, verified: !selectedStaff.verified})}
                  />
                  <ComplianceToggle 
                    label="Training Completed" 
                    active={selectedStaff.trainingCompleted} 
                    icon={<GraduationCap size={18} />}
                    onClick={() => setSelectedStaff({...selectedStaff, trainingCompleted: !selectedStaff.trainingCompleted})}
                  />
                  <ComplianceToggle 
                    label="Shadowing Finished" 
                    active={selectedStaff.shadowingCompleted} 
                    icon={<UserCheck size={18} />}
                    onClick={() => setSelectedStaff({...selectedStaff, shadowingCompleted: !selectedStaff.shadowingCompleted})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  type="button"
                  onClick={() => {
                    if (confirm('Permanently remove this professional from registry?')) {
                      setStaff(prev => prev.filter(s => s.id !== selectedStaff.id));
                      setIsEditModalOpen(false);
                      addNotification('Removed', 'Staff record deleted.', 'info');
                    }
                  }}
                  className="px-6 py-4 border border-rose-100 text-rose-500 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} /> Delete Staff
                </button>
                <div className="flex-1" />
                <button 
                  type="submit"
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Save size={20} /> Update Record
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

const ComplianceToggle = ({ label, active, icon, onClick }: { label: string, active: boolean, icon: React.ReactNode, onClick: () => void }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3 group ${
      active ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
    }`}
  >
    <div className={`p-3 rounded-2xl ${active ? 'bg-white text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{label}</span>
    {active ? <CheckCircle size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-100" />}
  </button>
);

export default StaffView;
