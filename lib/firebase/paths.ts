export const CLIPS = "clips";
export const PROFILES = "profiles";
export const USERNAMES = "usernames";

export function imagePath(uid: string, clipId: string, ext: string) {
  return `${uid}/${clipId}.${ext}`;
}

export function ownsPath(uid: string, path: string) {
  return path.startsWith(`${uid}/`);
}
