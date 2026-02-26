import { TokenClassificationModel } from "@/models/token-classification-model.ts";

export class NERmembert24Entities extends TokenClassificationModel {
  constructor() {
    // Remote
    super('julienkilo/onnx_NERmembert2-4entities', {
      aggregationStrategy: 'simple',
      partOfWordStrategy: 'double-sharp-tokens',
    });

    // Local
    // super('/local-models/onnx_NERmembert2-4entities', {
    //   aggregationStrategy: 'mixed',
    // });
  }
}
