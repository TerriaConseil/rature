import { TokenClassificationModel } from "@/models/token-classification-model.ts";

export class DistilbertBaseMultiCasedNerModel extends TokenClassificationModel {
  constructor(){
    super('vgorce/distilbert-base-multi-cased-ner', {
      aggregationStrategy: 'none',
      partOfWordStrategy: 'mixed',
      ignoredLabels: ['B-DATE', 'I-DATE'],
    });
  }
}
