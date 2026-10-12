// client/src/components/Header.tsx
import React, { useState } from "react";
import { Copy, Check, Radio, ExternalLink } from "lucide-react";

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
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
            HookLens
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live
            </span>
          </h1>
          <p className="text-xs text-gray-400">Real-time Webhook Inspector</p>
        </div>
      </div>

      {/* URL bar & actions */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 flex-1 md:w-96">
          <span className="text-xs text-gray-500 mr-2 font-mono">POST</span>
          <input
            type="text"
            readOnly
            value={endpointUrl || "Generating endpoint..."}
            className="bg-transparent text-xs text-gray-200 outline-none w-full font-mono select-all truncate"
          />
          <button
            onClick={copyToClipboard}
            disabled={!endpointUrl}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
            title="Copy Webhook URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={onNewBin}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          New Endpoint
        </button>
      </div>
    </header>
  );
};