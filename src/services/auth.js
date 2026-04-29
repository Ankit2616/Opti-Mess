const TOKEN_KEY = "token";
const USER_KEY = "currentUser";

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(
    atob(normalized)
      .split("")
      .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join("")
  );
}

export function decodeToken(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(decodeBase64Url(payload));
  } catch (_error) {
    return null;
  }
}

export function storeAuth({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getDecodedToken() {
  const token = getToken();
  return token ? decodeToken(token) : null;
}

export function getStoredRole() {
  const decoded = getDecodedToken();
  return decoded?.role || "";
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken() && getStoredRole());
}
