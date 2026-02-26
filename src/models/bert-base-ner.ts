import { TokenClassificationModel } from "@/models/token-classification-model.ts";

export class BertBaseMerModel extends TokenClassificationModel {
  constructor() {
    // Remote
    super('Xenova/bert-base-NER');

    // Local
    // super('/local-models/local-bert-base-NER');
  }
}
