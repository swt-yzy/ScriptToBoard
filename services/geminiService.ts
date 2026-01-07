
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Scene, ScriptAnalysis, ImageSize } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeScript = async (scriptText: string): Promise<ScriptAnalysis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `作为一个资深的电影分镜师，请分析以下剧本。
    
    请输出 JSON 格式（必须符合 responseSchema）：
    - title: 剧本标题（如果剧本中没写，请根据内容起一个）
    - genre: 电影类型（如：科幻、悬疑、都市等）
    - pacing: 一个数组，代表剧本的情绪/视觉起伏 (label: 章节, value: 1-100)
    - scenes: 分镜列表。
    
    对于每个分镜的 visualPrompt：
    1. 必须包含具体的摄影机位（全景、特写、俯拍等）。
    2. 必须包含光影描述（丁达尔效应、冷暖对比、硬光、柔光等）。
    3. 风格设定为：超写实电影概念图，专业电影质感，细节丰富。
    4. 语言使用英文（以便图像生成模型理解）。
    
    剧本内容：
    ${scriptText.substring(0, 8000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          genre: { type: Type.STRING },
          pacing: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ["label", "value"]
            }
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.NUMBER },
                description: { type: Type.STRING, description: "场景的中文简述" },
                visualPrompt: { type: Type.STRING, description: "给AI绘图模型的详细英文提示词" },
                dialoguePreview: { type: Type.STRING, description: "场景中的核心台词" }
              },
              required: ["sceneNumber", "description", "visualPrompt"]
            }
          }
        },
        required: ["title", "genre", "scenes", "pacing"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    scenes: data.scenes.map((s: any, idx: number) => ({
      ...s,
      id: `scene-${idx}-${Date.now()}`
    }))
  };
};

export const generateSceneImage = async (
  visualPrompt: string, 
  size: ImageSize = '1K',
  genre: string = 'Cinematic'
): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { text: `Professional film storyboard frame. Genre: ${genre}. Subject: ${visualPrompt}. Details: 8k resolution, cinematic lighting, dramatic composition, film grain, highly detailed environment.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("模型未返回图像数据");
};

export const chatResponse = async (message: string, history: { role: 'user' | 'model', text: string }[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: '你是一位世界级的电影导演。用户现在正在创作剧本并进行可视化开发。你的任务是给用户提供专业、有启发性的建议。请用简洁、富有艺术感的中文回答。',
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
