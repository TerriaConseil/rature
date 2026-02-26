import { TokenClassificationModel } from "@/models/token-classification-model.ts";

export class NERmembertLarge4Entities extends TokenClassificationModel {
  constructor() {
    // Remote
    super('julienkilo/onnx_NERmembert-large-4entities', {
      aggregationStrategy: 'simple',
      partOfWordStrategy: 'none',
    });

    // Local
    // super('/local-models/onnx_NERmembert2-4entities', {
    //   aggregationStrategy: 'mixed',
    // });
  }
}
