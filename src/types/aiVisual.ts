// src/types/aiVisual.ts
// Types for the "Upload PDF or Chat -> Mindmap / Workflow / Graph / Ask Me More" feature.
// Drop this file in alongside your existing src/types.ts (or merge the interfaces in).

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface WorkflowNode {
  id: string;
  label: string;
  description?: string;
  next?: string[]; // ids of the next step(s) — supports branching
}

export interface GraphDataPoint {
  name: string;
  value: number;
}

export interface VisualGraphData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  points: GraphDataPoint[];
}

export interface AIVisualAnalysis {
  id: string;
  sourceType: 'pdf' | 'chat';
  sourceLabel: string; // filename or the question that triggered this
  summary: string;
  mindMap: MindMapNode;
  workflow: WorkflowNode[];
  graph: VisualGraphData;
  followUpQuestions: string[];
  createdAt: string;
}

export interface VisualChatTurn {
  role: 'user' | 'assistant';
  content: string;
}