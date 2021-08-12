import { isMac } from './platform';

export function isButton(event: MouseEvent, button: number) {
  return event.button === button;
}

export function isPrimaryButton(event: MouseEvent) {
  // button === 0 -> left áka primary mouse button
  return isButton(event, 0);
}

export function isAuxiliaryButton(event: MouseEvent) {
  // button === 1 -> auxiliary áka wheel button
  return isButton(event, 1);
}

export function isSecondaryButton(event: MouseEvent) {
  // button === 2 -> right áka secondary button
  return isButton(event, 2);
}

export function hasPrimaryModifier(event: MouseEvent) {
  if (!isPrimaryButton(event)) {
    return false;
  }

  // Use cmd as primary modifier key for mac OS
  return isMac() ? event.metaKey : event.ctrlKey;
}

export function hasSecondaryModifier(event: MouseEvent) {
  return isPrimaryButton(event) && event.shiftKey;
}
