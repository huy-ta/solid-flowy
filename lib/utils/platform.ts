
export function isMac(): boolean {
  return (/mac/i).test(navigator.platform);
}
