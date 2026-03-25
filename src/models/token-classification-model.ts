import type { ProgressCallback, TokenClassificationPipeline } from "@huggingface/transformers";

import { DATE_REGEX, EMAIL_REGEX, ID_REGEX, IP_ADDRESS_REGEX, URL_REGEX } from "@/lib/utils.ts";
import { CUSTOM_ENTITY_TYPES, type CustomEntity, type GroupedEntity, type NERPipelineEntity } from "@/types/index.ts";
import { CUSTOM_PAGE_SPLIT_TOKEN } from "./utils.ts";

export type NERClassificationPipeline = TokenClassificationPipeline;

export interface EntityWithOffset {
  text: string;
  type: string;
  scores: number[];
  start: number;
  end: number;
  page: number;
};

type AggregationStrategy = 'none' | 'simple';

type PartOfWordStrategy = 'none' | 'double-sharp-tokens' | 'bio-tagging' | 'mixed';

type InitOptions = {
  aggregationStrategy: AggregationStrategy;
  partOfWordStrategy: PartOfWordStrategy;
  ignoredLabels?: string[];
};

type Candidate = NERPipelineEntity & { position: number };

export class TokenClassificationModel {
  public MAX_CHUNK_LENGTH: number = 150;
  public model: string;
  public classifier: NERClassificationPipeline | null = null;
  public fullText: string = "";
  public textGroupedByPage: string[] = [];
  public rawPipelineEntities: NERPipelineEntity[] = [];
  public regexEntities: CustomEntity[] = [];
  public mergedEntities: NERPipelineEntity[] = [];
  public entitiesWithOffset: EntityWithOffset[] = [];
  public entities: GroupedEntity[] = [];

  private local: boolean;
  private aggregationStrategy: AggregationStrategy;
  private partOfWordStrategy: PartOfWordStrategy;
  private ignoredLabels: string[];

  constructor(model: string, initOptions?: InitOptions) {
    const options = initOptions || { aggregationStrategy: 'none', partOfWordStrategy: 'double-sharp-tokens', ignoredLabels: [] };

    this.model = model;
    this.local = model.startsWith('/local-models');
    this.aggregationStrategy = options.aggregationStrategy;
    this.partOfWordStrategy = options.partOfWordStrategy;
    this.ignoredLabels = options.ignoredLabels || [];

    console.log(`TokenClassificationModel instantiated with ${model}`);
  }

  public async initialize(
    backend: 'webgpu' | 'wasm' = 'wasm',
    onProgress?: ProgressCallback,
  ) {
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
        progress_callback: onProgress,
      });
    }

    // @ts-expect-error id2label should exist on model config
    const modelLabels: string[] = (Object.values(this.classifier.model.config.id2label) as string[])
      .filter((token) => token !== 'O')
      .filter((token) => !this.ignoredLabels.includes(token));
    const modelTokens = Array.from(new Set(modelLabels.map((label) => label.replace(/(B|I)-/, ''))));

    return {
      classifier: this.classifier,
      backend,
      modelTokens,
    };
  };

  public async process(
    text: string,
    onProgress?: (info: { chunksProcessed: number; totalChunks: number; totalPages: number }) => void,
  ) {
    this.rawPipelineEntities = [];
    this.entitiesWithOffset = [];
    this.entities = [];
    this.fullText = text.replaceAll(CUSTOM_PAGE_SPLIT_TOKEN, ' ');
    this.textGroupedByPage = text.split(CUSTOM_PAGE_SPLIT_TOKEN);

    // Extract
    this.rawPipelineEntities = await this.extractClassifierEntities(onProgress);
    this.regexEntities = this.extractRegexEntities();

    // Merge
    this.mergedEntities = this.mergeAllEntities(this.rawPipelineEntities, this.regexEntities);

    // Reconstruct indexes (start/end) for each entity
    this.entitiesWithOffset = this.buildOffsets(this.mergedEntities);

    // Aggregate
    this.entities = this.aggregateEntities(this.entitiesWithOffset);

    // Expand partial matches and deduplicate sub-entities
    this.entities = this.expandAndDeduplicateEntities(this.entities);

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

  private async extractClassifierEntities(
    onProgress?: (info: { chunksProcessed: number; totalChunks: number; totalPages: number }) => void,
  ) {
    if (!this.classifier) {
      throw new Error("Please call initialize() first.");
    }

    let rawEntities: NERPipelineEntity[] = [];

    const splittedText = this.fullText.split(' ');
    const totalSize = splittedText.length;
    const totalPages = this.textGroupedByPage.length;

    if (totalSize <= this.MAX_CHUNK_LENGTH) {
      rawEntities = await this.classifier(this.fullText, { ignore_labels: this.ignoredLabels }) as NERPipelineEntity[];
      onProgress?.({ chunksProcessed: 1, totalChunks: 1, totalPages });
    } else {
      const nbTurns = Math.ceil(totalSize / this.MAX_CHUNK_LENGTH);

      for (let i = 0; i < nbTurns; i++) {
        const offset = i * this.MAX_CHUNK_LENGTH;
        const limit = offset + this.MAX_CHUNK_LENGTH;

        const partOfText = splittedText.slice(offset, limit).join(' ');

        const results = (await this.classifier(partOfText, { ignore_labels: this.ignoredLabels })) as NERPipelineEntity[];

        if (rawEntities.length > 0) {
          const lastIndex = rawEntities[rawEntities.length - 1].index;

          // we need to offset indexes because the classifier always starts with index=1
          rawEntities = [...rawEntities, ...results.map((result) => ({ ...result, index: result.index + lastIndex }))];
        } else {
          rawEntities = [...results];
        }

        onProgress?.({ chunksProcessed: i + 1, totalChunks: nbTurns, totalPages });
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

    const regexEntities: CustomEntity[] = [
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

  private mergeAllEntities(rawEntities: NERPipelineEntity[], regexEntities: CustomEntity[]) {
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
    const entitiesWithOffset: EntityWithOffset[] = [];
    const totalPages = this.textGroupedByPage.length;

    let cursor = 0;
    let currentPage = 1;
    let originalText = this.textGroupedByPage[currentPage - 1];

    for (let i = 0; i < rawEntities.length; i++) {
      const token = rawEntities[i];

      if (i > 0) {
        while (cursor < originalText.length && originalText[cursor] !== token.word.replace('##', '')[0]) {
          cursor++;
        }
      }

      if (cursor >= originalText.length && currentPage <= totalPages) {
        cursor = 0;
        currentPage++;
        originalText = this.textGroupedByPage[currentPage - 1];
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
          page: currentPage,
        });
      }
    }

    return entitiesWithOffset;
  }

  private expandAndDeduplicateEntities(entities: GroupedEntity[]): GroupedEntity[] {
    const uniqueTexts = new Map<string, Set<string>>();
    for (const entity of entities) {
      if (entity.type === 'O') continue;
      if (!uniqueTexts.has(entity.type)) {
        uniqueTexts.set(entity.type, new Set());
      }
      uniqueTexts.get(entity.type)!.add(entity.text);
    }

    const expanded = [...entities];
    const existingPositions = new Set(
      entities.filter((e) => e.type !== 'O').map((e) => `${e.page}:${e.start}:${e.end}`)
    );

    const isWordBoundary = (pageText: string, start: number, end: number) => {
      const before = start === 0 || /\W/.test(pageText[start - 1]);
      const after = end === pageText.length || /\W/.test(pageText[end]);
      return before && after;
    };

    for (const [type, texts] of uniqueTexts) {
      for (const text of texts) {
        for (let pageIdx = 0; pageIdx < this.textGroupedByPage.length; pageIdx++) {
          const pageText = this.textGroupedByPage[pageIdx];
          const page = pageIdx + 1;
          let searchFrom = 0;

          while (searchFrom < pageText.length) {
            const pos = pageText.indexOf(text, searchFrom);
            if (pos === -1) break;

            const end = pos + text.length;

            if (isWordBoundary(pageText, pos, end)) {
              const key = `${page}:${pos}:${end}`;
              if (!existingPositions.has(key)) {
                expanded.push({
                  id: crypto.randomUUID(),
                  text,
                  type,
                  score: 0,
                  page,
                  start: pos,
                  end,
                  included: true,
                });
                existingPositions.add(key);
              }
            }

            searchFrom = pos + 1;
          }
        }
      }
    }

    const labeledPositions = new Set(
      expanded.filter((e) => e.type !== 'O').map((e) => `${e.page}:${e.start}:${e.end}`)
    );
    const withoutSupersededO = expanded.filter(
      (e) => e.type !== 'O' || !labeledPositions.has(`${e.page}:${e.start}:${e.end}`)
    );

    const toRemove = new Set<string>();

    for (let i = 0; i < withoutSupersededO.length; i++) {
      const a = withoutSupersededO[i];
      if (a.type === 'O') continue;

      for (let j = 0; j < withoutSupersededO.length; j++) {
        if (i === j) continue;
        const b = withoutSupersededO[j];

        if (
          a.type === b.type &&
          a.page === b.page &&
          a.start <= b.start &&
          a.end >= b.end &&
          (a.start < b.start || a.end > b.end)
        ) {
          toRemove.add(b.id);
        }
      }
    }

    return withoutSupersededO
      .filter((e) => !toRemove.has(e.id))
      .sort((a, b) => a.page - b.page || a.start - b.start);
  }

  private aggregateEntities(entitiesWithOffset: EntityWithOffset[]) {
    const entities = entitiesWithOffset.sort((a, b) => a.start - b.start).sort((a, b) => a.page - b.page);
    const aggregated: GroupedEntity[] = [];
    let current: GroupedEntity | null = null;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const entityType = entity.type.replace('R-', '');
      const currentScore = Math.max(...entity.scores);

      const entityToAggregate = {
        id: crypto.randomUUID(),
        type: entityType,
        text: entity.text,
        score: currentScore,
        page: entity.page,
        start: entity.start,
        end: entity.end,
        included: true,
      };

      if (entity.type === 'O' || CUSTOM_ENTITY_TYPES.includes(entity.type as CustomEntity['type'])) {
        if (current) {
          aggregated.push(current);
          current = null;
        }

        aggregated.push(entityToAggregate);
        continue;
      }

      if (this.aggregationStrategy === 'simple') {
        if (i === 0 || !current) {
          current = entityToAggregate;
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
          current = entityToAggregate;
        }
      } else {
        const [position, currentType] = entity.type.split('-');
        const isBeginning = position === 'B';

        if (isBeginning) {
          aggregated.push({
            ...entityToAggregate,
            type: currentType,
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
            ...entityToAggregate,
            type: currentType,
          });
        }
      }
    }

    return aggregated;
  }
}
