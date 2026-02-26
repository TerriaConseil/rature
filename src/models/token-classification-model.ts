import type { TokenClassificationPipeline } from "@huggingface/transformers";

import { DATE_REGEX, EMAIL_REGEX, ID_REGEX, IP_ADDRESS_REGEX, URL_REGEX } from "@/lib/utils.ts";

export const REGEX_ENTITY_TYPES = ['R-EMAIL', 'R-DATE', 'R-URL', 'R-ID', 'R-IP'] as const;

export type NERClassificationPipeline = TokenClassificationPipeline;

export interface NERPipelineEntity {
  entity: string;
  score: number;
  index: number;
  word: string;
  start?: number;
  end?: number;
};

export interface RegexEntity {
  type: typeof REGEX_ENTITY_TYPES[number];
  word: string;
};

export interface EntityWithOffset {
  text: string;
  type: string;
  scores: number[];
  start: number;
  end: number;
};

export interface GroupedEntity {
  id: string;
  text: string;
  type: string;
  score: number;
  start: number;
  end: number;
};

type AggregationStrategy = 'none' | 'simple';

type PartOfWordStrategy = 'none' | 'double-sharp-tokens' | 'bio-tagging' | 'mixed';

type InitOptions = {
  aggregationStrategy: AggregationStrategy;
  partOfWordStrategy: PartOfWordStrategy;
};

type Candidate = NERPipelineEntity & { position: number };

export class TokenClassificationModel {
  public MAX_CHUNK_LENGTH: number = 150;
  public model: string;
  public classifier: NERClassificationPipeline | null = null;
  public fullText: string = "";
  public rawPipelineEntities: NERPipelineEntity[] = [];
  public regexEntities: RegexEntity[] = [];
  public mergedEntities: NERPipelineEntity[] = [];
  public entitiesWithOffset: EntityWithOffset[] = [];
  public entities: GroupedEntity[] = [];

  private local: boolean;
  private aggregationStrategy: AggregationStrategy;
  private partOfWordStrategy: PartOfWordStrategy;

  constructor(model: string, initOptions?: InitOptions) {
    const options = initOptions || { aggregationStrategy: 'none', partOfWordStrategy: 'double-sharp-tokens' };

    this.model = model;
    this.local = model.startsWith('/local-models');
    this.aggregationStrategy = options.aggregationStrategy;
    this.partOfWordStrategy = options.partOfWordStrategy;

    console.log(`TokenClassificationModel instantiated with ${model}`);
  }

  public async initialize(backend: 'webgpu' | 'wasm' = 'wasm') {
    if (this.classifier === null) {
      const { env, pipeline } = await import("@huggingface/transformers");

      env.allowLocalModels = this.local;
      env.allowRemoteModels = !this.local;

      if (this.local) {
        env.localModelPath = this.model;
      }

      if (env.backends.onnx.wasm) {
        env.backends.onnx.wasm.numThreads = 4;
      }

      this.classifier = await pipeline<'token-classification'>('token-classification', this.model, {
        device: backend,
        dtype: 'fp32',
      });
    }

    // @ts-expect-error id2label should exist on model config
    const modelLabels: string[] = Object.values(this.classifier.model.config.id2label).filter((token) => token !== 'O');
    const modelTokens = Array.from(new Set(modelLabels.map((label) => label.replace(/(B|I)-/, ''))));

    return {
      classifier: this.classifier,
      backend,
      modelTokens,
    };
  };

  public async process(text: string) {
    this.rawPipelineEntities = [];
    this.entitiesWithOffset = [];
    this.entities = [];
    this.fullText = text.replaceAll(/\n+/g, ' ').replaceAll(/\s+/g, ' ');

    // Extract
    this.rawPipelineEntities = await this.extractClassifierEntities();
    this.regexEntities = this.extractRegexEntities();

    // Merge
    this.mergedEntities = this.mergeAllEntities(this.rawPipelineEntities, this.regexEntities);

    // Reconstruct indexes (start/end) for each entity
    this.entitiesWithOffset = this.buildOffsets(this.mergedEntities);

    // Aggregate
    this.entities = this.aggregateEntities();

    return this.entities;
  }

  private isPartOfWord(token: NERPipelineEntity): boolean {
    if (this.partOfWordStrategy === 'double-sharp-tokens') {
      return token.word.startsWith('##');
    }

    if (this.partOfWordStrategy === 'bio-tagging') {
      return token.entity.startsWith('I-');
    }

    if (this.partOfWordStrategy === 'mixed') {
      return token.entity.startsWith('I-') || token.word.startsWith('##');
    }

    // this.partOfWordStrategy === 'none'
    // In this case, the classifier always returns full words and there is no BIO tagging
    // => There is no need to detect if a token is a part of word
    return false;
  }

  private async extractClassifierEntities() {
    if (!this.classifier) {
      throw new Error("Please call initialize() first.");
    }

    let rawEntities: NERPipelineEntity[] = [];

    const splittedText = this.fullText.split(' ');
    const totalSize = splittedText.length;

    if (totalSize <= this.MAX_CHUNK_LENGTH) {
      rawEntities = await this.classifier(this.fullText, { ignore_labels: [] }) as NERPipelineEntity[];
    } else {
      const nbTurns = Math.ceil(totalSize / this.MAX_CHUNK_LENGTH);

      for (let i = 0; i < nbTurns; i++) {
        const offset = i * this.MAX_CHUNK_LENGTH;
        const limit = offset + this.MAX_CHUNK_LENGTH;

        const partOfText = splittedText.slice(offset, limit).join(' ');

        const results = (await this.classifier(partOfText, { ignore_labels: [] })) as NERPipelineEntity[];

        if (rawEntities.length > 0) {
          const lastIndex = rawEntities[rawEntities.length - 1].index;

          // we need to offset indexes because the classifier always starts with index=1
          rawEntities = [...rawEntities, ...results.map((result) => ({ ...result, index: result.index + lastIndex }))];
        } else {
          rawEntities = [...results];
        }
      }
    }

    return rawEntities;
  }

  private extractRegexEntities() {
    const emails = new Set(Array.from(this.fullText.matchAll(EMAIL_REGEX)).map((result) => result[0]));
    const dates = new Set(Array.from(this.fullText.matchAll(DATE_REGEX)).map((result) => result[0]));
    const urls = new Set(Array.from(this.fullText.matchAll(URL_REGEX)).map((result) => result[0]));
    const ids = new Set(Array.from(this.fullText.matchAll(ID_REGEX)).map((result) => result[0]));
    const ipAddresses = new Set(Array.from(this.fullText.matchAll(IP_ADDRESS_REGEX)).map((result) => result[0]));

    const regexEntities: RegexEntity[] = [
      ...Array.from(emails).map((email) => ({
        type: 'R-EMAIL' as const,
        word: email.trim(),
      })),
      ...Array.from(dates).map((date) => ({
        type: 'R-DATE' as const,
        word: date.trim(),
      })),
      ...Array.from(urls).map((url) => ({
        type: 'R-URL' as const,
        word: url.trim(),
      })),
      ...Array.from(ids).map((id) => ({
        type: 'R-ID' as const,
        word: id.trim(),
      })),
      ...Array.from(ipAddresses).map((ipAddress) => ({
        type: 'R-IP' as const,
        word: ipAddress.trim(),
      })),
    ].filter((entity) => !!entity.word);

    return regexEntities;
  }

  private mergeAllEntities(rawEntities: NERPipelineEntity[], regexEntities: RegexEntity[]) {
    if (!this.classifier) {
      throw new Error("Please call initialize() first.");
    }

    const mergedEntities: NERPipelineEntity[] = [...rawEntities];
    const tokenizer = this.classifier.tokenizer;

    for (const entity of regexEntities) {
      const { type, word } = entity;
      const tokenizedWord = tokenizer.tokenize(word).map((token) => token.replace(/^[_▁]/, ''));
      let cursor = 0;

      const firstToken = tokenizedWord[0];

      // Grab all raw entities that match the first token
      const candidates: Candidate[][] = mergedEntities.reduce((acc, entity, index) => {
        if (entity.word !== firstToken) return acc;

        acc.push([{
          ...entity,
          position: index,
        }]);

        return acc;
      }, [] as Candidate[][]);

      // Check if all remaining tokens match the next raw entities
      for (let i = 1; i < tokenizedWord.length; i++) {
        const token = tokenizedWord[i];

        for (let j = 0; j < candidates.length; j++) {
          const candidate = candidates[j];

          if (candidate.length === i) {
            const { position } = candidate[i - 1];
            const newCandidate = mergedEntities[position + 1];

            if (newCandidate.word === token) {
              candidates[j].push({
                ...newCandidate,
                position: position + 1,
              });
            }
          }
        }
      }

      // Candidates that fully match are the ones with the same length as the tokenized word
      const validCandidates = candidates.filter((candidate) => candidate.length === tokenizedWord.length);

      // Finally we find & replace each raw entity found with a valid candidate
      for (const candidate of validCandidates) {
        const start = candidate[0].position - cursor;
        const deleteCount = candidate.length;

        const mergedCandidate = {
          entity: type,
          score: 1,
          index: candidate[0].index,
          word,
        };

        const deletedRows = mergedEntities.splice(start, deleteCount, mergedCandidate);

        cursor += deletedRows.length - 1;
      }
    }

    return mergedEntities;
  }

  private buildOffsets(rawEntities: NERPipelineEntity[]) {
    const originalText = this.fullText;
    const entitiesWithOffset: EntityWithOffset[] = [];
    let cursor = 0;

    for (let i = 0; i < rawEntities.length; i++) {
      const token = rawEntities[i];

      if (i > 0) {
        while (cursor < originalText.length && originalText[cursor] !== token.word.replace('##', '')[0]) {
          cursor++;
        }
      }

      if (this.isPartOfWord(token)) {
        const tokenWord = token.word.replace('##', '');
        const lastToken = entitiesWithOffset[entitiesWithOffset.length - 1];

        const start = lastToken.start;
        const end = cursor + tokenWord.length;

        cursor = end;
        lastToken.text = originalText.slice(start, end);
        lastToken.type = lastToken.type !== 'O' ? lastToken.type : token.entity;
        lastToken.scores.push(token.score);
        lastToken.start = start;
        lastToken.end = end;
      } else {
        const start = cursor;
        const end = start + token.word.length;

        cursor = end;

        entitiesWithOffset.push({
          text: originalText.slice(start, end),
          type: token.entity,
          scores: [token.score],
          start,
          end,
        });
      }
    }

    return entitiesWithOffset;
  }

  private aggregateEntities() {
    const entities = this.entitiesWithOffset.sort((a, b) => a.start - b.start);
    const aggregated: GroupedEntity[] = [];
    let current: GroupedEntity | null = null;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const currentScore = Math.max(...entity.scores);

      if (entity.type === 'O' || REGEX_ENTITY_TYPES.includes(entity.type as RegexEntity['type'])) {
        if (current) {
          aggregated.push(current);
          current = null;
        }

        aggregated.push({
          id: crypto.randomUUID(),
          type: entity.type.replace('R-', ''),
          text: entity.text,
          score: currentScore,
          start: entity.start,
          end: entity.end,
        });
        continue;
      }

      if (this.aggregationStrategy === 'simple') {
        if (i === 0 || !current) {
          current = {
            id: crypto.randomUUID(),
            type: entity.type,
            text: entity.text,
            score: currentScore,
            start: entity.start,
            end: entity.end,
          };
          continue;
        }

        const prev = entities[i - 1];

        const sameLabel = entity.type === prev.type;
        const consecutive = entity.start === prev.end + 1;
        const partOfWord = entity.start === prev.end;

        if (sameLabel && (consecutive || partOfWord)) {
          current.text = consecutive ? `${current.text} ${entity.text}` : `${current.text}${entity.text}`;
          current.score = Math.max(current.score, currentScore);
          current.end = entity.end;
        } else {
          aggregated.push(current);
          current = {
            id: crypto.randomUUID(),
            type: entity.type,
            text: entity.text,
            score: currentScore,
            start: entity.start,
            end: entity.end,
          };
        }
      } else {
        const [position, currentType] = entity.type.split('-');
        const isBeginning = position === 'B';

        if (isBeginning) {
          aggregated.push({
            id: crypto.randomUUID(),
            type: currentType,
            text: entity.text,
            score: currentScore,
            start: entity.start,
            end: entity.end,
          });

          continue;
        }

        const lastEntity = aggregated[aggregated.length - 1];

        if (currentType === lastEntity.type && lastEntity.end && entity.start === (lastEntity.end + 1)) {
          lastEntity.text = `${lastEntity.text} ${entity.text}`;
          lastEntity.score = Math.max(lastEntity.score, currentScore);
          lastEntity.end = entity.end;
        } else {
          aggregated.push({
            id: crypto.randomUUID(),
            type: currentType,
            text: entity.text,
            score: currentScore,
            start: entity.start,
            end: entity.end,
          });
        }
      }
    }

    return aggregated;
  }
}
