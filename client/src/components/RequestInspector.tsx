// client/src/components/RequestInspector.tsx
import React, { useState } from "react";
import type { WebhookRequest } from "../types";
import { parseEvent } from "../utils/eventParser";
import { FileJson, Copy, Check, Activity, User, FolderGit2, Globe, Terminal } from "lucide-react";

interface RequestInspectorProps {
  request: WebhookRequest | null;
}

export const RequestInspector: React.FC<RequestInspectorProps> = ({ request }) => {
  const [activeTab, setActiveTab] = useState<"body" | "headers" | "query">("body");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!request) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-73px)] text-gray-500 p-8">
        <FileJson className="w-12 h-12 stroke-[1.2] text-gray-700 mb-3" />
        <h2 className="text-base font-semibold text-gray-300">No Request Selected</h2>
        <p className="text-xs text-gray-500 max-w-sm text-center mt-1">
          Select a request from the sidebar to inspect its parsed summary, JSON body, and headers.
        </p>
      </main>
    );
  }

  const parsed = parseEvent(request);

  // 1. Copy JSON Utility
  const copyJsonContent = (content: unknown): void => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // 2. ⚡ Generate and Copy as cURL Command
  const copyAsCurl = (): void => {
    const host = request.headers["host"] || "localhost:5000";
    const protocol = String(host).includes("localhost") ? "http" : "https";
    const url = `${protocol}://${host}/api/hook/${request.binId}`;

    const curlParts: string[] = [`curl -X ${request.method.toUpperCase()} "${url}"`];

    // Add Content-Type header
    curlParts.push(`-H "Content-Type: application/json"`);

    // Add Provider specific headers
    if (request.headers["x-github-event"] && typeof request.headers["x-github-event"] === "string") {
      curlParts.push(`-H "x-github-event: ${request.headers["x-github-event"]}"`);
    }
    if (request.headers["stripe-signature"] && typeof request.headers["stripe-signature"] === "string") {
      curlParts.push(`-H "stripe-signature: ${request.headers["stripe-signature"]}"`);
    }

    // Add body for non-GET requests (Windows CMD safe with \")
    if (request.method.toUpperCase() !== "GET" && request.body) {
      const bodyString = JSON.stringify(request.body);
      const escapedBody = bodyString.replace(/"/g, '\\"');
      curlParts.push(`-d "${escapedBody}"`);
    }

    const fullCurlCommand = curlParts.join(" ");

    navigator.clipboard.writeText(fullCurlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
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
      {/* 🌟 SMART EVENT SUMMARY CARD */}
      <div className="p-4 border-b border-gray-800 bg-gray-950/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${parsed.badgeColor}`}>
              {parsed.provider}
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                {parsed.eventType}
                <span className="text-xs font-normal text-gray-500 font-mono">
                  ({request.method})
                </span>
              </h2>
            </div>
          </div>

          {/* Action Buttons: Copy as cURL + Copy JSON */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyAsCurl}
              className={`text-xs px-3 py-1.5 rounded-md border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedCurl
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700 active:scale-95"
              }`}
              title="Copy request as an executable cURL command"
            >
              {copiedCurl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>cURL Copied!</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy cURL</span>
                </>
              )}
            </button>

            <button
              onClick={() =>
                copyJsonContent(
                  activeTab === "body"
                    ? request.body
                    : activeTab === "headers"
                    ? request.headers
                    : request.query
                )
              }
              className={`text-xs px-3 py-1.5 rounded-md border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedJson
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700 active:scale-95"
              }`}
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy {activeTab.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Intelligence Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-800/60 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">Actor: <strong className="text-gray-200">{parsed.sender}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">Target: <strong className="text-gray-200">{parsed.target}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Time: <strong className="text-gray-200">{new Date(request.timestamp).toLocaleTimeString()}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">IP: <strong className="text-gray-200 font-mono">{request.ip}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-950/60 px-4">
        {(["body", "headers", "query"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors cursor-pointer ${
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