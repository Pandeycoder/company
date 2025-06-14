export const KEY_ACCESS_TOKEN = "access_token";

export function getItem(key) {
  return localStorage.getItem(key);
}

export function setItem(key, value) {
  // Added 'value' as a parameter
  localStorage.setItem(key, value); // Fixed the syntax to include 'value'
}

export function removeItem(key) {
  localStorage.removeItem(key);
}
