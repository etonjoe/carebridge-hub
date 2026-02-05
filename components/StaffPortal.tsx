
import React, { useState, useMemo, useEffect } from 'react';
import { Staff, Client, StaffStatus, Timesheet, Task, TaskStatus, TaskTiming, DailyReport } from '../types';
import { generateShiftSummary } from '../geminiService';
import { 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  Clock, 
  Calendar as CalendarIcon, 
  MapPin, 
  FileText,
  Wallet,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Copy,
  MessageSquare,
  History,
  X,
  Sparkles,
  Send,
  Activity,
  AlertCircle,
  Users,
  ChevronDown,
  Stethoscope
} from 'lucide-react';

interface Props {
  staffMember: Staff;
  onLogout: () => void;
  clients: Client[];
  timesheets: Timesheet[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  reports: DailyReport[];
  setReports: React.Dispatch<React.SetStateAction<DailyReport[]>>;
}

const StaffPortal: React.FC<Props> = ({ staffMember, onLogout, clients, timesheets, tasks, setTasks, reports, setReports }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'earnings'>('schedule');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [targetCopyDate, setTargetCopyDate] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const assignedClients = useMemo(() => 
    clients.filter(c => c.assignedStaffIds.includes(staffMember.id)), 
  [clients, staffMember.id]);

  // Set default client if none selected
  useEffect(() => {
    if (!selectedClientId && assignedClients.length > 0) {
      setSelectedClientId(assignedClients[0].id);
    }
  }, [assignedClients, selectedClientId]);

  const activeClient = useMemo(() => 
    assignedClients.find(c => c.id === selectedClientId), 
  [assignedClients, selectedClientId]);

  const myTimesheets = timesheets.filter(ts => ts.staffId === staffMember.id);
  const currentMonthStats = myTimesheets[myTimesheets.length - 1] || { hoursWorked: 0, totalEarnings: 0, payoutStatus: 'Pending' };

  const selectedTasks = useMemo(() => 
    tasks.filter(t => t.date === selectedDate && t.staffId === staffMember.id && (selectedClientId ? t.clientId === selectedClientId : true)),
  [tasks, selectedDate, staffMember.id, selectedClientId]);

  const currentReports = useMemo(() => 
    reports.filter(r => r.date === selectedDate && r.staffId === staffMember.id && (selectedClientId ? r.clientId === selectedClientId : true)),
  [reports, selectedDate, staffMember.id, selectedClientId]);

  const calculateTiming = (scheduledTimeStr: string, completedAtIso: string): TaskTiming => {
    const [schedH, schedM] = scheduledTimeStr.split(':').map(Number);
    const completedDate = new Date(completedAtIso);
    const compH = completedDate.getHours();
    const compM = completedDate.getMinutes();

    const schedTotal = schedH * 60 + schedM;
    const compTotal = compH * 60 + compM;

    const diff = compTotal - schedTotal; // minutes difference

    if (diff < -15) return TaskTiming.EARLY;
    if (diff > 15) return TaskTiming.LATE;
    return TaskTiming.ON_TIME;
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isCompleting = newStatus === TaskStatus.COMPLETED;
        const now = new Date().toISOString();
        return { 
          ...t, 
          status: newStatus,
          completedAt: isCompleting ? now : t.completedAt,
          timingResult: isCompleting ? calculateTiming(t.time, now) : t.timingResult
        };
      }
      return t;
    }));
  };

  const updateTaskComment = (taskId: string, comment: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: comment } : t));
  };

  const handleCopyTasks = () => {
    if (!targetCopyDate) return;

    const tasksToCopy = selectedTasks.map(t => ({
      ...t,
      id: `t-copy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: targetCopyDate,
      status: TaskStatus.YET_TO_START,
      completedAt: undefined,
      timingResult: undefined,
      comments: ''
    }));

    setTasks(prev => [...prev, ...tasksToCopy]);
    setIsCopyModalOpen(false);
    setTargetCopyDate('');
    setSelectedDate(targetCopyDate);
  };

  const handleAISummary = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    setIsGeneratingSummary(true);
    const clientTasks = selectedTasks.filter(t => t.clientId === clientId);
    const summary = await generateShiftSummary(staffMember.name, client.name, clientTasks);
    
    const existingReport = currentReports.find(r => r.clientId === clientId);
    if (existingReport) {
      setReports(prev => prev.map(r => r.id === existingReport.id ? { ...r, content: summary } : r));
    } else {
      const newReport: DailyReport = {
        id: `r-${Date.now()}`,
        staffId: staffMember.id,
        clientId,
        date: selectedDate,
        content: summary,
        submittedAt: new Date().toISOString(),
        isFinalized: false,
        mood: 'good'
      };
      setReports(prev => [...prev, newReport]);
    }
    setIsGeneratingSummary(false);
  };

  const updateReportContent = (clientId: string, content: string) => {
    const existingReport = currentReports.find(r => r.clientId === clientId);
    if (existingReport) {
      setReports(prev => prev.map(r => r.id === existingReport.id ? { ...r, content } : r));
    } else {
      const newReport: DailyReport = {
        id: `r-${Date.now()}`,
        staffId: staffMember.id,
        clientId,
        date: selectedDate,
        content,
        submittedAt: new Date().toISOString(),
        isFinalized: false
      };
      setReports(prev => [...prev, newReport]);
    }
  };

  const handleFinalizeReport = (clientId: string) => {
    const report = currentReports.find(r => r.clientId === clientId);
    if (!report) return;

    setReports(prev => prev.map(r => r.id === report.id ? { ...r, isFinalized: true, submittedAt: new Date().toISOString() } : r));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-8 flex flex-col h-full md:h-screen sticky top-0">
        <div className="mb-10 text-center">
          <div className="relative inline-block mb-4">
            <img 
              src={staffMember.avatar} 
              className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl mx-auto" 
              alt={staffMember.name} 
            />
            {staffMember.verified && (
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                <ShieldCheck size={16} />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{staffMember.name}</h2>
          <p className="text-sm font-semibold text-blue-600 mb-2">{staffMember.cadre}</p>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            <MapPin size={12} /> {staffMember.state} State
          </div>
        </div>

        <nav className="space-y-2 flex-1">
           <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             <CalendarIcon size={18} /> Daily Schedule
           </button>
           <button 
            onClick={() => setActiveTab('earnings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'earnings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             <Wallet size={18} /> Financials
           </button>
        </nav>

        <div className="mt-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Assigned Patients</p>
            <div className="space-y-2">
              {assignedClients.map(client => (
                <button 
                  key={client.id}
                  onClick={() => { setSelectedClientId(client.id); setActiveTab('schedule'); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedClientId === client.id ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedClientId === client.id ? 'bg-white/20' : 'bg-white'}`}>
                    {client.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold truncate">{client.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
        </div>

        <button 
          onClick={onLogout}
          className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold rounded-xl transition-all border border-slate-100"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Patient Selection Bar (Mobile/Tablet specific if needed, but useful as a primary header) */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <Users className="text-blue-600" size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-900">
                  {activeTab === 'schedule' ? (activeClient ? `Care: ${activeClient.name}` : 'Select Patient') : 'Earnings Overview'}
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                  {activeTab === 'schedule' ? 'Manage clinical duties and reports for this patient.' : 'Real-time financial status.'}
                </p>
             </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <CalendarIcon className="text-blue-600" size={20} />
              <span className="text-sm font-bold">{new Date(selectedDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {activeTab === 'schedule' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Horizontal Patient Switcher if staff has many */}
            {assignedClients.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {assignedClients.map(client => (
                  <button 
                    key={`tab-${client.id}`}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${selectedClientId === client.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                  >
                    {client.name}
                  </button>
                ))}
              </div>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <CalendarModule 
                  selectedDate={selectedDate} 
                  onDateChange={setSelectedDate} 
                  tasks={tasks.filter(t => t.staffId === staffMember.id && (selectedClientId ? t.clientId === selectedClientId : true))}
                />
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[500px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -z-0 opacity-50" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-xl">
                          <ListTodo className="text-blue-600" size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">
                          Duty Roster
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        {selectedTasks.length > 0 && (
                          <button 
                            onClick={() => setIsCopyModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200"
                          >
                            <Copy size={14} /> Duplicate
                          </button>
                        )}
                        <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          {selectedTasks.length} Entries
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {selectedTasks.length > 0 ? selectedTasks.map(task => (
                        <div key={task.id} className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all group">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-200 shadow-sm group-hover:border-blue-200 transition-colors">
                                <Clock size={16} className="text-blue-600 mb-1" />
                                <span className="text-[10px] font-black text-slate-900">{task.time}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-md font-black text-slate-900">{task.title}</h4>
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
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  Type: Clinical Intervention
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <select 
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                                className={`appearance-none px-4 py-2 pr-8 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                                  task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                  task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                  task.status === TaskStatus.STARTED ? 'bg-violet-50 border-violet-100 text-violet-600' :
                                  task.status === TaskStatus.PENDING ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                  'bg-white border-slate-200 text-slate-400'
                                }`}
                              >
                                <option value={TaskStatus.YET_TO_START}>Yet to Start</option>
                                <option value={TaskStatus.STARTED}>Started</option>
                                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                                <option value={TaskStatus.PENDING}>Pending</option>
                                <option value={TaskStatus.COMPLETED}>Completed</option>
                              </select>
                              {task.completedAt && (
                                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                  <CheckCircle size={10} /> Finished {new Date(task.completedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-600 leading-relaxed italic mb-4">"{task.description}"</p>

                          <div className="bg-white p-4 rounded-2xl border border-slate-200 focus-within:border-blue-200 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                               <MessageSquare size={14} className="text-blue-500" />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observations / Comments</span>
                            </div>
                            <textarea 
                              className="w-full bg-slate-50 border-0 text-sm p-3 rounded-xl focus:ring-0 focus:outline-none resize-none min-h-[80px] font-medium placeholder:text-slate-300"
                              placeholder="Clinical notes for this activity..."
                              value={task.comments || ''}
                              onChange={(e) => updateTaskComment(task.id, e.target.value)}
                            />
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                          <CalendarIcon size={48} className="text-slate-300 mb-4" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No assigned entries for this patient today</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Shift Summary Module */}
            {activeClient && selectedTasks.length > 0 && (
              <section className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-50 rounded-full -z-0 opacity-30" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-200">
                          <Stethoscope className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">Patient Daily Summary</h3>
                          <p className="text-sm font-bold text-slate-500">Formal Clinical Handover for {activeClient.name}</p>
                        </div>
                      </div>
                      
                      {currentReports[0]?.isFinalized ? (
                        <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                          <ShieldCheck size={18} /> Finalized & Published
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAISummary(activeClient.id)}
                          disabled={isGeneratingSummary}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
                        >
                          {isGeneratingSummary ? <Clock size={16} className="animate-spin" /> : <Sparkles size={16} className="text-blue-200" />}
                          {isGeneratingSummary ? 'Synthesizing...' : 'AI Clinical Assistant'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 focus-within:border-blue-200 transition-colors">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                          Comprehensive Clinical Evaluation
                        </label>
                        <textarea 
                          disabled={currentReports[0]?.isFinalized}
                          className="w-full bg-transparent border-0 text-sm font-medium leading-relaxed min-h-[200px] focus:outline-none resize-none placeholder:text-slate-300 disabled:opacity-70"
                          placeholder="Summarize patient stability, vital signs, and shift outcomes..."
                          value={currentReports[0]?.content || ''}
                          onChange={(e) => updateReportContent(activeClient.id, e.target.value)}
                        />
                      </div>

                      {currentReports[0]?.clientFeedback && (
                        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 animate-in zoom-in-95">
                           <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <MessageSquare size={14} /> Caretaker / Family Response
                           </h4>
                           <p className="text-sm text-amber-900 font-medium italic">"{currentReports[0].clientFeedback}"</p>
                           <p className="text-[9px] text-amber-400 mt-2 font-bold uppercase tracking-tight">Timestamp: {new Date(currentReports[0].clientFeedbackAt!).toLocaleTimeString()}</p>
                        </div>
                      )}

                      {!currentReports[0]?.isFinalized && currentReports[0]?.content && (
                        <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-4">
                          <button 
                            onClick={() => handleFinalizeReport(activeClient.id)}
                            className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2"
                          >
                            <Send size={18} /> Submit to Admin Panel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          <section className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <Wallet className="absolute -right-10 -bottom-10 w-40 h-40 text-blue-50 opacity-50" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Financial Status ({currentMonthStats.month})</p>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">Hours Registered</p>
                        <p className="text-5xl font-black text-slate-900">{currentMonthStats.hoursWorked}</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 mb-1">Estimated Payout</p>
                      <p className="text-4xl font-black text-blue-600">₦{currentMonthStats.totalEarnings.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${currentMonthStats.payoutStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      <CheckCircle size={20} />
                      <span className="text-sm font-bold uppercase tracking-widest">Status: {currentMonthStats.payoutStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Copy Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Roster Duplication</h3>
                <button onClick={() => setIsCopyModalOpen(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-6">Duplicate {selectedTasks.length} clinical tasks for {activeClient?.name} to a future date.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Date</label>
                  <input 
                    type="date"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold"
                    value={targetCopyDate}
                    onChange={(e) => setTargetCopyDate(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleCopyTasks}
                  disabled={!targetCopyDate}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all disabled:opacity-50"
                > Confirm & Schedule </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export const CalendarModule = ({ selectedDate, onDateChange, tasks }: { selectedDate: string, onDateChange: (d: string) => void, tasks: Task[] }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const days = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-black text-slate-900">
          {viewDate.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 transition-all text-slate-400"><ChevronLeft size={20} /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 transition-all text-slate-400"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          const hasTasks = tasks.some(t => t.date === dateStr);

          return (
            <button
              key={day}
              onClick={() => onDateChange(dateStr)}
              className={`relative h-14 w-full flex flex-col items-center justify-center rounded-2xl font-bold transition-all border ${
                isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 z-10' : 
                isToday ? 'bg-white border-blue-100 text-blue-600 shadow-sm' : 
                'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-100'
              }`}
            >
              <span className="text-sm">{day}</span>
              {hasTasks && <div className={`mt-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600 animate-pulse'}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StatusBadge = ({ label, active, icon }: { label: string; active: boolean; icon: React.ReactNode }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
    active ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
  }`}>
    <div className="flex items-center gap-3">{icon}<span className="text-xs font-bold">{label}</span></div>
    {active ? <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" /> : <Clock size={14} />}
  </div>
);

export default StaffPortal;
