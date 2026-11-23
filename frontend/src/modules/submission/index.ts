export {
  submissionSourceDto,
  type SubmissionRequest,
  type SubmissionResponse,
  type SubmissionSource,
} from './api/submission.dto.ts'
export { submitOfferMutationOptions, type SubmittedOffer } from './api/submission.mutations.ts'
export { submissionQueries, type DuplicateMatch } from './api/submission.queries.ts'
export { useDuplicateCheck, type DuplicateCheckMatch } from './hooks/useDuplicateCheck.ts'
export { useMerchantPrefill } from './hooks/useMerchantPrefill.ts'
export { useSubmitOffer, type UseSubmitOfferResult } from './hooks/useSubmitOffer.ts'
export {
  CODE_PATTERN,
  filterMerchantSuggestions,
  findMerchantSlug,
  INITIAL_SUBMISSION_VALUES,
  SELF_CHECK_OPTIONS,
  SUBMISSION_SOURCES,
  submissionFormSchema,
  toSubmissionRequest,
  type SubmissionFormValues,
} from './model/schema.ts'
