
import React from 'react';
import { DailyReport } from '../types';

interface ReportViewProps {
  report: DailyReport;
  apiCount: number;
}

const isRecent = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  } catch (e) {
    return false;
  }
};

const formatTimestamp = (ts: number) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(ts));
};

const getLinkLabel = (url: string) => {
  if (url.includes('arxiv.org')) return 'Arxiv에서 읽기';
  if (url.includes('huggingface.co')) return 'HF에서 확인';
  if (url.includes('github.com')) return 'GitHub 저장소';
  if (url.includes('reddit.com')) return 'Reddit 스레드';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'X(Twitter) 게시물';
  return '상세 보기';
};

const ReportView: React.FC<ReportViewProps> = ({ report, apiCount }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Global Shared</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Verified Content</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">On-Device AI Radar</h2>
          <p className="text-slate-500 text-sm mt-1 italic font-medium">System SW, Compilers, & Model Compression Insights</p>
        </div>
        <div className="text-left md:text-right space-y-1">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Sync Timestamp</div>
          <div className="text-slate-900 font-black text-lg">{formatTimestamp(report.generatedAt)}</div>
          <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg inline-block">전 세계 공통 리포트</div>
        </div>
      </div>

      {/* Top Papers List */}
      <section>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">핵심 연구 인텔리전스 ({report.topPapers.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {report.topPapers.map((paper, idx) => {
            const recent = isRecent(paper.updatedDate);
            const isArxiv = paper.url?.includes('arxiv.org');
            return (
              <div key={idx} className={`bg-white p-7 rounded-[2rem] shadow-sm border ${recent ? 'border-amber-200 ring-4 ring-amber-50' : 'border-slate-100'} flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group`}>
                {recent && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm z-10">
                    Latest
                  </div>
                )}
                
                <h4 className="font-black text-xl text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors pr-6">{paper.title}</h4>
                
                <div className="mb-6 flex items-center gap-2">
                   <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">
                    {paper.updatedDate}
                  </span>
                  {isArxiv && (
                    <span className="text-[10px] font-black bg-red-50 text-red-600 px-3 py-1 rounded-full uppercase">Arxiv</span>
                  )}
                </div>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest block mb-2">연구 요약</span>
                    <p className="text-slate-600 text-sm leading-relaxed">{paper.summary}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest block mb-2">기술적 차별점</span>
                    <p className="text-slate-700 text-sm font-medium italic border-l-4 border-emerald-100 pl-3">"{paper.difference}"</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-black uppercase text-purple-600 tracking-widest">글로벌 커뮤니티 동향</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{paper.communityReaction}</p>
                  </div>
                </div>
                
                <div className="pt-6 mt-auto flex items-center justify-between border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                    Rel: {paper.relevance}
                  </span>
                  {paper.url && (
                    <a 
                      href={paper.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-white bg-slate-900 px-5 py-2.5 rounded-2xl font-bold transition-all hover:bg-blue-600 shadow-lg shadow-slate-100 flex items-center gap-2"
                    >
                      {getLinkLabel(paper.url)}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl overflow-hidden relative group">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <span className="px-5 py-1.5 bg-blue-600 rounded-full text-[11px] font-black tracking-[0.2em] uppercase">Tech Deep Dive</span>
            {report.deepDive.url && (
              <a href={report.deepDive.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-300 hover:text-white transition-colors">Original Research →</a>
            )}
          </div>
          
          <h3 className="text-4xl md:text-5xl font-black mb-12 leading-tight tracking-tighter max-w-4xl">{report.deepDive.title}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h4 className="text-blue-400 font-black text-sm uppercase tracking-widest mb-4">Innovation Focus</h4>
                <p className="text-slate-200 leading-relaxed text-xl font-medium">{report.deepDive.keyInnovation}</p>
              </div>
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                <h4 className="text-blue-400 font-black text-sm uppercase tracking-widest mb-4">Detailed Analysis</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">{report.deepDive.detailedAnalysis}</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="p-7 bg-white/5 rounded-3xl border border-white/5">
                <h4 className="text-emerald-400 font-black text-xs uppercase mb-4 tracking-widest">Historical Context</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{report.deepDive.historicalContext}</p>
              </div>
              <div className="p-7 bg-indigo-600/20 rounded-3xl border border-indigo-500/30">
                <h4 className="text-amber-400 font-black text-xs uppercase mb-4 tracking-widest">Practical Implication</h4>
                <p className="text-slate-200 text-sm leading-relaxed font-bold italic">"{report.deepDive.practicalImplication}"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Influencer Mentions Section */}
      <section className="bg-indigo-50 border border-indigo-100 rounded-[3rem] p-10 md:p-14 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
            <div>
              <h3 className="text-3xl font-black text-indigo-900 tracking-tight">Expert Insights</h3>
              <p className="text-indigo-600 text-xs font-black uppercase tracking-[0.2em] mt-1">Big Tech Researchers & Influencers</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {report.influencerMentions.map((mention, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                    {mention.influencerName[0]}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-lg">{mention.influencerName}</div>
                    <div className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{mention.role}</div>
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-slate-900 mb-4 leading-tight">{mention.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">{mention.summary}</p>
                
                <div className="flex justify-between items-center pt-6 border-t border-indigo-50">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{mention.date}</span>
                  {mention.url && (
                    <a href={mention.url} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-indigo-600 flex items-center gap-1 hover:underline">
                      Link View
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /></svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="text-center space-y-6 pt-16 pb-12 border-t border-slate-200">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Cumulative Insights Generated</span>
            <span className="text-lg font-black text-blue-600">{apiCount.toLocaleString()}</span>
          </div>
          <p className="text-slate-400 text-[10px] font-medium italic max-w-lg mx-auto leading-relaxed">
            전 세계 사용자를 위해 수행된 Gemini AI 리서치 세션 누적 횟수입니다. <br/>
            모든 데이터는 백엔드 공유 저장소에 안전하게 동기화됩니다.
          </p>
        </div>
        
        <div className="flex justify-center gap-6 text-[10px] text-slate-300 uppercase tracking-[0.3em] font-black">
           <span>Global Research Sync v2.0</span>
           <span>•</span>
           <span>Shared Radar</span>
           <span>•</span>
           <span>On-Device AI Community</span>
        </div>
      </footer>
    </div>
  );
};

export default ReportView;
