// client/src/App.tsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Header } from "./components/Header";
import { RequestList } from "./components/RequestList";
import { RequestInspector } from "./components/RequestInspector";
import type { WebhookRequest } from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function App() {
  const [binId, setBinId] = useState<string | null>(null);
  const [isPermanent, setIsPermanent] = useState<boolean>(false);
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WebhookRequest | null>(null);

  // 1. User Event Handler: "New Endpoint" button click
  const handleCreateNewBin = async (): Promise<void> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bins`, { method: "POST" });
      const data = await res.json();
      if (data.success && typeof data.binId === "string") {
        localStorage.setItem("hooklens_binId", data.binId);
        setBinId(data.binId);
        setIsPermanent(false);
        setRequests([]);
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error("Failed to create bin:", err);
    }
  };

  // 2. 🌟 User Event Handler: "Save to DB" button click
  const handleSaveBin = async (): Promise<void> => {
    if (!binId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/bins/${binId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Saved Webhook Workspace" }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPermanent(true);
      }
    } catch (err) {
      console.error("Failed to save bin to DB:", err);
    }
  };

  // 3. Lifecycle Mount Effect: Load bin history from Neon / Redis
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function initBin(): Promise<void> {
      const savedBinId = localStorage.getItem("hooklens_binId");

      if (savedBinId) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/bins/${savedBinId}/requests`, {
            signal: controller.signal,
          });
          const data = await res.json();

          if (!isMounted) return;

          if (data.success && Array.isArray(data.data)) {
            setBinId(savedBinId);
            setIsPermanent(Boolean(data.isPermanent));
            setRequests(data.data);
            if (data.data.length > 0) {
              setSelectedRequest(data.data[0]);
            }
            return;
          }
        } catch {
          // If fetch fails, proceed to generate a fresh bin
        }
      }

      // If no saved bin or fetch failed, create new bin
      try {
        const res = await fetch(`${BACKEND_URL}/api/bins`, {
          method: "POST",
          signal: controller.signal,
        });
        const data = await res.json();

        if (!isMounted) return;

        if (data.success && typeof data.binId === "string") {
          localStorage.setItem("hooklens_binId", data.binId);
          setBinId(data.binId);
          setIsPermanent(false);
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    }

    initBin();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // 4. Real-time WebSocket connection
  useEffect(() => {
    if (!binId) return;

    const socket = io(BACKEND_URL);

    socket.on("connect", () => {
      socket.emit("join-bin", binId);
    });

    socket.on("new-webhook", (newRequest: WebhookRequest) => {
      setRequests((prev) => [newRequest, ...prev]);
      setSelectedRequest(newRequest);
    });

    return () => {
      socket.disconnect();
    };
  }, [binId]);

  const endpointUrl = binId ? `${BACKEND_URL}/api/hook/${binId}` : "";

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-200">
      <Header
        endpointUrl={endpointUrl}
        isPermanent={isPermanent}
        onNewBin={handleCreateNewBin}
        onSaveBin={handleSaveBin}
      />
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <RequestList
          requests={requests}
          selectedRequest={selectedRequest}
          onSelect={setSelectedRequest}
        />
        <RequestInspector request={selectedRequest} />
      </div>
    </div>
  );
}