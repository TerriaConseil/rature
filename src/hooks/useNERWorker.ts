import { useRef, useState, useCallback } from "react";

import type { NERModel } from "@/models/utils.ts";
import type { GroupedEntity, NERPipelineEntity } from "@/types/index.ts";
import NerWorker from "@/workers/nerWorker.ts?worker&url";

export interface NERResult {
  rawEntities: NERPipelineEntity[];
  entities: GroupedEntity[];
  processingTime: number;
}

type NERStatus = "idle" | "loading" | "ready" | "processing" | "error";

export type DownloadProgress = {
  modelName: NERModel;
  loaded: number;
  total: number;
  percent: number;
};

export type ProcessingProgress = {
  chunksProcessed: number;
  totalChunks: number;
  totalPages: number;
};

export type NERWorkerMessage =
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
    type: "download_progress";
    modelName: NERModel;
    loaded: number;
    total: number;
    percent: number;
  }
  | {
    type: "processing_progress";
    chunksProcessed: number;
    totalChunks: number;
    totalPages: number;
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

export function useNERWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<NERStatus>("idle");
  const [backend, setBackend] = useState<"webgpu" | "wasm" | null>(null);
  const [modelTokens, setModelTokens] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
  const modelNameRef = useRef<NERModel | null>(null);
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
          model: modelNameRef.current,
          preferredBackend: 'wasm',
        });
        break;

      case "initialized":
        setStatus("ready");
        setError(null);
        break;

      case "status":
        if (event.data.backend) {
          setBackend(event.data.backend);
          setModelTokens(event.data.modelTokens);
        }
        break;

      case "download_progress":
        setDownloadProgress({
          modelName: event.data.modelName,
          loaded: event.data.loaded,
          total: event.data.total,
          percent: event.data.percent,
        });
        break;

      case "processing_progress":
        setProcessingProgress({
          chunksProcessed: event.data.chunksProcessed,
          totalChunks: event.data.totalChunks,
          totalPages: event.data.totalPages,
        });
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

  const initialize = (model: NERModel) => {
    if (!workerRef.current) {
      setStatus("loading");
      setBackend(null);
      setModelTokens([]);
      modelNameRef.current = model;

      const worker = new Worker(NerWorker, { type: "module" });

      worker.onmessage = handleWorkerMessages;
      worker.onerror = handleWorkerErrors;
      workerRef.current = worker;
    }

    return workerRef.current;
  };

  const processText = useCallback(
    (text: string): Promise<NERResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || status !== "ready") {
          reject(new Error(`Worker not ready (status: ${status})`));
          return;
        }

        setStatus("processing");
        const jobId = `job_${crypto.randomUUID()}`;
        pendingJobsRef.current.set(jobId, { resolve, reject });

        workerRef.current.postMessage({
          type: "process",
          text,
          jobId,
        });
      });
    },
    [status]
  );

  const terminate = () => {
    if (!workerRef.current) return;

    workerRef.current.postMessage({ type: "terminate" });
    workerRef.current.terminate();
    workerRef.current = null;
  };

  return {
    backend,
    downloadProgress,
    error,
    modelTokens,
    processingProgress,
    status,
    initialize,
    processText,
    setStatus,
    terminate,
  };
}
