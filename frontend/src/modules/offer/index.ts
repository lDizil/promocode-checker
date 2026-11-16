export { offerQueries } from './api/offer.queries.ts'
export { useMerchantOffers, type MerchantOffers } from './hooks/useMerchantOffers.ts'
export { useCopyCode, type CopyCodeResult } from './hooks/useCopyCode.ts'
export { OfferFeedback } from './modules/feedback/index.ts'
export { buildConditions, type Condition, type ConditionKind } from './model/conditions.ts'
export { offerFiltersSearch, type OfferFilters, type OfferSummary } from './model/filters.ts'
export { formatAgo, formatDate, formatHeadline, formatValue, isStale } from './model/format.ts'
export {
  isFreeOffer,
  scoreLevel,
  type Availability,
  type Offer,
  type OfferKind,
  type OfferSort,
  type Requirement,
  type ScoreLevel,
} from './model/offer.ts'
export { AdLabel, type AdLabelProps } from './ui/AdLabel.tsx'
export { AvailabilityBadge, type AvailabilityBadgeProps } from './ui/AvailabilityBadge.tsx'
export { CodeBox, type CodeBoxProps, type CodeBoxState } from './ui/CodeBox.tsx'
export { ConditionItem, type ConditionItemProps } from './ui/ConditionItem.tsx'
export { ConditionList, type ConditionListProps } from './ui/ConditionList.tsx'
export { OfferCard, type OfferCardProps } from './ui/OfferCard.tsx'
export { OfferCardSkeleton, type OfferCardSkeletonProps } from './ui/OfferCardSkeleton.tsx'
export { RequirementChip, type RequirementChipProps, type RequirementKind } from './ui/RequirementChip.tsx'
export { ScoreBadge, type ScoreBadgeProps } from './ui/ScoreBadge.tsx'
export { ScoreBar, type ScoreBarProps } from './ui/ScoreBar.tsx'
export { SourceLink, type SourceLinkProps } from './ui/SourceLink.tsx'
export { VerifiedMeta, type VerifiedMetaProps } from './ui/VerifiedMeta.tsx'
