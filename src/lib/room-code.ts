// Room codes: 6 characters, uppercase letters and digits without look-alikes (0/O, 1/I).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 6;

export function generateRoomCode(random: () => number = Math.random) {
  let out = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return out;
}

export function normaliseRoomCode(input: string) {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

export function isValidRoomCode(code: string) {
  return new RegExp(`^[A-Z0-9]{${ROOM_CODE_LENGTH}}$`).test(code);
}
