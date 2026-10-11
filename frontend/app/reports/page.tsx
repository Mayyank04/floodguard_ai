"use client";

import React, { useState } from "react";
import {
  FileText, Download, Printer, CheckCircle2, RefreshCw,
  FileSpreadsheet, Globe, Eye, ShieldCheck, Calendar,
  Building2, Users, MapPin, ExternalLink
} from "lucide-react";
import { generateDisasterReport, getPrimaryEventId } from "@/lib/api";

export default function DisasterReportsPage() {
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "CSV" | "GEOJSON">("PDF");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (fmt?: "PDF" | "CSV" | "GEOJSON") => {
    const f = fmt || selectedFormat;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const eventId = await getPrimaryEventId();
      const res = await generateDisasterReport({
        event_id: eventId,
        format: f,
        title: "Assam Brahmaputra Basin Flood Intelligence Brief"
      });
      setReportResult(res);

      // If CSV or GEOJSON, trigger browser download directly
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to generate report. Please verify backend connection.");
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Operational Dossiers</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">Disaster Assessment Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Assessment Report Generator</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compile verified Copernicus Sentinel-1 flood extents, isolated settlement graph diagnostics, and exposed critical infrastructure into certified operational briefs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Format Selector */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            {(["PDF", "CSV", "GEOJSON"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  selectedFormat === fmt
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {fmt === "PDF" && "Executive PDF"}
                {fmt === "CSV" && "Tabular CSV"}
                {fmt === "GEOJSON" && "Spatial GeoJSON"}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isGenerating ? "Compiling..." : "Generate Report"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Metadata & Scope Card */}
      <div className="grid sm:grid-cols-4 gap-3 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
        <div>
          <div className="text-[10px] uppercase font-medium text-slate-400">Target Disaster Scenario</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">Assam Brahmaputra Basin</div>
          <div className="text-[11px] text-slate-400">Barpeta & Mandia Corridor</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-medium text-slate-400">Peak Observation</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">June 20, 2022 (23:42 UTC)</div>
          <div className="text-[11px] text-slate-400">Sentinel-1 C-SAR Track 121</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-medium text-slate-400">Data Provenance</div>
          <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Ground Truth</span>
          </div>
          <div className="text-[11px] text-slate-400">Copernicus, CWC, OSM</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-medium text-slate-400">Export Classification</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">UN-OCHA / SDMA Compatible</div>
          <div className="text-[11px] text-slate-400">Standard Humanitarian Format</div>
        </div>
      </div>

      {/* Report Document Preview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {reportResult ? reportResult.title : "Report Document Preview"}
            </h3>
          </div>

          {reportResult && reportResult.format === "PDF" && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print / Save as PDF</span>
            </button>
          )}
        </div>

        {reportResult ? (
          reportResult.format === "PDF" ? (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <iframe
                srcDoc={reportResult.content}
                title="Report Preview"
                className="w-full h-[680px] bg-white border-0"
              />
            </div>
          ) : (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre">
              {reportResult.content}
            </div>
          )
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3 text-slate-400">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-1">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">No Dossier Generated Yet</p>
            <p className="text-xs text-slate-400 max-w-md">
              Select your desired export format and click &ldquo;Generate Report&rdquo; to compile current satellite inundation extents, isolated civilian demographics, and infrastructure status into an official dispatch brief.
            </p>
            <button
              onClick={() => handleGenerate("PDF")}
              className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition cursor-pointer"
            >
              Generate Printable Executive Brief
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
