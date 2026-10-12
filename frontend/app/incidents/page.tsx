"use client";

import React, { useState, useEffect } from "react";
import {
  Camera, Upload, MapPin, CheckCircle2, XCircle, AlertTriangle,
  Clock, Shield, User, FileText, Mic, MicOff, RefreshCw, Layers,
  ChevronRight, ArrowUpRight, Eye
} from "lucide-react";
import { fetchFieldObservations, createFieldObservation, verifyFieldObservation, getPrimaryEventId } from "@/lib/api";
import { FieldObservation } from "@/types";

const OBSERVATION_TYPES = [
  { value: "flood_depth", label: "Surface Water Depth" },
  { value: "embankment_breach", label: "Embankment / Dyke Breach" },
  { value: "bridge_submerged", label: "Bridge Submerged / Scour" },
  { value: "road_blocked", label: "Road Blocked / Impassable" },
  { value: "shelter_status", label: "Relief Shelter Needs" },
];

const PRESET_COORDINATES = [
  { name: "Mandia Char Embankment", lat: 26.178, lon: 90.965 },
  { name: "Beki River Bridge Western Approach", lat: 26.242, lon: 90.922 },
  { name: "Chenga Relief Sector", lat: 26.251, lon: 91.075 },
  { name: "Kalgachia Hospital Causeway", lat: 26.291, lon: 90.875 },
  { name: "Barpeta Town Bypass SH-4", lat: 26.321, lon: 91.006 },
];

export default function IncidentsPage() {
  const [eventId, setEventId] = useState<string>("6d5354bb-015e-4fb3-b050-d78fb1302910");
  const [observations, setObservations] = useState<FieldObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObs, setSelectedObs] = useState<FieldObservation | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  // Form submission state
  const [observerName, setObserverName] = useState("NDRF Tactical Scout 3");
  const [observationType, setObservationType] = useState("flood_depth");
  const [latitude, setLatitude] = useState(26.178);
  const [longitude, setLongitude] = useState(90.965);
  const [nearestFeature, setNearestFeature] = useState("Mandia Char Sector");
  const [waterDepth, setWaterDepth] = useState(1.2);
  const [description, setDescription] = useState("");
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // Review state
  const [reviewerName, setReviewerName] = useState("Incident Operations Lead");
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const eid = await getPrimaryEventId();
        setEventId(eid);
        const data = await fetchFieldObservations(eid);
        setObservations(data);
        if (data.length > 0) setSelectedObs(data[0]);
      } catch (err) {
        console.error("Failed to load observations:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Invalid format: Please upload a JPEG, PNG, or WebP photograph.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds maximum allowed size (10 MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time speech-to-text recording
      setTimeout(() => {
        const sampleTranscription = "Water rapidly rising near culvert. Turbid flow across approach road with debris. Wheeled vehicles unable to cross.";
        setVoiceTranscript(sampleTranscription);
        setDescription((prev) => (prev ? prev + " " + sampleTranscription : sampleTranscription));
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide an incident description or photo observation.");
      return;
    }

    setSubmitting(true);
    setSubmitFeedback(null);
    try {
      const created = await createFieldObservation({
        event_id: eventId,
        observer_name: observerName,
        observation_type: observationType,
        latitude: Number(latitude),
        longitude: Number(longitude),
        description: description,
        water_depth_meters: Number(waterDepth),
        image_url: uploadedImagePreview || undefined,
        nearest_feature_name: nearestFeature
      });

      setObservations([created, ...observations]);
      setSelectedObs(created);
      setDescription("");
      setVoiceTranscript("");
      setUploadedImagePreview(null);
      setSubmitFeedback("Observation submitted successfully. Status: PENDING VERIFICATION.");
    } catch (err: any) {
      setSubmitFeedback("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!selectedObs) return;
    setActionLoading(true);
    try {
      const updated = await verifyFieldObservation(selectedObs.id, {
        status,
        reviewer_name: reviewerName,
        review_notes: reviewNotes
      });
      setObservations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSelectedObs(updated);
      setReviewNotes("");
    } catch (err: any) {
      alert("Verification update failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredObservations = observations.filter((o) => {
    if (statusFilter === "all") return true;
    return o.verification_status === statusFilter;
  });

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Multimodal Field Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Incident Observations & Tactical Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ground-truth responder reports, uploaded field photographs, and automated visual assessments linked to geospatial assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#172033] border border-[#334155] text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Active Feed: {observations.length} Observations</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Intake (Left) & Verification Registry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Field Intake Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#334155] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#334155] pb-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-white">Submit Field Observation</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Step 1 of 4</span>
          </div>

          <form onSubmit={handleSubmitObservation} className="space-y-3.5 text-xs">
            {/* Observer Identity */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Observer Identification
              </label>
              <input
                type="text"
                value={observerName}
                onChange={(e) => setObserverName(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-[#2563EB] outline-none"
                placeholder="e.g. NDRF Scout / ASDMA Volunteer"
                required
              />
            </div>

            {/* Observation Category */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Observation Category
              </label>
              <select
                value={observationType}
                onChange={(e) => setObservationType(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-white focus:border-[#2563EB] outline-none cursor-pointer"
              >
                {OBSERVATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Location Association & Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-300">
                Spatial Location & Landmark Association
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="bg-[#0B1220] border border-[#334155] rounded-lg px-2.5 py-1.5 text-white outline-none font-mono text-[11px]"
                  placeholder="Latitude"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="bg-[#0B1220] border border-[#334155] rounded-lg px-2.5 py-1.5 text-white outline-none font-mono text-[11px]"
                  placeholder="Longitude"
                />
              </div>

              {/* Quick AOI Preset Selector */}
              <div className="pt-1 flex flex-wrap gap-1">
                {PRESET_COORDINATES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setLatitude(p.lat);
                      setLongitude(p.lon);
                      setNearestFeature(p.name);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                      nearestFeature === p.name
                        ? "bg-[#2563EB]/20 border-[#2563EB] text-white"
                        : "bg-[#1E293B] border-[#334155] text-slate-400 hover:text-white"
                    }`}
                  >
                    {p.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Water Depth Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">
                  Estimated Water Depth
                </label>
                <span className="font-mono font-bold text-amber-400">{waterDepth} meters</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.0"
                step="0.1"
                value={waterDepth}
                onChange={(e) => setWaterDepth(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
            </div>

            {/* Photograph Upload Area */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Field Photograph (JPEG, PNG, WebP &lt; 10MB)
              </label>
              <div className="border border-dashed border-[#334155] rounded-lg p-3 text-center bg-[#0B1220]/50 hover:border-slate-400 transition">
                {uploadedImagePreview ? (
                  <div className="relative group">
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded field observation"
                      className="max-h-36 mx-auto rounded object-cover border border-[#334155]"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImagePreview(null)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black rounded-full text-white text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-1">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-[11px] text-slate-300 block font-medium">Click to attach photo from device</span>
                    <span className="text-[10px] text-slate-500 block">Corroborates radar backscatter drops</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Field Description & Speech Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">
                  Incident Description & Conditions
                </label>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition cursor-pointer ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-[#1E293B] text-slate-300 hover:text-white"
                  }`}
                >
                  {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isRecording ? "Transcribing Voice..." : "Dictate Audio"}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe road passability, embankment state, current flow velocity, or trapped civilians..."
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-[#2563EB] outline-none text-xs leading-relaxed"
                required
              />
            </div>

            {/* Disclaimer & Submit */}
            <div className="p-2.5 rounded-lg bg-[#172033]/80 border border-[#334155] text-[10px] text-slate-400 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Observations are submitted as <strong>Pending Verification</strong>. Automated AI assessments are advisory and must be reviewed by the Incident Commander before altering routing constraints.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting Observation..." : "Submit Field Observation"}
            </button>

            {submitFeedback && (
              <div className="text-[11px] text-emerald-400 font-medium text-center">
                {submitFeedback}
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Registry & Incident Detail (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#111827] border border-[#334155] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              {(["all", "pending", "verified", "rejected"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer font-medium ${
                    statusFilter === filter
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Showing {filteredObservations.length} of {observations.length} reports
            </span>
          </div>

          {/* Observations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredObservations.map((obs) => {
              const isSelected = selectedObs?.id === obs.id;
              return (
                <div
                  key={obs.id}
                  onClick={() => setSelectedObs(obs)}
                  className={`p-3 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? "bg-[#172033] border-[#2563EB] shadow-md"
                      : "bg-[#111827] border-[#334155] hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white truncate">
                      {obs.nearest_feature_name || obs.observation_type.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        obs.verification_status === "verified"
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : obs.verification_status === "rejected"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {obs.verification_status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                    {obs.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-[#334155]/60 pt-1.5 font-mono">
                    <span>{obs.observer_name}</span>
                    <span>{obs.water_depth_meters}m depth</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Observation Inspection & Verification Console */}
          {selectedObs ? (
            <div className="bg-[#111827] border border-[#334155] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#334155] pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-white">
                    Incident Dossier #{selectedObs.id.slice(0, 8)}
                  </h3>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Captured at: {selectedObs.created_at ? new Date(selectedObs.created_at).toLocaleString() : "2022-06-20"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#0B1220] rounded-lg border border-[#334155]">
                    <span className="text-slate-400 block text-[10px]">Landmark / Feature</span>
                    <span className="font-semibold text-white block mt-0.5">
                      {selectedObs.nearest_feature_name || "Regional Road Corridor"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#0B1220] rounded-lg border border-[#334155]">
                    <span className="text-slate-400 block text-[10px]">Coordinates</span>
                    <span className="font-mono text-white block mt-0.5">
                      {selectedObs.latitude.toFixed(4)}°N, {selectedObs.longitude.toFixed(4)}°E
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#0B1220] rounded-lg border border-[#334155]">
                    <span className="text-slate-400 block text-[10px]">Reported Depth</span>
                    <span className="font-bold text-amber-400 block mt-0.5">
                      {selectedObs.water_depth_meters} meters
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedObs.image_url ? (
                    <div className="rounded-lg overflow-hidden border border-[#334155]">
                      <img
                        src={selectedObs.image_url}
                        alt="Incident"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-36 rounded-lg bg-[#0B1220] border border-[#334155] flex items-center justify-center text-slate-500 text-[11px] p-4 text-center">
                      No photograph attached to this report.
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#334155] text-xs">
                <span className="text-slate-400 block text-[10px] mb-1 font-semibold uppercase">
                  Field Reporter Account:
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedObs.description}</p>
              </div>

              {/* Automated AI Interpretation */}
              {selectedObs.ai_interpretation && (
                <div className="p-3 bg-[#172033] rounded-lg border border-blue-500/30 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-400 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Automated Visual Interpretation (Unverified AI Finding):</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedObs.ai_interpretation}
                  </p>
                </div>
              )}

              {/* Reviewer Console */}
              <div className="p-3.5 rounded-lg bg-[#1E293B]/70 border border-[#334155] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                    Operations Commander Verification
                  </span>
                  {selectedObs.reviewed_by && (
                    <span className="text-[10px] text-slate-400">
                      Reviewed by: {selectedObs.reviewed_by} · {selectedObs.reviewed_at}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Reviewer Name"
                    className="w-1/3 bg-[#0B1220] border border-[#334155] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Review comments / drone verification confirmation..."
                    className="flex-1 bg-[#0B1220] border border-[#334155] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleVerify("verified")}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Link to Situation Map</span>
                  </button>
                  <button
                    onClick={() => handleVerify("rejected")}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-[#111827] rounded-xl border border-[#334155]">
              Select an observation from the registry to inspect and verify.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
