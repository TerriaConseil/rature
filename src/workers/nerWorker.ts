/// <reference lib="webworker" />
import {
  BertBaseMerModel,
  CamembertNerPiiModel,
  DistilbertBaseMultiCasedNerModel,
  NERmembert24Entities,
  NERmemberta4Entities,
  NERmembertLarge4Entities,
} from "@/models/index.ts";
import type { TokenClassificationModel } from "@/models/token-classification-model.ts";
import type { NERModel } from "@/models/utils.ts";

declare const self: DedicatedWorkerGlobalScope;

let nerPipeline: TokenClassificationModel | null = null;
let isInitialized = false;

// Initialize NER pipeline
async function initializePipeline(modelName: NERModel = 'bertBaseNer', preferredBackend: 'wasm' | 'webgpu' = 'wasm') {
  try {
    self.postMessage({ type: "status", message: "Loading model..." });

    if (modelName === 'camembertNerPii') {
      nerPipeline = new CamembertNerPiiModel();
    } else if (modelName === 'distilbertBaseMultiCasedNer') {
      nerPipeline = new DistilbertBaseMultiCasedNerModel();
    } else if (modelName === 'nermembert24Entities') {
      nerPipeline = new NERmembert24Entities();
    } else if (modelName === 'nermembertLarge4Entities') {
      nerPipeline = new NERmembertLarge4Entities();
    } else if (modelName === 'nermemberta4Entities') {
      nerPipeline = new NERmemberta4Entities();
    } else {
      // modelName === 'bertBaseNer'
      nerPipeline = new BertBaseMerModel();
    } 

    const { backend, modelTokens } = await nerPipeline.initialize(preferredBackend);

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

// Process text for NER
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
    await nerPipeline.process(text);
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

// Message handler
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
