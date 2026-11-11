/** Mirrors institution_licence_is_current() so the UI can explain licence status. */
export type LicenceInstitution = {
  active: boolean;
  licence_starts_at: string | null;
  licence_ends_at: string | null;
};

export function isLicenceCurrent(inst: LicenceInstitution, today: string = new Date().toISOString().slice(0, 10)) {
  if (!inst.active) return false;
  if (inst.licence_starts_at && inst.licence_starts_at > today) return false;
  if (inst.licence_ends_at && inst.licence_ends_at < today) return false;
  return true;
}

export function normaliseInviteCode(input: string) {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

export function isPlausibleInviteCode(code: string) {
  return /^[A-Z0-9]{6,32}$/.test(code);
}
