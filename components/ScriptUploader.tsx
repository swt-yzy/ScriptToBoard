
import React, { useState } from 'react';

interface ScriptUploaderProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const ScriptUploader: React.FC<ScriptUploaderProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="glass p-8 rounded-3xl shadow-2xl border border-blue-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <i className="fas fa-clapperboard text-9xl"></i>
        </div>

        <div className="flex justify-between items-center mb-6">
          <label className="block text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            输入剧本片段
          </label>
          <div className="flex gap-2">
             <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2">
                <i className="fas fa-file-arrow-up text-blue-400"></i>
                上传 .txt 文件
                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
             </label>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在这里粘贴您的剧本、对白或场景描述。我们的 AI 将自动为您拆解分镜..."
            className="w-full h-80 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none custom-scrollbar text-lg leading-relaxed"
          />
        </div>

        <button
          disabled={!text || isLoading}
          onClick={() => onAnalyze(text)}
          className={`mt-8 w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-4 transition-all transform active:scale-[0.98] ${
            !text || isLoading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/20'
          }`}
        >
          {isLoading ? (
            <><i className="fas fa-spinner animate-spin"></i> 正在深度分析中...</>
          ) : (
            <><i className="fas fa-wand-magic-sparkles"></i> 开始 AI 可视化创作</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: 'fa-film', title: '场景智能提取', desc: 'AI 自动分析动作与环境要素' },
          { icon: 'fa-camera-retro', title: '专业电影构图', desc: '包含全景、特写等电影语言' },
          { icon: 'fa-microchip', title: 'Gemini 3 驱动', desc: '顶尖推理能力与图像生成' }
        ].map((feat, i) => (
          <div key={i} className="glass p-5 rounded-2xl flex items-center gap-4 border border-white/5 hover:bg-white/5 transition-colors">
            <div className="bg-blue-500/10 w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center">
              <i className={`fas ${feat.icon} text-blue-400 text-xl`}></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-200">{feat.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScriptUploader;
