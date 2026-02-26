import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";

import type { GroupedEntity, NERPipelineEntity } from "@/models/token-classification-model.ts";

export interface NERResult {
  rawEntities: NERPipelineEntity[];
  entities: GroupedEntity[];
  processingTime: number;
}

type NERStatus = "idle" | "loading" | "ready" | "processing" | "error";

type NERWorkerMessage =
  | {
    type: "ready"
  }
  | {
    type: "initialized";
  }
  | {
    type: "status";
    backend: "wasm" | "webgpu";
    message: string;
    modelTokens: string[];
  }
  | {
    type: "result";
    jobId: string;
    rawEntities: NERPipelineEntity[];
    entities: GroupedEntity[];
    processingTime: number;
  }
  | {
    type: "error";
    jobId: string;
    message: string;
  };

export function useNERWorker(modelName: string) {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<NERStatus>("idle");
  const [backend, setBackend] = useState<"webgpu" | "wasm" | null>(null);
  const [modelTokens, setModelTokens] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pendingJobsRef = useRef<
    Map<
      string,
      {
        resolve: (result: NERResult) => void;
        reject: (error: Error) => void;
      }
    >
  >(new Map());

  const handleWorkerMessages = (event: MessageEvent<NERWorkerMessage>) => {
    if (!workerRef.current) return;

    const { type } = event.data;

    switch (type) {
      case "ready":
        workerRef.current.postMessage({
          type: "init",
          model: modelName,
          preferredBackend: 'wasm',
        });
        break;

      case "initialized":
        setStatus("ready");
        setError(null);
        break;

      case "status":
        console.log(event.data.message);
        if (event.data.backend) {
          toast.success(`Model ${modelName} loaded with ${event.data.backend}`);
          setBackend(event.data.backend);
          setModelTokens(event.data.modelTokens);
        }
        break;

      case "result": {
        console.log(event.data);
        const job = pendingJobsRef.current.get(event.data.jobId);
        if (job) {
          job.resolve({
            rawEntities: event.data.rawEntities,
            entities: event.data.entities,
            processingTime: event.data.processingTime,
          });
          pendingJobsRef.current.delete(event.data.jobId);
          setStatus("ready");
        }
        break;
      }

      case "error": {
        const errorJob = pendingJobsRef.current.get(event.data.jobId);
        if (errorJob) {
          errorJob.reject(new Error(event.data.message));
          pendingJobsRef.current.delete(event.data.jobId);
        } else {
          setError(event.data.message);
          setStatus("error");
        }
        break;
      }
    }
  };

  const handleWorkerErrors = (err: ErrorEvent) => {
    setError(`Worker error: ${err.message}`);
    setStatus("error");
  };

  const initialize = () => {
    setStatus("loading");
    setBackend(null);
    setModelTokens([]);

    const worker = new Worker(new URL("../workers/nerWorker.ts", import.meta.url), { type: "module" });

    worker.onmessage = handleWorkerMessages;
    worker.onerror = handleWorkerErrors;

    workerRef.current = worker;
  };

  const processText = useCallback(
    (text: string): Promise<NERResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || status !== "ready") {
          reject(new Error(`Worker not ready (status: ${status})`));
          return;
        }

        const jobId = `job_${crypto.randomUUID()}`;
        pendingJobsRef.current.set(jobId, { resolve, reject });

        setStatus("processing");
        workerRef.current.postMessage({ type: "process", text, jobId });
      });
    },
    [status]
  );

  const terminate = () => {
    if (!workerRef.current) return;

    workerRef.current.postMessage({ type: "terminate" });
    workerRef.current.terminate();
  };

  return {
    backend,
    error,
    modelTokens,
    status,
    initialize,
    processText,
    setStatus,
    terminate,
  };
}
