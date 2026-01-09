
import React from 'react';
import { AppStatus } from '../types';

interface LoadingStateProps {
  status: AppStatus;
}

const LoadingState: React.FC<LoadingStateProps> = ({ status }) => {
  const getStatusText = () => {
    switch (status) {
      case AppStatus.SEARCHING:
        return "글로벌 저장소 및 연구 커뮤니티 데이터를 확인 중입니다...";
      case AppStatus.ANALYZING:
        return "오늘의 공유 리포트가 없습니다. Gemini가 새 리포트를 생성 중입니다...";
      default:
        return "데이터 동기화 중...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-indigo-50 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🌐</div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">{getStatusText()}</h3>
      <p className="text-slate-500 text-center max-w-md text-sm leading-relaxed">
        전 세계 사용자가 동일한 내용을 보도록 공유 데이터베이스에 저장됩니다. <br/>
        새 리포트 생성 시 약 30~60초가 소요됩니다.
      </p>
    </div>
  );
};

export default LoadingState;
