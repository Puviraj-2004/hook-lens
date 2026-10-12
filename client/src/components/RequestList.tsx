// client/src/components/RequestList.tsx
import React from "react";
import type { WebhookRequest } from "../types";
import { Clock } from "lucide-react";

interface RequestListProps {
  requests: WebhookRequest[];
  selectedRequest: WebhookRequest | null;
  onSelect: (req: WebhookRequest) => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  selectedRequest,
  onSelect,
}) => {
  const getMethodBadge = (method: string): string => {
    switch (method.toUpperCase()) {
      case "POST":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "GET":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <aside className="w-full md:w-80 border-r border-gray-800 bg-gray-950 flex flex-col h-[calc(100vh-73px)]">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <span>Requests ({requests.length})</span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Listening
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-900">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center text-gray-500">
            <Clock className="w-8 h-8 mb-2 stroke-[1.5] text-gray-600 animate-pulse" />
            <p className="text-sm font-medium text-gray-400">Waiting for requests...</p>
            <p className="text-xs mt-1 text-gray-600">
              Send a request to your custom endpoint to see it appear here in real time.
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const isSelected = selectedRequest?.id === req.id;
            return (
              <div
                key={req.id}
                onClick={() => onSelect(req)}
                className={`p-3.5 cursor-pointer transition-colors text-left flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600/10 border-l-2 border-indigo-500"
                    : "hover:bg-gray-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getMethodBadge(
                      req.method
                    )}`}
                  >
                    {req.method}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {new Date(req.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-gray-300 font-mono truncate">
                  /api/hook/{req.binId.slice(0, 8)}...
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  IP: {req.ip}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};