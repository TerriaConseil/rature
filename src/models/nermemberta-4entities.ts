import { TokenClassificationModel } from "@/models/token-classification-model.ts";

export class NERmemberta4Entities extends TokenClassificationModel {
  constructor() {
    // Remote
    super('julienkilo/onnx_NERmemberta-4entities', {
      aggregationStrategy: 'simple',
      partOfWordStrategy: 'double-sharp-tokens',
    });

    // Local
    // super('/local-models/onnx_NERmemberta-4entities', {
    //   aggregationStrategy: 'mixed',
    // });
  }
}
