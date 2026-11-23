import { useEffect, useRef } from 'react'

export function useMerchantPrefill(
  prefillSlug: string | undefined,
  merchants: readonly { slug: string; name: string }[],
  onPrefill: (merchant: { slug: string; name: string } | null) => void,
): void {
  const prevSlug = useRef(prefillSlug)
  const onPrefillRef = useRef(onPrefill)

  useEffect(() => {
    onPrefillRef.current = onPrefill
  }, [onPrefill])

  useEffect(() => {
    if (prevSlug.current === prefillSlug) return
    prevSlug.current = prefillSlug
    const matched = prefillSlug ? (merchants.find((item) => item.slug === prefillSlug) ?? null) : null
    onPrefillRef.current(matched)
  }, [prefillSlug, merchants])
}
