export const NER_MODELS_NAMES = [
  'bertBaseNer',
  'camembertNerPii',
  'distilbertBaseMultiCasedNer',
  'nermembertLarge4Entities',
  'nermembert24Entities',
  'nermemberta4Entities',
] as const;

export type NERModel = typeof NER_MODELS_NAMES[number];

export const NER_MODELS: { [key in NERModel]: { label: string; url: string; }} = {
  bertBaseNer: {
    label: 'BERT Base NER 🇬🇧',
    url: 'https://huggingface.co/Xenova/bert-base-NER',
  },
  camembertNerPii: {
    label: 'CamemBERT NER PII 🇫🇷',
    url: 'https://huggingface.co/Anonym-IA/V2-camembert-ner-pii-onnx-fp32',
  },
  nermembert24Entities: {
    label: 'NERmembert2 4 entities 🇫🇷',
    url: 'https://huggingface.co/CATIE-AQ/NERmembert2-4entities',
  },
  nermembertLarge4Entities: {
    label: 'NERmembert Large 4 entities 🇫🇷',
    url: 'https://huggingface.co/CATIE-AQ/NERmembert-large-4entities',
  },
  nermemberta4Entities: {
    label: 'NERmemberta 4 entities 🇫🇷',
    url: 'https://huggingface.co/CATIE-AQ/NERmemberta-4entities',
  },
  distilbertBaseMultiCasedNer: {
    label: 'DistilBERT Base Muti NER 🌐',
    url: 'https://huggingface.co/Davlan/distilbert-base-multilingual-cased-ner-hrl',
  },
};
