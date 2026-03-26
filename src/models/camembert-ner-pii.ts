import { TokenClassificationModel } from "@/models/token-classification-model.ts";

export class CamembertNerPiiModel extends TokenClassificationModel {
  constructor() {
    super('Anonym-IA/V2-camembert-ner-pii-onnx-fp32', {
      aggregationStrategy: 'none',
      partOfWordStrategy: 'bio-tagging',
      ignoredLabels: ['B-DATE', 'I-DATE'],
    });
  }
}
