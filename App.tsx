
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell, XAxis } from 'recharts';
import { Scene, ScriptAnalysis, ImageSize } from './types';
import { analyzeScript, generateSceneImage } from './services/geminiService';
import ScriptUploader from './components/ScriptUploader';
import ChatBot from './components/ChatBot';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    };
    checkKey();
  }, []);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeScript(text);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      alert("脚本分析失败，请检查网络或刷新重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async (sceneId: string) => {
    // @ts-ignore
    const keySelected = await window.aistudio.hasSelectedApiKey();
    if (!keySelected) {
      setShowKeyModal(true);
      return;
    }

    if (!analysis) return;

    setAnalysis(prev => {
      if (!prev) return null;
      return {
        ...prev,
        scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, isGenerating: true, error: undefined } : s)
      };
    });

    try {
      const scene = analysis.scenes.find(s => s.id === sceneId);
      if (!scene) return;

      const url = await generateSceneImage(scene.visualPrompt, imageSize, analysis.genre);
      
      setAnalysis(prev => {
        if (!prev) return null;
        return {
          ...prev,
          scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, imageUrl: url, isGenerating: false } : s)
        };
      });
    } catch (err: any) {
      console.error(err);
      let errorMsg = "图像生成失败。";
      if (err.message?.includes("Requested entity was not found")) {
        setShowKeyModal(true);
        errorMsg = "请重新选择 API Key。";
      }
      setAnalysis(prev => {
        if (!prev) return null;
        return {
          ...prev,
          scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, isGenerating: false, error: errorMsg } : s)
        };
      });
    }
  };

  const handleGenerateAll = async () => {
    if (!analysis) return;
    for (const scene of analysis.scenes) {
      if (!scene.imageUrl) {
        await handleGenerateImage(scene.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
              <i className="fas fa-clapperboard text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white italic">
                剧本分镜大师 <span className="text-blue-500">AI</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-blue-300 font-bold uppercase tracking-widest">PRO STUDIO</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
              <i className="fas fa-bolt text-yellow-500 animate-pulse"></i>
              <span>Gemini 3 Pro 已就绪</span>
            </div>
            {analysis && (
              <button 
                onClick={() => setAnalysis(null)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold border border-red-500/20 transition-all"
              >
                放弃当前项目
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {!analysis ? (
          <div className="space-y-16 py-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
                让灵感在画板上 <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">跃然纸上</span>
              </h2>
              <p className="text-slate-400 text-xl font-medium">
                上传电影、短视频或商业广告剧本，让 AI 为您生成专业电影级的分镜草图与视觉分析。
              </p>
            </div>
            <ScriptUploader onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 剧本看板数据 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 glass p-10 rounded-[2.5rem] flex flex-col justify-between border-blue-500/5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-blue-500/20 text-blue-300 text-sm px-4 py-1 rounded-full font-bold border border-blue-500/20">{analysis.genre}</span>
                      <span className="text-slate-500 text-sm font-medium">共提取 {analysis.scenes.length} 个分镜</span>
                    </div>
                    <h2 className="text-5xl font-black text-white">{analysis.title}</h2>
                  </div>
                  
                  <div className="w-full md:w-64 h-24">
                    <p className="text-xs text-slate-500 mb-3 font-bold uppercase tracking-widest">视觉节奏分布图</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.pacing}>
                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                          {analysis.pacing.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-[2.5rem] space-y-6 flex flex-col border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-wider border-b border-white/5 pb-4 flex items-center gap-2">
                  <i className="fas fa-sliders text-blue-400"></i> 全局控制板
                </h3>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-3">画面精细度</span>
                    <div className="flex gap-2 p-1 bg-slate-900 rounded-2xl border border-white/5">
                      {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => setImageSize(size)}
                          className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${
                            imageSize === size 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateAll}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                  >
                    <i className="fas fa-play"></i>
                    生成完整分镜
                  </button>
                  
                  <button 
                    onClick={() => window.print()}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-2xl font-black border border-slate-700 transition-all flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-file-pdf"></i>
                    导出 PDF 画稿
                  </button>
                </div>
              </div>
            </div>

            {/* 分镜卷轴 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {analysis.scenes.map((scene, idx) => (
                <div 
                  key={scene.id} 
                  className="group relative flex flex-col animate-in fade-in duration-1000"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative aspect-video bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-blue-500/40 transition-all duration-500 shadow-2xl group-hover:shadow-blue-500/10">
                    {scene.imageUrl ? (
                      <img src={scene.imageUrl} alt={scene.description} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900">
                        {scene.isGenerating ? (
                          <div className="space-y-4">
                            <div className="relative">
                              <i className="fas fa-circle-notch animate-spin text-5xl text-blue-500 opacity-50"></i>
                              <i className="fas fa-film absolute inset-0 flex items-center justify-center text-xs text-blue-300"></i>
                            </div>
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest animate-pulse">正在渲染电影画幅...</p>
                          </div>
                        ) : (
                          <div className="space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto border border-white/5">
                              <i className="fas fa-plus text-slate-500 text-2xl"></i>
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase">点击下方生成该分镜</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 悬停操作层 */}
                    {!scene.isGenerating && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => handleGenerateImage(scene.id)}
                          className="bg-white text-black px-8 py-3 rounded-full font-black text-sm flex items-center gap-3 hover:scale-110 transition-transform active:scale-95"
                        >
                          <i className="fas fa-wand-magic-sparkles text-blue-600"></i>
                          {scene.imageUrl ? '重新构思' : '立即生成'}
                        </button>
                      </div>
                    )}

                    <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-xl text-[10px] font-black text-white border border-white/10 shadow-lg tracking-widest">
                      SHOT {scene.sceneNumber}
                    </div>
                  </div>

                  <div className="mt-6 px-4 space-y-4 flex-1">
                    <h4 className="text-lg font-bold text-white line-clamp-2 leading-tight tracking-tight">{scene.description}</h4>
                    
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-camera text-[10px] text-blue-400 mt-1"></i>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">视觉描述：{scene.visualPrompt}</p>
                      </div>
                      
                      {scene.dialoguePreview && (
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-xs text-blue-200 italic font-medium">"{scene.dialoguePreview}"</p>
                        </div>
                      )}
                    </div>

                    {scene.error && (
                       <p className="text-xs text-red-400 font-bold bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/10">
                         <i className="fas fa-exclamation-triangle mr-2"></i>
                         {scene.error}
                       </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <ChatBot />

      {showKeyModal && (
        <ApiKeyModal onConfirm={() => {
          setShowKeyModal(false);
          setHasApiKey(true);
        }} />
      )}

      {/* 底部装饰 */}
      <footer className="mt-20 border-t border-white/5 py-10 opacity-30 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-slate-500">© 2025 ScriptToBoard Pro • AI Powered Cinema Studio</p>
      </footer>
    </div>
  );
};

export default App;
