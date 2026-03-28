import { COLORS } from "@/lib/colors.ts";

export const NER_MODELS_NAMES = [
  'bertBaseNer',
  'camembertNerPii',
  'distilbertBaseMultiCasedNer',
  'nermembertLarge4Entities',
  'nermemberta4Entities',
] as const;

export type NERModel = typeof NER_MODELS_NAMES[number];

export const CUSTOM_PAGE_SPLIT_TOKEN = "\n\n[CUSTOM_PAGE_TOKEN]\n\n";

type EntityMeta = {
  dot: string;
  badge: string;
  highlight: string;
};

type NERModelMeta = {
  [key in NERModel]: {
    label: string;
    url: string;
    size: string;
    language: string;
    entities: {
      [key: string]: EntityMeta;
    };
  };
};

export const NER_MODELS: NERModelMeta = {
  bertBaseNer: {
    label: 'BERT Base NER',
    url: 'https://huggingface.co/dslim/bert-base-NER',
    size: '411 MB',
    language: 'English',
    entities: {
      DATE: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      EMAIL: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      ID: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
      IP: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
      LOC: {
        dot: COLORS.dot.green,
        badge: COLORS.badge.green,
        highlight: COLORS.highlight.green,
      },
      MANUAL: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      MISC: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      ORG: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      PER: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      URL: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
    },
  },
  camembertNerPii: {
    label: 'CamemBERT NER PII',
    url: 'https://huggingface.co/Anonym-IA/V2-camembert-ner-pii-onnx-fp32',
    size: '425 MB',
    language: 'Français',
    entities: {
      ACCOUNTNUMBER: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      AGE: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      AMOUNT: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      BITCOINADDRESS: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      CODE_POSTAL: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      COUNTRY: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      CREDITCARD: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      CURRENCY: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      DATE: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      DOB: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      EMAIL: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      ETHEREUMADDRESS: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      EYECOLOR: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      GENDER: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      HEIGHT: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      IBAN: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      ID: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      IP: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      JOBAREA: {
        dot: COLORS.dot.green,
        badge: COLORS.badge.green,
        highlight: COLORS.highlight.green,
      },
      JOBTITLE: {
        dot: COLORS.dot.green,
        badge: COLORS.badge.green,
        highlight: COLORS.highlight.green,
      },
      JOBTYPE: {
        dot: COLORS.dot.green,
        badge: COLORS.badge.green,
        highlight: COLORS.highlight.green,
      },
      MAC: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      MANUAL: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      NOM_PERSONNE: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      NOM_SOCIETE: {
        dot: COLORS.dot.green,
        badge: COLORS.badge.green,
        highlight: COLORS.highlight.green,
      },
      NOM_VOIE: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      NUM_DOSSIER: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      NUM_SECURITE_SOCIALE: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      NUMERO_VOIE: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      PASSWORD: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      PRENOM_PERSONNE: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      REF_CADASTRALE: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      SECONDARYADDRESS: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      STATE: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      TELEPHONE: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      TIME: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      URL: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      USERAGENT: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      USERNAME: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      VEHICLEVIN: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      VEHICLEVRM: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      VILLE: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
    },
  },
  nermembertLarge4Entities: {
    label: 'NERmembert Large 4 entities',
    url: 'https://huggingface.co/CATIE-AQ/NERmembert-large-4entities',
    size: '1.28 GB',
    language: 'Français',
    entities: {
      DATE: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      EMAIL: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      ID: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
      IP: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
      LOC: {
        dot: COLORS.dot.green,
        badge: COLORS.badge.green,
        highlight: COLORS.highlight.green,
      },
      MANUAL: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      MISC: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      ORG: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      PER: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      URL: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
    },
  },
  nermemberta4Entities: {
    label: 'NERmemberta 4 entities',
    url: 'https://huggingface.co/CATIE-AQ/NERmemberta-4entities',
    size: '423 MB',
    language: 'Français',
    entities: {
      DATE: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      EMAIL: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      ID: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
      IP: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
      LOC: {
        dot: COLORS.dot.green,
        badge: COLORS.badge.green,
        highlight: COLORS.highlight.green,
      },
      MANUAL: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      MISC: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      ORG: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      PER: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      URL: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
    },
  },
  distilbertBaseMultiCasedNer: {
    label: 'DistilBERT Base Muti NER',
    url: 'https://huggingface.co/Davlan/distilbert-base-multilingual-cased-ner-hrl',
    size: '514 MB',
    language: 'Multilingue',
    entities: {
      DATE: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      EMAIL: {
        dot: COLORS.dot.amber,
        badge: COLORS.badge.amber,
        highlight: COLORS.highlight.amber,
      },
      ID: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
      IP: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
      LOC: {
        dot: COLORS.dot.green,
        badge: COLORS.badge.green,
        highlight: COLORS.highlight.green,
      },
      MANUAL: {
        dot: COLORS.dot.fuchsia,
        badge: COLORS.badge.fuchsia,
        highlight: COLORS.highlight.fuchsia,
      },
      MISC: {
        dot: COLORS.dot.purple,
        badge: COLORS.badge.purple,
        highlight: COLORS.highlight.purple,
      },
      ORG: {
        dot: COLORS.dot.teal,
        badge: COLORS.badge.teal,
        highlight: COLORS.highlight.teal,
      },
      PER: {
        dot: COLORS.dot.blue,
        badge: COLORS.badge.blue,
        highlight: COLORS.highlight.blue,
      },
      URL: {
        dot: COLORS.dot.red,
        badge: COLORS.badge.red,
        highlight: COLORS.highlight.red,
      },
    },
  },
};
