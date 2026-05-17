export const QUEUE_STATFORM = 'statform-generation';
export const QUEUE_CLASSIFY = 'product-classification';

export const JOB_GENERATE_XML = 'generate-xml';
export const JOB_CLASSIFY_ORG = 'classify-org';

export const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: { age: 7 * 24 * 3600, count: 1000 },
  removeOnFail: { age: 30 * 24 * 3600 },
};
