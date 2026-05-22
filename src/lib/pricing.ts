export function resolvePromotionalUnitPrice(
  price: number,
  promoPrice: number | null | undefined
): number {
  if (promoPrice && promoPrice > 0 && promoPrice < price) {
    return promoPrice;
  }

  return price;
}

