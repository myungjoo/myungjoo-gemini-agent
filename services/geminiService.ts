
import { GoogleGenAI, Type } from "@google/genai";
import { DailyReport } from "../types";

export const generateResearchReport = async (): Promise<DailyReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Define schema for structured output
  const reportSchema = {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING },
      topPapers: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            difference: { type: Type.STRING },
            relevance: { type: Type.STRING },
            url: { type: Type.STRING }
          },
          required: ["title", "summary", "difference", "relevance"]
        }
      },
      deepDive: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          keyInnovation: { type: Type.STRING },
          detailedAnalysis: { type: Type.STRING },
          historicalContext: { type: Type.STRING },
          practicalImplication: { type: Type.STRING }
        },
        required: ["title", "keyInnovation", "detailedAnalysis", "historicalContext", "practicalImplication"]
      }
    },
    required: ["date", "topPapers", "deepDive"]
  };

  const today = new Date().toISOString().split('T')[0];
  
  const prompt = `
    오늘 날짜(${today})를 기준으로 지난 1~2개월간 Hugging Face Blog, Hugging Face Papers, 그리고 AI 리서치 커뮤니티에서 가장 주목받은 "On-device AI" 및 "On-device LLM" 관련 연구를 조사해주세요. 
    
    필수 포함 주제: 
    1. 모델 경량화 (Quantization, Pruning, Distillation)
    2. 로컬 실행 프레임워크 (llama.cpp, MLC-LLM, BitNet, etc.)
    3. 최적화 기법 (FlashAttention, KV Cache optimization for edge devices)
    4. 온디바이스 특화 소형 모델 (Phi-3, Gemma-2, Llama-3.2 etc.)

    요구사항:
    - 최근 주목받는 논문/프로젝트 10개 이내를 선정하여 요약하고, 기존 유사 연구와의 차이점을 기술하세요.
    - 그 중 가장 파급력이 크다고 판단되는 '단 하나'의 논문에 대해 심층 리포트(Deep Dive)를 작성하세요. 
    - 심층 리포트에는 해당 기술의 혁신성, 상세 분석, 기존 연구 맥락(Historical Context), 실제 구현 시의 함의를 포함해야 합니다.
    - 모든 내용은 한국어로 작성하세요.
    - Google Search 도구를 사용하여 실제 Hugging Face 블로그와 최신 Arxiv 데이터를 반영하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("API returned empty response");
    
    return JSON.parse(resultText) as DailyReport;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
