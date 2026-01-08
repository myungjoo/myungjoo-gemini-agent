
import React from 'react';
import { DailyReport, PaperSummary } from '../types';

interface ReportViewProps {
  report: DailyReport;
}

const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header Info */}
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">오늘의 온디바이스 AI 리서치</h2>
          <p className="text-slate-500 mt-1">Hugging Face 및 학계 최신 트렌드 리포트</p>
        </div>
        <div className="text-right">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            발행일: {report.date}
          </span>
        </div>
      </div>

      {/* Top Papers List */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
          <h3 className="text-2xl font-bold text-slate-800">주요 연구 및 프로젝트 ({report.topPapers.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.topPapers.map((paper, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h4 className="font-bold text-lg text-slate-900 mb-3 leading-tight">{paper.title}</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase text-blue-500 block mb-1">핵심 요약</span>
                  <p className="text-slate-600 text-sm leading-relaxed">{paper.summary}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-500 block mb-1">기존 연구와의 차별점</span>
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{paper.difference}"</p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center text-xs font-medium text-slate-400">
                    중요도: {paper.relevance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="inline-block px-4 py-1 bg-blue-500 rounded-full text-xs font-bold mb-6 tracking-widest uppercase">
            Special Deep Dive
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold mb-8 leading-tight">{report.deepDive.title}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h4 className="text-blue-400 font-bold text-lg mb-3">혁신 포인트 (Innovation)</h4>
                <p className="text-slate-300 leading-relaxed text-lg">{report.deepDive.keyInnovation}</p>
              </div>
              <div>
                <h4 className="text-blue-400 font-bold text-lg mb-3">상세 분석 (Detailed Analysis)</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.deepDive.detailedAnalysis}</p>
              </div>
            </div>
            
            <div className="space-y-8 bg-white/5 p-6 rounded-2xl backdrop-blur-sm">
              <div>
                <h4 className="text-emerald-400 font-bold text-sm uppercase mb-3">연구 맥락 (Context)</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{report.deepDive.historicalContext}</p>
              </div>
              <hr className="border-white/10" />
              <div>
                <h4 className="text-amber-400 font-bold text-sm uppercase mb-3">실질적 시사점 (Implication)</h4>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">{report.deepDive.practicalImplication}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="text-center text-slate-400 text-sm pt-8">
        이 리서치 리포트는 Gemini 3 Pro를 통해 Hugging Face의 실시간 데이터를 분석하여 자동 생성되었습니다.
      </footer>
    </div>
  );
};

export default ReportView;
