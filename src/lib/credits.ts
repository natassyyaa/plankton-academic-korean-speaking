/**
 * B2C credit rules. Keep in sync with the database:
 * - signup bonus is granted by the handle_new_user() trigger
 * - session cost is charged by start_practice_session()
 */
export const SIGNUP_FREE_CREDITS = 3;
export const SESSION_CREDIT_COST = 1;

export type CreditPackage = { id: "pack_1" | "pack_5" | "pack_10"; credits: number; priceKrw: number };

export const CREDIT_PACKAGES: readonly CreditPackage[] = [
  { id: "pack_1", credits: 1, priceKrw: 1900 },
  { id: "pack_5", credits: 5, priceKrw: 8900 },
  { id: "pack_10", credits: 10, priceKrw: 16900 },
];

export function findCreditPackage(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

export function formatKrw(amount: number) {
  return `₩${amount.toLocaleString("en-US")}`;
}

/** Price per credit, rounded to the nearest won (for "save X%" style copy). */
export function pricePerCredit(pkg: CreditPackage) {
  return Math.round(pkg.priceKrw / pkg.credits);
}

export type BillingDecision =
  | { ok: true; billing: "licence" | "credit"; creditsAfter: number }
  | { ok: false; reason: "insufficient_credits" };

/** Mirrors start_practice_session(): a current university licence covers the session, otherwise 1 credit. */
export function decideSessionBilling(input: { balance: number; hasActiveLicence: boolean }): BillingDecision {
  if (input.hasActiveLicence) return { ok: true, billing: "licence", creditsAfter: input.balance };
  if (input.balance < SESSION_CREDIT_COST) return { ok: false, reason: "insufficient_credits" };
  return { ok: true, billing: "credit", creditsAfter: input.balance - SESSION_CREDIT_COST };
}
