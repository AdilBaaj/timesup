"use client";

import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useState } from "react";
import { mockSlides, mockFinancialData, mockAIOutputs } from "@/data/mock-data";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlidePreviewModalProps {
  open: boolean;
  onClose: () => void;
}

export function SlidePreviewModal({ open, onClose }: SlidePreviewModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mockSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mockSlides.length) % mockSlides.length);
  };

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement("a");
    link.href = "#";
    link.download = "Panzani_FPA_Nov2024.pptx";
    alert("Download started: Panzani_FPA_Nov2024.pptx (Demo)");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 bg-zinc-900 border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            Generated Presentation Preview
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Slide preview */}
        <div className="p-6">
          <div className="relative bg-white rounded-lg aspect-[16/9] overflow-hidden">
            {/* Slide content - mock slides */}
            <SlideContent slideIndex={currentSlide} />

            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Slide counter */}
          <div className="mt-4 text-center text-sm text-zinc-400">
            Slide {currentSlide + 1} of {mockSlides.length}
          </div>

          {/* Thumbnails */}
          <div className="mt-4 flex justify-center gap-2">
            {mockSlides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-20 h-12 rounded border-2 overflow-hidden transition-all",
                  currentSlide === index
                    ? "border-blue-500 ring-2 ring-blue-500/50"
                    : "border-zinc-700 hover:border-zinc-600"
                )}
              >
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs text-zinc-400">{index + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SlideContent({ slideIndex }: { slideIndex: number }) {
  switch (slideIndex) {
    case 0:
      return (
        <div className="w-full h-full bg-gradient-to-br from-red-700 to-red-900 flex flex-col items-center justify-center text-white p-8">
          <div className="text-5xl font-bold mb-4">PANZANI</div>
          <div className="text-2xl mb-8">Monthly FP&A Report</div>
          <div className="text-xl">November 2024</div>
          <div className="absolute bottom-8 text-sm opacity-75">
            Finance & Strategy Team
          </div>
        </div>
      );
    case 1:
      return (
        <div className="w-full h-full bg-white p-8 text-zinc-900">
          <div className="text-2xl font-bold text-red-700 mb-6">
            Executive Summary
          </div>
          <div className="space-y-4 text-sm leading-relaxed">
            {mockAIOutputs.executiveSummary.output.split("\n\n").map((para, i) => (
              <p key={i}>{para.replace(/\*\*/g, "")}</p>
            ))}
          </div>
        </div>
      );
    case 2:
      return (
        <div className="w-full h-full bg-white p-8 text-zinc-900">
          <div className="text-2xl font-bold text-red-700 mb-6">
            P&L Summary
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-red-700">
                <th className="text-left py-2">Line Item</th>
                <th className="text-right py-2">Oct 2024</th>
                <th className="text-right py-2">Nov 2024</th>
                <th className="text-right py-2">Variance</th>
              </tr>
            </thead>
            <tbody>
              {mockFinancialData.pnl.map((row, i) => (
                <tr key={i} className="border-b border-zinc-200">
                  <td className="py-2 font-medium">{row.item}</td>
                  <td className="text-right py-2">€{row.oct}M</td>
                  <td className="text-right py-2">€{row.nov}M</td>
                  <td
                    className={cn(
                      "text-right py-2 font-medium",
                      row.variance > 0 ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {row.variancePct > 0 ? "+" : ""}
                    {row.variancePct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 3:
      return (
        <div className="w-full h-full bg-white p-8 text-zinc-900">
          <div className="text-2xl font-bold text-red-700 mb-6">
            KPI Dashboard
          </div>
          <div className="grid grid-cols-3 gap-4">
            {mockFinancialData.kpis.map((kpi, i) => (
              <div
                key={i}
                className="bg-zinc-100 rounded-lg p-4 text-center"
              >
                <div className="text-sm text-zinc-600 mb-1">{kpi.name}</div>
                <div className="text-2xl font-bold text-zinc-900">
                  {kpi.value}
                </div>
                <div
                  className={cn(
                    "text-sm font-medium mt-1",
                    kpi.change.startsWith("+")
                      ? "text-emerald-600"
                      : "text-red-600"
                  )}
                >
                  {kpi.change} MoM
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 4:
      return (
        <div className="w-full h-full bg-white p-8 text-zinc-900">
          <div className="text-2xl font-bold text-red-700 mb-6">
            Variance Commentary
          </div>
          <div className="space-y-4 text-sm leading-relaxed">
            {mockAIOutputs.varianceAnalysis.output
              .split("\n\n")
              .slice(0, 3)
              .map((para, i) => (
                <p key={i}>{para.replace(/\*\*/g, "")}</p>
              ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}
