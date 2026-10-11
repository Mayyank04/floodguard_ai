"use client";

import React, { useState } from "react";
import {
  FileText, Download, Printer, CheckCircle2, RefreshCw,
  FileSpreadsheet, Globe, Eye
} from "lucide-react";
import { generateDisasterReport, getPrimaryEventId } from "@/lib/api";

export default function DisasterReportsPage() {
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "CSV" | "GEOJSON">("PDF");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  const handleGenerate = async (fmt?: "PDF" | "CSV" | "GEOJSON") => {
    const f = fmt || selectedFormat;
    setIsGenerating(true);
    try {
      const eventId = await getPrimaryEventId();
      const res = await generateDisasterReport({
        event_id: eventId,
        format: f,
        title: "Assam Brahmaputra Basin Flood Intelligence Brief"
      });
      setReportResult(res);

      // If CSV or GEOJSON, automatically trigger browser download
      if (f === "CSV" || f === "GEOJSON") {
        const ext = f === "CSV" ? "csv" : "geojson";
        const blob = new Blob([res.content], { type: res.media_type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `floodguard_report_assam_${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportResult || reportResult.format !== "PDF") return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(reportResult.content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
            <FileText className="w-4 h-4" />
            <span>Operational Reporting & Audit Export</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Disaster Assessment Report Generator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Export structured intelligence dossiers in printable PDF briefing format, tabular CSV, or multi-layer GeoJSON.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            {(["PDF", "CSV", "GEOJSON"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  selectedFormat === fmt ? "bg-[#00D4FF] text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 text-xs font-extrabold hover:brightness-110 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Report Preview Container */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#00D4FF]" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {reportResult ? reportResult.title : "Report Document Preview"}
            </h3>
          </div>

          {reportResult && reportResult.format === "PDF" && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Print / Save as PDF</span>
            </button>
          )}
        </div>

        {reportResult ? (
          reportResult.format === "PDF" ? (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#07111F]">
              <iframe
                srcDoc={reportResult.content}
                title="Report Preview"
                className="w-full h-[650px] bg-white border-0"
              />
            </div>
          ) : (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto whitespace-pre">
              {reportResult.content}
            </div>
          )
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3 text-slate-400">
            <FileText className="w-12 h-12 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Ready to Generate Disaster Report</p>
            <p className="text-xs text-slate-500 max-w-md">
              Click &ldquo;Generate Report&rdquo; above to compile verified satellite extent, infrastructure intersections, and isolated community priority scores into an official dispatch brief.
            </p>
            <button
              onClick={() => handleGenerate("PDF")}
              className="mt-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#00D4FF] font-bold text-xs border border-cyan-500/30 transition cursor-pointer"
            >
              Generate Printable Operations Brief
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
