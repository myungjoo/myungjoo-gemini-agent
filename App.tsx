
import React, { useState, useEffect, useCallback } from 'react';
import { AppStatus, DailyReport } from './types';
import { generateResearchReport } from './services/geminiService';
import { GlobalStorage } from './services/storageService';
import LoadingState from './components/LoadingState';
import ReportView from './components/ReportView';

const CACHE_PREFIX = 'RESEARCH_REPORT_';
const INDEX_KEY = 'RESEARCH_REPORT_INDEX';
const ADMIN_PASSWORD = "mzxthebabot";

const getLastGenerationBoundary = (now: Date): string => {
  const boundary = new Date(now);
  boundary.setHours(2, 0, 0, 0);
  if (now.getTime() < boundary.getTime()) {
    boundary.setDate(boundary.getDate() - 1);
  }
  return boundary.toISOString().split('T')[0];
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiCount, setApiCount] = useState<number>(0);
  
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState<number>(-1);

  const syncMetadata = useCallback(async () => {
    // Sync indices
    const localSaved = localStorage.getItem(INDEX_KEY);
    const localDates = localSaved ? JSON.parse(localSaved) as string[] : [];
    const globalDates = await GlobalStorage.getGlobalIndex();
    const merged = Array.from(new Set([...localDates, ...globalDates])).sort((a, b) => b.localeCompare(a));
    setAvailableDates(merged);
    localStorage.setItem(INDEX_KEY, JSON.stringify(merged));

    // Sync API count
    const count = await GlobalStorage.getCallCount();
    setApiCount(count);
    
    return merged;
  }, []);

  const fetchReport = useCallback(async (forceRefresh = false) => {
    try {
      setStatus(AppStatus.SEARCHING);
      setError(null);
      await syncMetadata();

      const now = new Date();
      const targetDateKey = getLastGenerationBoundary(now);
      const cacheKey = `${CACHE_PREFIX}${targetDateKey}`;
      
      const localCached = localStorage.getItem(cacheKey);
      if (!forceRefresh && localCached) {
        setReport(JSON.parse(localCached));
        const dates = await syncMetadata();
        setCurrentDateIndex(dates.indexOf(targetDateKey));
        setStatus(AppStatus.COMPLETED);
        return;
      }

      const globalCached = await GlobalStorage.getReport(targetDateKey);
      if (!forceRefresh && globalCached) {
        localStorage.setItem(cacheKey, JSON.stringify(globalCached));
        setReport(globalCached);
        const dates = await syncMetadata();
        setCurrentDateIndex(dates.indexOf(targetDateKey));
        setStatus(AppStatus.COMPLETED);
        return;
      }

      setStatus(AppStatus.ANALYZING);
      const newReport = await generateResearchReport();
      
      const reportToSave = {
        ...newReport,
        date: targetDateKey,
        generatedAt: Date.now()
      };

      await GlobalStorage.saveReport(targetDateKey, reportToSave);
      const newCount = await GlobalStorage.incrementCallCount();
      setApiCount(newCount);
      
      localStorage.setItem(cacheKey, JSON.stringify(reportToSave));
      const updatedDates = await syncMetadata();
      setReport(reportToSave);
      setCurrentDateIndex(updatedDates.indexOf(targetDateKey));
      
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || "리포트를 동기화하는 중 오류가 발생했습니다.");
      setStatus(AppStatus.ERROR);
    }
  }, [syncMetadata]);

  const navigateToDate = async (index: number) => {
    if (index < 0 || index >= availableDates.length) return;
    
    const date = availableDates[index];
    const cacheKey = `${CACHE_PREFIX}${date}`;
    
    const local = localStorage.getItem(cacheKey);
    if (local) {
      setReport(JSON.parse(local));
      setCurrentDateIndex(index);
      return;
    }

    setStatus(AppStatus.SEARCHING);
    const global = await GlobalStorage.getReport(date);
    if (global) {
      localStorage.setItem(cacheKey, JSON.stringify(global));
      setReport(global);
      setCurrentDateIndex(index);
      setStatus(AppStatus.COMPLETED);
    } else {
      setError(`${date} 리포트를 찾을 수 없습니다.`);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleManualRefresh = () => {
    const pass = window.prompt("수동 갱신(공유 데이터 업데이트)을 위해 관리자 암호를 입력하세요:");
    if (pass === ADMIN_PASSWORD) {
      fetchReport(true);
    } else if (pass !== null) {
      alert("암호가 올바르지 않습니다.");
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const isToday = currentDateIndex === 0;
  const hasNext = currentDateIndex > 0;
  const hasPrev = currentDateIndex < availableDates.length - 1;

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-200">R</div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Research Radar</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global On-Device AI Insight</p>
            </div>
          </div>
          <button onClick={handleManualRefresh} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all shadow-sm">강제 갱신</button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-100 py-3 sticky top-16 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => navigateToDate(currentDateIndex + 1)}
              disabled={!hasPrev || status === AppStatus.ANALYZING}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                hasPrev ? 'bg-white text-slate-900 shadow-sm hover:bg-slate-50' : 'text-slate-300 pointer-events-none'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Previous
            </button>
            <button
              onClick={() => navigateToDate(currentDateIndex - 1)}
              disabled={!hasNext || status === AppStatus.ANALYZING}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                hasNext ? 'bg-white text-slate-900 shadow-sm hover:bg-slate-50' : 'text-slate-300 pointer-events-none'
              }`}
            >
              Next Day
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black border border-blue-100 uppercase tracking-widest">
                {report?.date || '...'}
             </div>
             <button
              onClick={() => navigateToDate(0)}
              disabled={isToday || status === AppStatus.ANALYZING}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95' : 'bg-slate-100 text-slate-400 pointer-events-none'
              }`}
            >
              Latest
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {status === AppStatus.ERROR && (
          <div className="bg-red-50 border border-red-100 p-10 rounded-[2.5rem] text-center max-w-xl mx-auto shadow-2xl shadow-red-100/50">
            <h2 className="text-2xl font-black text-red-900 mb-3 tracking-tight">Sync Error</h2>
            <p className="text-red-700/80 mb-8 font-medium leading-relaxed">{error}</p>
            <button onClick={() => fetchReport(true)} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all">Retry Sync</button>
          </div>
        )}

        {(status === AppStatus.SEARCHING || status === AppStatus.ANALYZING) && <LoadingState status={status} />}

        {status === AppStatus.COMPLETED && report && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ReportView report={report} apiCount={apiCount} />
          </div>
        )}
      </main>

      <aside className="fixed bottom-6 right-6 z-30">
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-3xl shadow-2xl flex items-center gap-4 max-w-xs">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl relative">
            🌐
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="text-[11px]">
            <p className="font-black text-slate-900 uppercase tracking-tighter">Shared Storage Active</p>
            <p className="text-slate-500 leading-tight">모든 사용자가 동일한 리포트<br/>데이터를 실시간 공유합니다.</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
