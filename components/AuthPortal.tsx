
import React, { useState } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  UserCheck, 
  Building2, 
  ArrowRight, 
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Lock,
  Shield,
  Fingerprint,
  Phone,
  Heart,
  GraduationCap
} from 'lucide-react';
import { Staff, Client, StaffCadre, StaffStatus, ClientStatus, ServiceType, Gender, MaritalStatus } from '../types';
import { NIGERIA_STATES } from '../constants';
import { generateCarePlan, verifyStaffBio } from '../geminiService';

type AuthStep = 'landing' | 'login' | 'signup_staff' | 'signup_client';
type Role = 'admin' | 'staff' | 'client';

interface Props {
  onLogin: (role: any, id: string) => void;
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const AuthPortal: React.FC<Props> = ({ onLogin, staff, setStaff, clients, setClients }) => {
  const [step, setStep] = useState<AuthStep>('landing');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    password: '',
    state: 'Lagos',
    cadre: StaffCadre.NURSE,
    registrationNumber: '',
    training: '',
    completionYear: new Date().getFullYear().toString(),
    credentials: '',
    serviceType: ServiceType.DAILY_VISIT,
    healthNotes: '',
    age: '65',
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'admin') {
      onLogin('admin', 'admin-id');
      return;
    }
    
    const user = selectedRole === 'staff' 
      ? staff.find(s => s.email === formData.email) 
      : clients.find(c => c.email === formData.email);

    if (user) {
      onLogin(selectedRole, user.id);
    } else {
      setError("Account not found. Please sign up first.");
    }
  };

  const handleStaffSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const credentialSummary = `${formData.training} (${formData.completionYear}). ${formData.credentials}`;
    await verifyStaffBio(formData.name, formData.cadre, formData.registrationNumber, credentialSummary);
    
    const newStaff: Staff = {
      id: `s-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      cadre: formData.cadre,
      registrationNumber: formData.registrationNumber,
      education: {
        training: formData.training,
        completionYear: formData.completionYear
      },
      state: formData.state,
      status: StaffStatus.PENDING_VERIFICATION,
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      verified: false,
      trainingCompleted: false,
      shadowingCompleted: false
    };
    
    setStaff([...staff, newStaff]);
    setIsLoading(false);
    onLogin('staff', newStaff.id);
  };

  const handleClientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const aiPlan = await generateCarePlan(formData.name, formData.serviceType, formData.healthNotes);
    
    const newClient: Client = {
      id: `c-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      serviceType: formData.serviceType,
      state: formData.state,
      status: ClientStatus.ONBOARDING,
      assignedStaffIds: [],
      signupDate: new Date().toISOString().split('T')[0],
      carePlan: aiPlan.text,
      age: parseInt(formData.age),
      gender: formData.gender
    };
    setClients([...clients, newClient]);
    setIsLoading(false);
    onLogin('client', newClient.id);
  };

  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-blue-600 p-4 rounded-3xl inline-block mb-6 shadow-xl shadow-blue-200">
            <HeartPulse className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">CareBridge Hub</h1>
          <p className="text-slate-500 font-medium max-w-md">OGEPENKINS CLINIC's intelligent healthcare workforce & care management portal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl animate-in zoom-in duration-500">
          <RoleCard 
            title="Health Professional" 
            desc="Register as a Doctor, Nurse, or Carer. Get verified and matched with clients."
            icon={<Stethoscope size={32} />}
            color="text-blue-600"
            bg="bg-blue-50"
            onClick={() => { setSelectedRole('staff'); setStep('login'); }}
          />
          <RoleCard 
            title="Patient / Family" 
            desc="Sign up for personalized care. AI-driven health plans for your loved ones."
            icon={<UserCheck size={32} />}
            color="text-emerald-600"
            bg="bg-emerald-50"
            onClick={() => { setSelectedRole('client'); setStep('login'); }}
          />
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <button 
            onClick={() => { setSelectedRole('admin'); setStep('login'); }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all text-sm font-bold shadow-sm"
          >
            <Lock size={16} />
            Agency Partner Login
          </button>
          
          <div className="flex flex-col items-center gap-6 pt-8 border-t border-slate-200/60 w-full max-w-4xl">
            <div className="flex items-center gap-2 text-slate-400 font-medium text-sm mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">NG Proudly Nigerian | MDCN & NMCN Compliant</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden my-8">
        <div className="p-8 md:p-12">
          <button 
            onClick={() => setStep('landing')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 font-bold text-sm transition-colors"
          >
            <ChevronLeft size={18} /> Back to selection
          </button>

          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {step === 'login' ? `Welcome Back, ${selectedRole?.toUpperCase()}` : 'Create Your Account'}
          </h2>

          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setStep('login')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${step === 'login' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
            >Login</button>
            <button 
              onClick={() => setStep(selectedRole === 'staff' ? 'signup_staff' : 'signup_client')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${step !== 'login' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
            >Signup</button>
          </div>

          {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">{error}</div>}

          {step === 'login' ? (
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <input 
                  type="email" required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium"
                  placeholder="name@example.ng"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <input 
                  type="password" required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                Sign In <ArrowRight size={20} />
              </button>
            </form>
          ) : step === 'signup_staff' ? (
            <form onSubmit={handleStaffSignup} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input required className="input-field" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="email" required className="input-field" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input required className="input-field pl-12" placeholder="Mobile Number" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                </div>
                <div className="relative">
                   <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <select className="input-field pl-12" value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value as MaritalStatus})}>
                     {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="input-field" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                   {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select className="input-field" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                  {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <GraduationCap size={14} /> Education & Completion
                </h4>
                <div className="grid grid-cols-3 gap-3">
                   <input required className="input-field bg-white col-span-2" placeholder="Training/Degree" value={formData.training} onChange={e => setFormData({...formData, training: e.target.value})} />
                   <input required className="input-field bg-white" placeholder="Year" type="number" value={formData.completionYear} onChange={e => setFormData({...formData, completionYear: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="input-field" value={formData.cadre} onChange={e => setFormData({...formData, cadre: e.target.value as StaffCadre})}>
                  {Object.values(StaffCadre).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative">
                   <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input 
                     required 
                     className="input-field pl-12" 
                     placeholder="Council Reg No." 
                     value={formData.registrationNumber} 
                     onChange={e => setFormData({...formData, registrationNumber: e.target.value})} 
                   />
                </div>
              </div>
              <textarea 
                required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 text-sm focus:outline-none" 
                placeholder="Details of experience and specializations..."
                value={formData.credentials}
                onChange={e => setFormData({...formData, credentials: e.target.value})}
              />
              <button disabled={isLoading} className="btn-primary">
                {isLoading ? <span className="animate-pulse">Querying Council Portals...</span> : 'Initiate Verification & Join'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleClientSignup} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input required className="input-field" placeholder="Client/Guardian Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="email" required className="input-field" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required className="input-field" placeholder="Age" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                <select className="input-field" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="input-field" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value as ServiceType})}>
                  {Object.values(ServiceType).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="input-field" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                  {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <textarea 
                required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 text-sm focus:outline-none" 
                placeholder="Medical history/dietary needs..."
                value={formData.healthNotes}
                onChange={e => setFormData({...formData, healthNotes: e.target.value})}
              />
              <button disabled={isLoading} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                {isLoading ? <span className="animate-pulse">AI Planning...</span> : 'Enroll for Personalized Care'}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`
        .input-field { @apply w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium text-sm transition-all; }
        .btn-primary { @apply w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-blue-700; }
      `}</style>
    </div>
  );
};

const RoleCard = ({ title, desc, icon, color, bg, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center group text-center"
  >
    <div className={`${bg} p-4 rounded-2xl mb-6 ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm">
      Get Started <ArrowRight size={16} />
    </div>
  </button>
);

export default AuthPortal;
