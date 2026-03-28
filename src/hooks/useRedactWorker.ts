import { useCallback } from 'react';
import { PDFDocument } from 'mupdf';
import { Buffer } from 'buffer';

import type { GroupedEntity } from '@/types/index.ts';
import RedactWorkerUrl from '@/workers/redactWorker.ts?worker&url';

export function useRedactWorker() {
  const redact = useCallback(
    (file: File, entities: GroupedEntity[]): Promise<PDFDocument> => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(RedactWorkerUrl, { type: 'module' });
        const jobId = crypto.randomUUID();

        worker.onmessage = (event: MessageEvent) => {
          const data = event.data;

          if (data.type === 'ready') {
            file.arrayBuffer().then(fileBuffer => {
              worker.postMessage({ type: 'redact', jobId, fileBuffer, entities }, [fileBuffer]);
            }).catch(err => {
              worker.terminate();
              reject(err);
            });
          } else if (data.type === 'result' && data.jobId === jobId) {
            worker.terminate();
            try {
              const doc = PDFDocument.openDocument(
                Buffer.from(data.pdfBuffer as Uint8Array),
                'application/pdf'
              ) as PDFDocument;
              resolve(doc);
            } catch (err) {
              reject(err);
            }
          } else if (data.type === 'error' && data.jobId === jobId) {
            worker.terminate();
            reject(new Error(data.message as string));
          }
        };

        worker.onerror = (err) => {
          worker.terminate();
          reject(new Error(`Redact worker error: ${err.message}`));
        };
      });
    },
    []
  );

  return { redact };
}
