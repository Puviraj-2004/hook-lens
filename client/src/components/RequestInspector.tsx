// client/src/components/RequestInspector.tsx
import React, { useState } from "react";
import type { WebhookRequest } from "../types";
import { FileJson, Copy, Check } from "lucide-react";

interface RequestInspectorProps {
  request: WebhookRequest | null;
}

export const RequestInspector: React.FC<RequestInspectorProps> = ({ request }) => {
  const [activeTab, setActiveTab] = useState<"body" | "headers" | "query">("body");
  const [copied, setCopied] = useState(false);

  if (!request) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-73px)] text-gray-500 p-8">
        <FileJson className="w-12 h-12 stroke-[1.2] text-gray-700 mb-3" />
        <h2 className="text-base font-semibold text-gray-300">No Request Selected</h2>
        <p className="text-xs text-gray-500 max-w-sm text-center mt-1">
          Select a request from the sidebar to inspect its JSON body, headers, and query parameters.
        </p>
      </main>
    );
  }

  const copyContent = (content: unknown): void => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasBody =
    request.body !== null &&
    request.body !== undefined &&
    typeof request.body === "object" &&
    Object.keys(request.body).length > 0;

  const hasQuery =
    request.query !== null &&
    request.query !== undefined &&
    Object.keys(request.query).length > 0;

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-73px)] bg-gray-900/30 overflow-hidden">
      {/* Header Info Banner */}
      <div className="p-4 border-b border-gray-800 bg-gray-950/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {request.method}
            </span>
            <span className="text-sm font-semibold text-gray-200 font-mono">
              /api/hook/{request.binId}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Received at {new Date(request.timestamp).toLocaleString()} from IP {request.ip}
          </p>
        </div>

        <button
          onClick={() =>
            copyContent(
              activeTab === "body"
                ? request.body
                : activeTab === "headers"
                ? request.headers
                : request.query
            )
          }
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          Copy JSON
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-950/60 px-4">
        {(["body", "headers", "query"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-500 text-indigo-400 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-auto font-mono text-xs text-gray-200 bg-black/40">
        <pre className="whitespace-pre-wrap leading-relaxed">
          {activeTab === "body" &&
            (hasBody
              ? JSON.stringify(request.body, null, 2)
              : "// No body provided in this request")}

          {activeTab === "headers" && JSON.stringify(request.headers, null, 2)}

          {activeTab === "query" &&
            (hasQuery
              ? JSON.stringify(request.query, null, 2)
              : "// No query parameters")}
        </pre>
      </div>
    </main>
  );
};