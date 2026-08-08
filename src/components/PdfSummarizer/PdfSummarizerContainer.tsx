import React, { useState, useEffect } from 'react';
import { PdfSummary, UserProfile } from '../../types';
import { summarizePdf } from '../../services/api';
import { uploadPdfFileToStorage, savePdfDocToFirestore, getUserPdfsFromFirestore } from '../../services/firebase';
import { FileText, Upload, Sparkles, Layers, CheckCircle2, ArrowRight, Loader2, Cloud, Download, Clock } from 'lucide-react';

interface PdfSummarizerContainerProps {
  user: UserProfile;
  onTurnIntoLesson: (topicTitle: string) => void;
  onRewardXp: (amount: number) => void;
}

export const PdfSummarizerContainer: React.FC<PdfSummarizerContainerProps> = ({
  user,
  onTurnIntoLesson,
  onRewardXp,
}) => {
  const [fileText, setFileText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summaryResult, setSummaryResult] = useState<PdfSummary | null>(null);
  const [savedCloudPdfs, setSavedCloudPdfs] = useState<PdfSummary[]>([]);

  // Load user's saved PDFs from Firestore
  useEffect(() => {
    if (user && user.uid) {
      getUserPdfsFromFirestore(user.uid).then((pdfs) => {
        setSavedCloudPdfs(pdfs);
      });
    }
  }, [user]);

  const processAndSavePdf = async (name: string, content: string, fileObj?: File) => {
    setIsParsing(true);
    setFileName(name);
    setFileText(content);
    setUploadProgress(10);

    let storageUrl = '';
    if (fileObj && user && user.uid) {
      try {
        storageUrl = await uploadPdfFileToStorage(user.uid, fileObj, (pct) => setUploadProgress(Math.round(pct)));
      } catch (err) {
        console.warn('Firebase storage upload fallback:', err);
      }
    }

    const summary = await summarizePdf(content, name);
    summary.uploadedAt = new Date().toISOString().split('T')[0];

    setSummaryResult(summary);
    setIsParsing(false);
    onRewardXp(50);

    // Save metadata in Firestore
    if (user && user.uid) {
      const docToSave = {
        ...summary,
        downloadUrl: storageUrl,
      };
      await savePdfDocToFirestore(docToSave, user.uid);
      setSavedCloudPdfs((prev) => [docToSave, ...prev]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        processAndSavePdf(file.name, text || 'Extracted PDF document text.', file);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="sketch-card bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 text-sky-300 rounded-xl border border-white/10">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-2xl text-white">Firebase Storage PDF Library & AI Summarizer</h2>
            <p className="text-xs text-sky-100/90 font-medium">
              Upload study documents directly to Firebase Storage, extract key takeaways, and build flashcards!
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="sketch-card bg-white p-8 text-center border-2 border-dashed border-slate-200/80 hover:border-indigo-300 transition-all relative">
        <input
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />

        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-2xs flex items-center justify-center mx-auto text-indigo-600">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Upload PDF to Firebase Cloud Storage</h3>
          <p className="text-xs text-slate-400">Files are uploaded securely to storage and synced to your profile</p>

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() =>
                processAndSavePdf(
                  'Computer_Networks_Chapter_4.pdf',
                  'Subnetting divides a single physical network into smaller logical sub-networks (subnets). CIDR notation specifies network bit masks. Routers forward IP packets across network interfaces using routing tables.'
                )
              }
              className="pointer-events-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              📄 Demo: Networks PDF
            </button>
            <button
              onClick={() =>
                processAndSavePdf(
                  'Organic_Chem_SN1_SN2_Notes.pdf',
                  'Nucleophilic substitution reactions involve nucleophiles attacking electrophilic carbons. SN2 reactions feature backside attack and inversion of configuration. SN1 reactions form carbocation intermediates.'
                )
              }
              className="pointer-events-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              🧪 Demo: Chemistry PDF
            </button>
          </div>
        </div>
      </div>

      {/* Loading Parsing Animation */}
      {isParsing && (
        <div className="sketch-card bg-white p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <h3 className="font-bold text-lg text-slate-900">Uploading to Firebase Storage & Synthesizing...</h3>
          <div className="w-64 bg-slate-100 h-2 rounded-full mx-auto overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-xs text-slate-500">{uploadProgress}% complete</p>
        </div>
      )}

      {/* Summary Output */}
      {summaryResult && !isParsing && (
        <div className="space-y-6">
          <div className="sketch-card bg-white p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 w-fit">
                  <Cloud className="w-3.5 h-3.5" /> SAVED TO FIREBASE STORAGE
                </span>
                <h3 className="font-bold text-2xl text-slate-900 mt-1">{summaryResult.fileName}</h3>
              </div>

              <button
                onClick={() => onTurnIntoLesson(summaryResult.fileName.replace('.pdf', ''))}
                className="btn-sketch-primary text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Turn Into Interactive AI Micro-Lesson
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Key Points Bullet List */}
            <div>
              <h4 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Key Points Extracted
              </h4>
              <div className="space-y-2">
                {summaryResult.keyPoints.map((point, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                    <span className="font-bold text-xs text-indigo-600 shrink-0 mt-0.5">#{idx + 1}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Flashcards */}
            <div>
              <h4 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Generated Flashcards ({summaryResult.flashcards.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summaryResult.flashcards.map((fc, idx) => (
                  <div key={idx} className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <span className="text-[10px] font-bold uppercase text-indigo-700">Q: {fc.front}</span>
                    <p className="text-xs font-bold text-slate-900 mt-1">A: {fc.back}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Storage Documents Library */}
      {savedCloudPdfs.length > 0 && (
        <div className="sketch-card bg-white p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-lg text-slate-900">Your Cloud Storage PDFs</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{savedCloudPdfs.length} Synced PDFs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedCloudPdfs.map((pdf, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 truncate max-w-[200px]">{pdf.fileName}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Uploaded: {pdf.uploadedAt}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSummaryResult(pdf)}
                  className="btn-sketch-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
                >
                  View Summary
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
