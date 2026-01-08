
import React, { useState, useEffect, useCallback } from 'react';
import { AppStatus, DailyReport } from './types';
import { generateResearchReport } from './services/geminiService';
import LoadingState from './components/LoadingState';
import ReportView from './components/ReportView';

const CACHE_KEY = 'ON_DEVICE_AI_REPORT_CACHE';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (forceRefresh = false) => {
    try {
      setStatus(AppStatus.SEARCHING);
      setError(null);

      // Simple cache check to avoid redundant API calls on the same day
      const cached = localStorage.getItem(CACHE_KEY);
      const todayStr = new Date().toISOString().split('T')[0];
      
      if (!forceRefresh && cached) {
        const parsedCache = JSON.parse(cached) as DailyReport;
        if (parsedCache.date === todayStr) {
          setReport(parsedCache);
          setStatus(AppStatus.COMPLETED);
          return;
        }
      }

      // Generate new report
      setStatus(AppStatus.ANALYZING);
      const newReport = await generateResearchReport();
      
      setReport(newReport);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newReport));
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "리포트를 생성하는 중 오류가 발생했습니다.");
      setStatus(AppStatus.ERROR);
    }
  }, []);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">On-Device AI Research Radar</h1>
          </div>
          <button 
            onClick={() => fetchReport(true)}
            disabled={status === AppStatus.SEARCHING || status === AppStatus.ANALYZING}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {status === AppStatus.SEARCHING || status === AppStatus.ANALYZING ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                분석 중...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                수동 갱신
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {status === AppStatus.ERROR && (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4 text-2xl">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">리포트를 불러올 수 없습니다</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button 
              onClick={() => fetchReport(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {(status === AppStatus.SEARCHING || status === AppStatus.ANALYZING) && (
          <LoadingState status={status} />
        )}

        {status === AppStatus.COMPLETED && report && (
          <ReportView report={report} />
        )}

        {status === AppStatus.IDLE && !report && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-800">최신 연구 리포트를 준비 중입니다...</h2>
          </div>
        )}
      </main>

      {/* Persistent Info / Banner */}
      <aside className="fixed bottom-6 right-6 z-50">
        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs animate-bounce-short">
          <div className="p-2 bg-white/20 rounded-lg">🤖</div>
          <div className="text-xs">
            <p className="font-bold">매일 한 번 자동 업데이트</p>
            <p className="opacity-80">온디바이스 최신 기술을 놓치지 마세요.</p>
          </div>
        </div>
      </aside>
      
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short {
          animation: bounce-short 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
