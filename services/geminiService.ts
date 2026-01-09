
import { GoogleGenAI, Type } from "@google/genai";
import { DailyReport } from "../types";

export const generateResearchReport = async (): Promise<DailyReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
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
            url: { type: Type.STRING, description: "Direct URL to the research" },
            updatedDate: { type: Type.STRING, description: "YYYY-MM-DD" },
            communityReaction: { type: Type.STRING }
          },
          required: ["title", "summary", "difference", "relevance", "url", "updatedDate", "communityReaction"]
        }
      },
      influencerMentions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            influencerName: { type: Type.STRING },
            role: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            url: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["influencerName", "role", "title", "summary", "url", "date"]
        },
        minItems: 2,
        maxItems: 2
      },
      deepDive: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          keyInnovation: { type: Type.STRING },
          detailedAnalysis: { type: Type.STRING },
          historicalContext: { type: Type.STRING },
          practicalImplication: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ["title", "keyInnovation", "detailedAnalysis", "historicalContext", "practicalImplication", "url"]
      }
    },
    required: ["date", "topPapers", "influencerMentions", "deepDive"]
  };

  const today = new Date().toISOString().split('T')[0];
  
  const prompt = `
    오늘 날짜(${today})를 기준으로 지난 1~2개월간 Hugging Face, Arxiv, Tech 커뮤니티에서 가장 주목받은 "On-device AI" 관련 연구를 조사해주세요. 
    
    필수 조건:
    1. **On-Device AI를 위한 System SW, 양자화(Quantization)/압축(Compression), 런타임(Runtime)/컴파일러(Compiler) 최적화에 관한 심도 깊은 연구를 적어도 2건 이상 반드시 포함하세요.** (예: TVM, MLC-LLM, BitNet b1.58, 특수 가속기 대응 컴파일러 등)
    2. 모델 경량화 및 온디바이스 특화 소형 모델(SLM) 최신 동향을 포함하세요.
    3. 최소 3개 이상의 항목은 최근 2주일 이내의 연구여야 합니다.
    4. 커뮤니티 반응 분석 시 Reddit(r/LocalLLaMA), Hugging Face, X 등 다양한 채널을 참고하세요.
    5. Big Tech 인플루언서 2명의 최근 언급(1주일 이내)을 'influencerMentions'에 포함하세요.

    기타:
    - 모든 링크(URL)는 Arxiv 또는 공식 프로젝트 페이지를 우선합니다.
    - 모든 답변은 한국어로 작성하세요.
    - Google Search를 사용하여 최신 뉴스 및 커뮤니티 반응을 실시간으로 반영하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        thinkingConfig: { thinkingBudget: 24000 }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("API returned empty response");
    
    const parsedData = JSON.parse(resultText);
    return {
      ...parsedData,
      generatedAt: Date.now()
    } as DailyReport;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
