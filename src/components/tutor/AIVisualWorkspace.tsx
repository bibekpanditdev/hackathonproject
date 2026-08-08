// src/components/tutor/AIVisualWorkspace.tsx
//
// Core AI feature: upload a PDF OR chat with the AI, and get back a full visual
// breakdown — mindmap, workflow, graph, and "ask me more" follow-up questions.
//
// Styled to match your existing DedicatedChatbot / RoadmapSidebar look (dark slate +
// indigo/amber accents, sketch-card conventions).

import React, { useRef, useState } from 'react';
import {
  Brain,
  Upload,
  FileText,
  Send,
  Sparkles,
  Loader2,
  Share2,
  Workflow,
  BarChart3,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { generateVisualAnalysis, extractPdfText } from '../../services/aiVisualService';
import type { AIVisualAnalysis, MindMapNode, VisualChatTurn } from '../../types/aiVisual';

interface AIVisualWorkspaceProps {
  onRewardXp?: (amount: number) => void;
}

/* ----------------------------- Mindmap (SVG) ----------------------------- */

const MINDMAP_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6'];

const MindMapView: React.FC<{ data: MindMapNode }> = ({ data }) => {
  const width = 700;
  const height = 420;
  const cx = width / 2;
  const cy = height / 2;
  const children = data.children || [];
  const rRing1 = 150;
  const rRing2 = 90;

  return (
    <div className="sketch-card bg-slate-950 border border-blue-900/80 p-4 overflow-x-auto">
      <div className="flex items-center gap-2 mb-2 text-xs font-black text-amber-400 uppercase tracking-wide">
        <Share2 className="w-4 h-4" /> Mindmap
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px]" style={{ maxHeight: 420 }}>
        {children.map((child, i) => {
          const angle = (2 * Math.PI * i) / Math.max(children.length, 1) - Math.PI / 2;
          const x = cx + rRing1 * Math.cos(angle);
          const y = cy + rRing1 * Math.sin(angle);
          const color = MINDMAP_COLORS[i % MINDMAP_COLORS.length];
          const grandchildren = child.children || [];

          return (
            <g key={child.id}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="#334155" strokeWidth={1.5} />
              {grandchildren.map((gc, j) => {
                const gAngle = angle + (j - (grandchildren.length - 1) / 2) * 0.5;
                const gx = x + rRing2 * Math.cos(gAngle);
                const gy = y + rRing2 * Math.sin(gAngle);
                return (
                  <g key={gc.id}>
                    <line x1={x} y1={y} x2={gx} y2={gy} stroke="#1e293b" strokeWidth={1} />
                    <rect x={gx - 55} y={gy - 14} width={110} height={28} rx={8} fill="#0f172a" stroke="#334155" />
                    <text x={gx} y={gy + 4} textAnchor="middle" fontSize={9} fill="#cbd5e1" fontWeight={600}>
                      {gc.label.length > 18 ? gc.label.slice(0, 16) + '…' : gc.label}
                    </text>
                  </g>
                );
              })}
              <rect x={x - 65} y={y - 16} width={130} height={32} rx={9} fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={10.5} fill={color} fontWeight={800}>
                {child.label.length > 20 ? child.label.slice(0, 18) + '…' : child.label}
              </text>
            </g>
          );
        })}
        {/* Root node drawn last so it sits on top */}
        <circle cx={cx} cy={cy} r={55} fill="#4f46e5" stroke="#818cf8" strokeWidth={2} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill="white" fontWeight={800}>
          {data.label.length > 16 ? data.label.slice(0, 14) + '…' : data.label}
        </text>
      </svg>
    </div>
  );
};

/* ----------------------------- Workflow (list) ----------------------------- */

const WorkflowView: React.FC<{ steps: AIVisualAnalysis['workflow'] }> = ({ steps }) => {
  if (!steps?.length) return null;
  return (
    <div className="sketch-card bg-slate-950 border border-blue-900/80 p-4">
      <div className="flex items-center gap-2 mb-3 text-xs font-black text-amber-400 uppercase tracking-wide">
        <Workflow className="w-4 h-4" /> Workflow
      </div>
      <div className="space-y-2.5 relative">
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-blue-900/80 z-0" />
        {steps.map((step, idx) => (
          <div key={step.id} className="relative z-10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md border border-emerald-400/40">
              {idx + 1}
            </div>
            <div className="bg-slate-900 border border-blue-900/80 rounded-xl px-3.5 py-2.5 flex-1">
              <h4 className="text-xs font-bold text-white">{step.label}</h4>
              {step.description && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{step.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ----------------------------- Graph (SVG) ----------------------------- */

const GRAPH_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7'];

const GraphView: React.FC<{ graph: AIVisualAnalysis['graph'] }> = ({ graph }) => {
  if (!graph?.points?.length) return null;
  const width = 340;
  const height = 220;
  const padding = 28;
  const maxVal = Math.max(...graph.points.map((p) => p.value), 1);

  return (
    <div className="sketch-card bg-slate-950 border border-blue-900/80 p-4">
      <div className="flex items-center gap-2 mb-3 text-xs font-black text-amber-400 uppercase tracking-wide">
        <BarChart3 className="w-4 h-4" /> {graph.title || 'Graph'}
      </div>

      {graph.type === 'pie' ? (
        <PieChart points={graph.points} size={200} />
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          {graph.points.map((p, i) => {
            const barWidth = (width - padding * 2) / graph.points.length - 10;
            const barHeight = (p.value / maxVal) * (height - padding * 2);
            const x = padding + i * ((width - padding * 2) / graph.points.length) + 5;
            const y = height - padding - barHeight;
            return (
              <g key={p.name}>
                <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill={GRAPH_COLORS[i % GRAPH_COLORS.length]} />
                <text x={x + barWidth / 2} y={height - padding + 14} textAnchor="middle" fontSize={8} fill="#94a3b8" fontWeight={600}>
                  {p.name.length > 10 ? p.name.slice(0, 8) + '…' : p.name}
                </text>
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="#e2e8f0" fontWeight={800}>
                  {p.value}
                </text>
              </g>
            );
          })}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth={1} />
        </svg>
      )}
    </div>
  );
};

const PieChart: React.FC<{ points: { name: string; value: number }[]; size: number }> = ({ points, size }) => {
  const total = points.reduce((sum, p) => sum + p.value, 0) || 1;
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  let angleStart = -Math.PI / 2;

  const slices = points.map((p, i) => {
    const angleSlice = (p.value / total) * 2 * Math.PI;
    const angleEnd = angleStart + angleSlice;
    const x1 = cx + r * Math.cos(angleStart);
    const y1 = cy + r * Math.sin(angleStart);
    const x2 = cx + r * Math.cos(angleEnd);
    const y2 = cy + r * Math.sin(angleEnd);
    const largeArc = angleSlice > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const slice = { path, color: GRAPH_COLORS[i % GRAPH_COLORS.length], name: p.name, value: p.value };
    angleStart = angleEnd;
    return slice;
  });

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#0f172a" strokeWidth={1.5} />
        ))}
      </svg>
      <div className="space-y-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            {s.name} ({s.value})
          </div>
        ))}
      </div>
    </div>
  );
};

/* ----------------------------- Main workspace ----------------------------- */

export const AIVisualWorkspace: React.FC<AIVisualWorkspaceProps> = ({ onRewardXp }) => {
  const [result, setResult] = useState<AIVisualAnalysis | null>(null);
  const [history, setHistory] = useState<VisualChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function runAnalysis(content: string, sourceType: 'pdf' | 'chat', sourceLabel: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateVisualAnalysis(content, sourceType, sourceLabel, history);
      setResult(data);
      setHistory((h) => [
        ...h,
        { role: 'user', content: sourceType === 'pdf' ? `Analyze this document: ${sourceLabel}` : content },
        { role: 'assistant', content: data.summary },
      ]);
      onRewardXp?.(20);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Something went wrong analyzing that.');
    } finally {
      setLoading(false);
      setLoadingLabel('');
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingLabel(`Reading ${file.name}...`);
    setLoading(true);
    try {
      const text = await extractPdfText(file);
      setLoadingLabel('Analyzing document with AI...');
      await runAnalysis(`Analyze this document and produce the full breakdown:\n\n${text}`, 'pdf', file.name);
    } catch (err) {
      console.error(err);
      setError('Could not read that PDF. Try a different file.');
      setLoading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleChatSubmit(question: string) {
    if (!question.trim() || loading) return;
    setLoadingLabel('Thinking...');
    setChatInput('');
    void runAnalysis(question, 'chat', question);
  }

  function handleReset() {
    setResult(null);
    setHistory([]);
    setError(null);
  }

  return (
    <div className="bg-slate-900 border border-blue-800 rounded-3xl shadow-2xl p-4 sm:p-6 space-y-5 text-white max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-blue-900/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-md border border-amber-400/30">
            <Brain className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white">AI Visual Study Assistant</h2>
            <p className="text-xs text-blue-300 font-medium">Upload a PDF or ask a question — get a mindmap, workflow & graph</p>
          </div>
        </div>
        {result && (
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Start over"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-upload-input" />
        <label
          htmlFor="pdf-upload-input"
          className="btn-sketch-secondary text-xs py-3 px-4 flex items-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          <Upload className="w-4 h-4" />
          Upload PDF
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChatSubmit(chatInput);
          }}
          className="flex items-center gap-2 flex-1 w-full"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Or ask AI anything to visualize..."
            className="flex-1 bg-slate-950 border border-blue-800 focus:border-amber-400 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-white placeholder-slate-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading || !chatInput.trim()}
            className="btn-sketch-primary text-xs sm:text-sm py-3 px-4 flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-slate-950 p-3 rounded-2xl border border-blue-900 w-fit animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingLabel || 'Working...'}</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold">{error}</div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-5">
          <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-800/60">
            <div className="flex items-center gap-2 mb-1.5 text-[10px] font-black text-indigo-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Summary
            </div>
            <p className="text-sm text-slate-100 font-medium leading-relaxed">{result.summary}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MindMapView data={result.mindMap} />
            <WorkflowView steps={result.workflow} />
          </div>

          <GraphView graph={result.graph} />

          {result.followUpQuestions?.length > 0 && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-blue-900/80">
              <div className="flex items-center gap-2 mb-3 text-xs font-black text-amber-400 uppercase tracking-wide">
                <HelpCircle className="w-4 h-4" /> Ask me more
              </div>
              <div className="flex flex-wrap gap-2">
                {result.followUpQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleChatSubmit(q)}
                    disabled={loading}
                    className="text-left px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-900 border border-blue-800 hover:border-amber-400 text-xs font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="text-center py-10 space-y-2">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Upload a PDF or type a question above to generate your first visual breakdown.</p>
        </div>
      )}
    </div>
  );
};