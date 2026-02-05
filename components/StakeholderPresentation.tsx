
import React from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Users, 
  TrendingUp,
  Cpu,
  HeartPulse,
  Download,
  CheckCircle,
  BarChart3,
  MapPin,
  Stethoscope
} from 'lucide-react';

const StakeholderPresentation: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const slides = [
    {
      title: "CareBridge Hub: Nigeria's Home Care Future",
      subtitle: "The Intelligent Workforce & Care Strategy Engine",
      icon: <Globe className="w-20 h-20 text-blue-600" />,
      tag: "EXECUTIVE BRIEFING 2024",
      content: "Bridging the gap between 300,000+ medical professionals and the surging demand for quality home-based clinical care in Nigeria.",
      points: [
        "Nationwide Digital Infrastructure: Serving all 36 States + FCT.",
        "Verified Clinical Workforce: Real-time MDCN and NMCN vetting.",
        "Scalable Healthcare: Lowering costs while improving patient outcomes."
      ]
    },
    {
      title: "The Problem: Trust & Quality",
      subtitle: "Fragmentation in the Nigerian private care sector",
      icon: <ShieldCheck className="w-20 h-20 text-red-500" />,
      tag: "MARKET REALITY",
      content: "Current home-care models in Nigeria are manual, slow, and often rely on unverified staff, posing significant risks to families and clinical quality.",
      points: [
        "Manual Vetting Delays: Staff verification usually takes 14+ days.",
        "Assignment Mismatch: Lack of intelligent cadre-to-patient matching logic.",
        "Clinical Inconsistency: Absence of standardized, dynamic care planning."
      ]
    },
    {
      title: "Our Solution: Unified Portal",
      subtitle: "Portals for Admins, Staff, and Clients",
      icon: <Users className="w-20 h-20 text-emerald-600" />,
      tag: "THE ECOSYSTEM",
      content: "A centralized platform that streamlines the entire lifecycle: Onboarding -> Verification -> Training -> Assignment -> Care.",
      points: [
        "Health Professionals: Mobile-first portal for license upload and shadowing.",
        "Families: Transparent access to care plans and verified professionals.",
        "Agency Admins: Global dashboard for regional oversight and pricing."
      ]
    },
    {
      title: "AI-Powered Clinical Excellence",
      subtitle: "Gemini Pro Clinical Reasoning",
      icon: <Cpu className="w-20 h-20 text-violet-600" />,
      tag: "TECHNOLOGY EDGE",
      content: "Proprietary AI integration that generates clinical plans localized for the Nigerian context (dietary, environmental, and cultural).",
      points: [
        "Localized Care Plans: Gemini assessment of local health stressors.",
        "Automated Compliance: Instant auditing of MDCN/NMCN registrations.",
        "Dynamic Scheduling: Protocols that adapt to patient progress in real-time."
      ]
    },
    {
      title: "Strategic Growth & ROI",
      subtitle: "Scaling a lean healthcare empire",
      icon: <TrendingUp className="w-20 h-20 text-amber-600" />,
      tag: "THE BUSINESS CASE",
      content: "CareBridge Hub transforms healthcare from a service to a scalable platform with 28% average agency margins.",
      points: [
        "Asset-Light Expansion: Scaling state-by-state without physical clinics.",
        "Operational Automation: 80% reduction in staffing paperwork costs.",
        "Market Dominance: Positioning as the #1 verified care network in West Africa."
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans p-0 m-0 print:bg-white">
      {/* Print Trigger Button - Hidden during actual print */}
      <div className="no-print fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        <p className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">Stand-Alone Mode</p>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-blue-700 transition-all active:scale-95 border-2 border-white/20"
        >
          <Download size={20} />
          Export Executive PDF
        </button>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-8">
        {slides.map((s, idx) => (
          <div key={idx} className="print-break min-h-[95vh] flex flex-col justify-center border-b border-slate-100 last:border-0 pb-20 relative">
            <div className="flex items-center gap-4 mb-12">
              <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
                {s.tag}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div>
                  <h2 className="text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                    {s.title}
                  </h2>
                  <p className="text-2xl text-blue-600 font-bold italic">
                    {s.subtitle}
                  </p>
                </div>
                
                <div className="p-8 bg-slate-50 rounded-3xl border-l-8 border-blue-600">
                  <p className="text-xl text-slate-700 font-semibold leading-relaxed">
                    "{s.content}"
                  </p>
                </div>

                <ul className="space-y-6">
                  {s.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-1.5 shrink-0 bg-emerald-100 p-1 rounded-full">
                        <CheckCircle className="text-emerald-600" size={20} />
                      </div>
                      <p className="text-lg text-slate-600 font-medium leading-relaxed">
                        {p}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden lg:flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[4rem] border border-slate-100 shadow-inner h-full min-h-[600px] relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_#3b82f60d_0%,_transparent_50%)]" />
                <div className="relative z-10 transition-all duration-1000 transform hover:scale-110">
                  {s.icon}
                </div>
                <div className="mt-16 space-y-4 text-center">
                   <div className="flex justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <div className="w-2 h-2 rounded-full bg-blue-200" />
                   </div>
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Pillar {idx + 1}</p>
                </div>
              </div>
            </div>
            
            <footer className="mt-auto pt-12 flex justify-between items-center text-slate-300 font-bold text-[10px] tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <HeartPulse size={14} className="text-blue-600" />
                <span>CareBridge Hub | Executive Intelligence</span>
              </div>
              <span>Page {idx + 1} of {slides.length}</span>
            </footer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakeholderPresentation;
