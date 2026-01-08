
import React from 'react';
import { AppStatus } from '../types';

interface LoadingStateProps {
  status: AppStatus;
}

const LoadingState: React.FC<LoadingStateProps> = ({ status }) => {
  const getStatusText = () => {
    switch (status) {
      case AppStatus.SEARCHING:
        return "Hugging Face와 연구 커뮤니티에서 최신 데이터를 수집하고 있습니다...";
      case AppStatus.ANALYZING:
        return "논문을 분석하고 온디바이스 AI 트렌드 리포트를 생성 중입니다...";
      default:
        return "잠시만 기다려 주세요...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{getStatusText()}</h3>
      <p className="text-slate-500 text-center max-w-md">
        평균 30~60초 정도 소요됩니다. Gemini 3 Pro가 깊이 있게 사고하며 최적의 리포트를 작성하고 있습니다.
      </p>
    </div>
  );
};

export default LoadingState;
