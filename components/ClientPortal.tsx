
import React, { useState, useMemo } from 'react';
import { Client, Staff, Transaction, Task, DailyReport, TaskStatus, TaskTiming } from '../types';
import { CalendarModule } from './StaffPortal';
import { 
  Heart, 
  CreditCard, 
  FileText, 
  LogOut, 
  Stethoscope, 
  CheckCircle, 
  Clock, 
  MapPin,
  MessageSquare,
  AlertCircle,
  Download,
  Calendar as CalendarIcon,
  ListTodo,
  User,
  History,
  Activity,
  Send,
  Users,
  Shield
} from 'lucide-react';

interface Props {
  client: Client;
  onLogout: () => void;
  staff: Staff[];
  transactions: Transaction[];
  tasks: Task[];
  reports: DailyReport[];
  setReports: React.Dispatch<React.SetStateAction<DailyReport[]>>;
}

const ClientPortal: React.FC<Props> = ({ client, onLogout, staff, transactions, tasks, reports, setReports }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [feedback, setFeedback] = useState('');
  
  const careTeam = useMemo(() => staff.filter(s => client.assignedStaffIds.includes(s.id)), [staff, client.assignedStaffIds]);
  const myTransactions = transactions.filter(t => t.relatedEntityId === client.id);

  const myTasks = useMemo(() => 
    tasks.filter(t => t.clientId === client.id && t.date === selectedDate),
  [tasks, selectedDate, client.id]);

  const myReport = useMemo(() => 
    reports.find(r => r.clientId === client.id && r.date === selectedDate && r.isFinalized),
  [reports, selectedDate, client.id]);

  const handleDownloadReport = () => {
    if (!myReport) return;
    const workerName = staff.find(s => s.id === myReport.staffId)?.name || 'Unknown Staff';
    const content = `CareBridge Hub - Shift Summary Report
Date: ${myReport.date}
Client: ${client.name}
Worker: ${workerName}
Status: ${myReport.mood || 'N/A'}
Report Summary:
${myReport.content}
---
Completed Tasks:
${myTasks.filter(t => t.status === TaskStatus.COMPLETED).map(t => `- ${t.title} [${t.timingResult || 'N/A'}] (${t.completedAt ? new Date(t.completedAt).toLocaleTimeString() : 'N/A'})`).join('\n')}
---
Client Feedback:
${myReport.clientFeedback || 'No feedback provided yet.'}
---
Agency Response:
${myReport.adminReply || 'No official agency response yet.'}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${client.name}_${selectedDate}.txt`;
    link.click();
  };

  const handleSubmitFeedback = () => {
    if (!myReport || !feedback.trim()) return;
    
    setReports(prev => prev.map(r => 
      r.id === myReport.id 
        ? { ...r, clientFeedback: feedback, clientFeedbackAt: new Date().toISOString(), adminFlagged: true } 
        : r
    ));
    setFeedback('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-2 rounded-xl"><Heart className="text-white" size={20} /></div>
          <h1 className="text-xl font-bold tracking-tight">CareBridge <span className="text-violet-600">Client</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Service: {client.status}</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> {client.state}</span>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors"><LogOut size={22} /></button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12">
        <header>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Hello, {client.name.split(' ')[0]}</h2>
          <p className="text-lg text-slate-500">Track care progress and manage your clinical strategy.</p>
        </header>

        {/* Task & Care Progress Hub */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <CalendarModule 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate} 
              tasks={tasks.filter(t => t.clientId === client.id)} 
            />
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={14} /> Assigned Care Team ({careTeam.length})
              </h4>
              <div className="space-y-4">
                {careTeam.map(member => (
                  <div key={member.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src={member.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                    <div>
                      <h5 className="text-xs font-black text-slate-900">{member.name}</h5>
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">{member.cadre}</p>
                    </div>
                  </div>
                ))}
                {careTeam.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">Assigning care professionals...</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <ListTodo className="text-blue-600" size={24} />
                  Activities for {new Date(selectedDate).toLocaleDateString()}
                </h3>
              </div>

              <div className="space-y-4">
                {myTasks.length > 0 ? myTasks.map(task => {
                  const worker = staff.find(s => s.id === task.staffId);
                  return (
                    <div key={task.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-300'}`}>
                          {task.status === TaskStatus.COMPLETED ? <CheckCircle size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{task.title}</p>
                            {task.timingResult && (
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                task.timingResult === TaskTiming.EARLY ? 'bg-blue-100 text-blue-600' :
                                task.timingResult === TaskTiming.LATE ? 'bg-amber-100 text-amber-600' :
                                'bg-emerald-100 text-emerald-600'
                              }`}>
                                {task.timingResult}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1"><User size={10} /> By {worker?.name || 'Staff'} ({worker?.cadre})</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700' : 'bg-white border text-slate-400'}`}>
                          {task.status}
                        </span>
                        {task.completedAt && (
                          <p className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1 mt-1">
                            <History size={10} /> {new Date(task.completedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <CalendarIcon size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No clinical activities recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shift Summary Display */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <Activity className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                    <Activity className="text-blue-400" size={28} /> Finalized Shift Summary
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Formal Clinical Handover Notes</p>
                </div>
                {myReport && (
                  <button 
                    onClick={handleDownloadReport}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                    title="Download Report"
                  >
                    <Download size={20} />
                  </button>
                )}
              </div>

              {myReport ? (
                <div className="space-y-6 relative z-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 italic text-slate-300 leading-relaxed">
                    "{myReport.content}"
                  </div>
                  
                  {/* Feedback Section */}
                  <div className="pt-6 border-t border-white/10">
                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <MessageSquare size={16} className="text-blue-400" /> Care Insights & Response
                    </h4>
                    
                    {/* Official Agency Response */}
                    {myReport.adminReply && (
                      <div className="p-5 bg-blue-600/10 border-l-4 border-blue-500 rounded-r-2xl mb-6 animate-in slide-in-from-left-4">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Shield size={14} /> Agency Management Response
                        </p>
                        <p className="text-sm text-blue-50 font-medium italic">"{myReport.adminReply}"</p>
                        <p className="text-[8px] text-blue-400 font-bold mt-2 uppercase">Official • {new Date(myReport.adminReplyAt!).toLocaleDateString()}</p>
                      </div>
                    )}

                    {myReport.clientFeedback ? (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Feedback</p>
                        <p className="text-sm text-slate-300">"{myReport.clientFeedback}"</p>
                        <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase">Sent {new Date(myReport.clientFeedbackAt!).toLocaleTimeString()}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="Provide feedback on today's care..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                        <button 
                          onClick={handleSubmitFeedback}
                          className="bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic py-10">No finalized shift summary has been published for this date yet. Check back once clinical audit is complete.</p>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><FileText className="text-emerald-500" size={28} /> My Health Strategy</h3>
              <div className="p-8 bg-slate-50 rounded-3xl text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {client.carePlan || "Finalizing your personalized strategy..."}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <CreditCard className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
              <h3 className="text-xl font-bold mb-8">Financial Overview</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Unpaid Balance</p>
                  <p className="text-4xl font-black">₦{client.balance?.toLocaleString() || '0'}</p>
                </div>
                {client.balance === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle size={16} /> All accounts cleared
                  </div>
                ) : (
                  <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-extrabold hover:bg-slate-100 transition-all">Settle Dues Now</button>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;
