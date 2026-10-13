// client/src/components/Header.tsx
import React, { useState } from "react";
import { Copy, Check, Radio, Plus } from "lucide-react";

interface HeaderProps {
  endpointUrl: string;
  onNewBin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ endpointUrl, onNewBin }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!endpointUrl) return;
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand */}
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
          <p className="text-xs text-gray-400">Real-time Webhook Inspector</p>
        </div>
      </div>

      {/* Modern URL Bar with Prominent Copy Button */}
      <div className="flex items-center gap-2.5 w-full md:w-auto">
        <div className="flex items-center bg-gray-900/90 border border-gray-800 rounded-lg px-3 py-1.5 flex-1 md:w-105">
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

        {/* Big Prominent Copy Button */}
        <button
          onClick={copyToClipboard}
          disabled={!endpointUrl}
          className={`text-xs px-3.5 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm ${
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

        {/* New Endpoint Action */}
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