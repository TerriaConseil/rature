/// <reference lib="webworker" />
import {
  BertBaseMerModel,
  CamembertNerPiiModel,
  DistilbertBaseMultiCasedNerModel,
  NERmemberta4Entities,
  NERmembertLarge4Entities,
} from "@/models/index.ts";
import type { TokenClassificationModel } from "@/models/token-classification-model.ts";
import { type NERModel } from "@/models/utils.ts";

declare const self: DedicatedWorkerGlobalScope;

let nerPipeline: TokenClassificationModel | null = null;
let isInitialized = false;

async function initializePipeline(modelName: NERModel = 'bertBaseNer', preferredBackend: 'wasm' | 'webgpu' = 'wasm') {
  try {
    self.postMessage({ type: "status", message: "Loading model..." });

    if (modelName === 'camembertNerPii') {
      nerPipeline = new CamembertNerPiiModel();
    } else if (modelName === 'distilbertBaseMultiCasedNer') {
      nerPipeline = new DistilbertBaseMultiCasedNerModel();
    } else if (modelName === 'nermembertLarge4Entities') {
      nerPipeline = new NERmembertLarge4Entities();
    } else if (modelName === 'nermemberta4Entities') {
      nerPipeline = new NERmemberta4Entities();
    } else {
      // modelName === 'bertBaseNer'
      nerPipeline = new BertBaseMerModel();
    } 

    const { backend, modelTokens } = await nerPipeline.initialize(preferredBackend, (progress) => {
      if (progress.status === 'progress' && progress.loaded !== undefined && progress.total !== undefined && progress.total > 0) {
        self.postMessage({
          type: 'download_progress',
          modelName: modelName,
          loaded: progress.loaded,
          total: progress.total,
          percent: Math.round((progress.loaded / progress.total) * 100),
        });
      }
    });

    self.postMessage({
      type: "status",
      message: `Model loaded with ${backend}`,
      backend,
      modelTokens,
    });

    isInitialized = true;
    self.postMessage({ type: "initialized", success: true });
  } catch (error) {
    console.error(error);
    self.postMessage({
      type: "error",
      message: `Failed to initialize: ${error}`,
    });
  }
}

async function processText(text: string, jobId: string) {
  if (!isInitialized || !nerPipeline) {
    self.postMessage({
      type: "error",
      jobId,
      message: "Pipeline not initialized",
    });
    return;
  }

  try {
    const startTime = performance.now();
    await nerPipeline.process(text, (info) => {
      self.postMessage({
        type: 'processing_progress',
        chunksProcessed: info.chunksProcessed,
        totalChunks: info.totalChunks,
        totalPages: info.totalPages,
      });
    });
    const endTime = performance.now();

    self.postMessage({
      type: "result",
      jobId,
      rawEntities: nerPipeline.rawPipelineEntities,
      entities: nerPipeline.entities,
      processingTime: endTime - startTime,
    });
  } catch (error) {
    console.error(error);

    self.postMessage({
      type: "error",
      jobId,
      message: `Processing failed: ${error}`,
    });
  }
}

self.onmessage = async (event) => {
  const { type } = event.data;

  switch (type) {
    case "init": {
      await initializePipeline(event.data.model, event.data.preferredBackend);
      break;
    }

    case "process":
      await processText(event.data.text, event.data.jobId);
      break;

    case "terminate":
      self.close();
      break;
  }
};

self.postMessage({ type: "ready" });
