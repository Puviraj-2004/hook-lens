// client/src/components/Header.tsx
import React, { useState } from "react";
import { Copy, Check, Radio, Plus, Bookmark, Database } from "lucide-react";

interface HeaderProps {
  endpointUrl: string;
  isPermanent: boolean;
  onNewBin: () => void;
  onSaveBin: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  endpointUrl,
  isPermanent,
  onNewBin,
  onSaveBin,
}) => {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const copyToClipboard = () => {
    if (!endpointUrl) return;
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveBin();
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand & Connection State */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
            HookLens
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live
            </span>
          </h1>
          <p className="text-xs text-gray-400">Real-time Webhook Cockpit</p>
        </div>
      </div>

      {/* Modern URL Bar with Actions */}
      <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
        {/* Endpoint Input */}
        <div className="flex items-center bg-gray-900/90 border border-gray-800 rounded-lg px-3 py-1.5 flex-1 md:w-95">
          <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded mr-2">
            ENDPOINT
          </span>
          <input
            type="text"
            readOnly
            value={endpointUrl || "Generating endpoint..."}
            className="bg-transparent text-xs text-gray-200 outline-none w-full font-mono select-all truncate cursor-text"
          />
        </div>

        {/* Copy URL Button */}
        <button
          onClick={copyToClipboard}
          disabled={!endpointUrl}
          className={`text-xs px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm ${
            copied
              ? "bg-emerald-600 text-white shadow-emerald-500/20"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy URL</span>
            </>
          )}
        </button>

        {/* 🌟 SAVE TO DB / PERMANENT BADGE */}
        {isPermanent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-2 rounded-lg font-mono font-medium flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Permanent DB</span>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || !endpointUrl}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
            title="Save permanently to Neon PostgreSQL (Never expires)"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>{saving ? "Saving..." : "Save to DB"}</span>
          </button>
        )}

        {/* New Endpoint Button */}
        <button
          onClick={onNewBin}
          className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 hover:border-gray-700 text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
          title="Create a new isolated endpoint"
        >
          <Plus className="w-3.5 h-3.5 text-gray-400" />
          <span>New</span>
        </button>
      </div>
    </header>
  );
};