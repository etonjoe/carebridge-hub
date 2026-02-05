
import React, { useState } from 'react';
import { DailyReport, Staff, Client } from '../types';
import { FileText, MessageSquare, AlertCircle, CheckCircle, Search, Filter, MapPin, User, Clock, ShieldCheck, Send, X, Shield } from 'lucide-react';

interface Props {
  reports: DailyReport[];
  staff: Staff[];
  clients: Client[];
  setReports: React.Dispatch<React.SetStateAction<DailyReport[]>>;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

const ClientReportingView: React.FC<Props> = ({ reports, staff, clients, setReports, addNotification }) => {
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleAcknowledgeFlag = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, adminFlagged: false } : r));
    addNotification('Acknowledge', 'Feedback has been reviewed and cleared.', 'success');
  };

  const handleSendReply = (reportId: string) => {
    const text = replyText[reportId];
    if (!text?.trim()) return;

    setReports(prev => prev.map(r => 
      r.id === reportId 
        ? { 
            ...r, 
            adminReply: text, 
            adminReplyAt: new Date().toISOString(), 
            adminFlagged: false 
          } 
        : r
    ));
    
    setReplyText(prev => {
      const updated = { ...prev };
      delete updated[reportId];
      return updated;
    });

    addNotification('Reply Sent', 'Your response has been published to the client portal.', 'success');
  };

  const getStaff = (id: string) => staff.find(s => s.id === id);
  const getClient = (id: string) => clients.find(c => c.id === id);

  const flaggedReports = reports.filter(r => r.adminFlagged);
  const finalizedReports = reports.filter(r => r.isFinalized).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Flagged Feedback Header */}
      {flaggedReports.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[2.5rem] shadow-lg shadow-rose-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-600 p-2 rounded-xl">
              <AlertCircle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-rose-900">Immediate Clinical Oversight Required</h3>
              <p className="text-sm font-bold text-rose-700 opacity-80 uppercase tracking-widest">Feedback from families flagging shift reports</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flaggedReports.map(report => {
              const client = getClient(report.clientId);
              const worker = getStaff(report.staffId);
              return (
                <div key={report.id} className="bg-white p-6 rounded-[2rem] border border-rose-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center font-bold text-rose-600">
                        {client?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{client?.name}</p>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Worker: {worker?.name}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-rose-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter animate-pulse">Flagged Insight</span>
                  </div>
                  <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 italic text-sm text-rose-900 mb-6">
                    "{report.clientFeedback}"
                  </div>
                  
                  {/* Quick Reply Box */}
                  <div className="space-y-3 mb-4">
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none resize-none font-medium"
                      placeholder="Type your official agency response..."
                      value={replyText[report.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [report.id]: e.target.value })}
                    />
                  </div>

                  <div className="mt-auto flex gap-3">
                    <button 
                      onClick={() => handleAcknowledgeFlag(report.id)}
                      className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Acknowledge Only
                    </button>
                    <button 
                      onClick={() => handleSendReply(report.id)}
                      disabled={!replyText[report.id]?.trim()}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50"
                    >
                      Send Agency Response
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Reporting Feed */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl">
              <FileText className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Clinical Audit Trail</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100">
              {finalizedReports.length} Handover Reports Published
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {finalizedReports.map(report => {
            const client = getClient(report.clientId);
            const worker = getStaff(report.staffId);
            return (
              <div key={report.id} className="p-8 group hover:bg-slate-50/50 transition-all">
                <div className="flex flex-col lg:flex-row gap-8">
                   <div className="lg:w-1/4">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center font-bold text-blue-600 shadow-sm">
                          {client?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-md font-black text-slate-900">{client?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {client?.state} State
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Shift Worker</p>
                        <div className="flex items-center gap-3">
                           <img src={worker?.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="" />
                           <div>
                             <p className="text-xs font-bold text-slate-900">{worker?.name}</p>
                             <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">{worker?.cadre}</p>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="lg:w-3/4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            {report.date}
                          </span>
                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                            <ShieldCheck size={10} /> Clinical Audit Passed
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-300 uppercase">Received {new Date(report.submittedAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group-hover:border-blue-200 transition-colors">
                        <div className="absolute top-0 right-0 p-4">
                          <FileText size={40} className="text-slate-50" />
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed italic relative z-10 whitespace-pre-wrap">
                          "{report.content}"
                        </p>
                      </div>

                      {/* Client Feedback Display */}
                      {report.clientFeedback && (
                         <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${report.adminFlagged ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex gap-4 items-start">
                              <MessageSquare className={report.adminFlagged ? 'text-rose-400' : 'text-slate-400'} size={20} />
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Family Response</p>
                                <p className="text-sm font-medium text-slate-700 italic">"{report.clientFeedback}"</p>
                              </div>
                              {report.adminFlagged && (
                                <button 
                                  onClick={() => handleAcknowledgeFlag(report.id)}
                                  className="p-2 bg-white rounded-xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                            </div>

                            {/* Agency Reply Area */}
                            {report.adminReply ? (
                              <div className="bg-white p-4 rounded-2xl border border-slate-200 ml-8 animate-in slide-in-from-left-2">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                  <Shield size={12} /> Agency Response
                                </p>
                                <p className="text-xs text-slate-600 font-medium">"{report.adminReply}"</p>
                                <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Published {new Date(report.adminReplyAt!).toLocaleDateString()}</p>
                              </div>
                            ) : (
                              <div className="flex gap-2 ml-8">
                                <input 
                                  type="text"
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                  placeholder="Reply to family feedback..."
                                  value={replyText[report.id] || ''}
                                  onChange={(e) => setReplyText({ ...replyText, [report.id]: e.target.value })}
                                />
                                <button 
                                  onClick={() => handleSendReply(report.id)}
                                  disabled={!replyText[report.id]?.trim()}
                                  className="bg-slate-900 text-white p-2 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                                >
                                  <Send size={14} />
                                </button>
                              </div>
                            )}
                         </div>
                      )}
                   </div>
                </div>
              </div>
            );
          })}

          {finalizedReports.length === 0 && (
            <div className="p-32 text-center opacity-30 flex flex-col items-center">
              <FileText size={64} className="text-slate-200 mb-6" />
              <p className="text-lg font-black text-slate-400 uppercase tracking-[0.2em]">No Reports Published Yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientReportingView;
