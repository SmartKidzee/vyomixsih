import React, { useState } from "react";
import {
  X,
  FileText,
  Download,
  Check,
} from "lucide-react";
import {
  ChatSessionForExport,
  ExportableMessage,
  downloadChatPdf
} from "@/services/pdfReportService";

interface ChatShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSessionForExport;
  messages: any[];
}

export function ChatShareModal({ isOpen, onClose, session, messages }: ChatShareModalProps) {
  if (!isOpen) return null;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const queryCount = messages.filter((m) => m.role === "user").length;
  const inferenceCount = messages.filter((m) => m.role === "assistant").length;

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const filename = await downloadChatPdf(session, messages);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#091326]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Cyan Accent Stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-md shadow-cyan-500/20 shrink-0">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Download Chat PDF
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {queryCount} queries · {inferenceCount} inferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Session Title */}
        <div className="px-5 py-3 bg-[#060c1c]/90 border-b border-white/5 flex items-center justify-between text-xs text-slate-300">
          <span className="font-mono text-cyan-400 font-semibold text-[11px] shrink-0">SESSION:</span>
          <span className="font-medium text-white truncate max-w-[280px]">{session.title}</span>
        </div>

        {/* Action Button */}
        <div className="p-5 space-y-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-bold text-sm tracking-tight hover:brightness-110 shadow-lg shadow-cyan-400/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingPdf ? (
              <>
                <div className="size-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="size-4 stroke-[3] text-slate-950" />
                <span>PDF Downloaded</span>
              </>
            ) : (
              <>
                <Download className="size-4 stroke-[2.5]" />
                <span>Download Full Chat PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
