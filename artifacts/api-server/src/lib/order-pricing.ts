import type { OrderInquiryInput } from "@workspace/api-zod";

export const unitPriceUsd = 30;

type PackSize = OrderInquiryInput["bottleCount"];

const packSizes = [1, 2, 3, 5, 10] as const satisfies readonly PackSize[];
const discounts: Record<PackSize, number> = {
  1: 0,
  2: 3,
  3: 5,
  5: 10,
  10: 15,
};

export function calculatePackPrice(bottleCount: PackSize) {
  const discountPercent = discounts[bottleCount];
  const regularPriceUsd = unitPriceUsd * bottleCount;
  const totalPriceUsd =
    Math.round(regularPriceUsd * (100 - discountPercent)) / 100;

  return {
    bottleCount,
    discountPercent,
    regularPriceUsd,
    totalPriceUsd,
    savingsUsd: Math.round((regularPriceUsd - totalPriceUsd) * 100) / 100,
  };
}

export function buildOrderPricing() {
  return {
    currency: "USD" as const,
    unitPriceUsd,
    packs: packSizes.map(calculatePackPrice),
  };
}
