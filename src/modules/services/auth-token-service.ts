export function getBearerToken(): string | null {
  try {
    console.debug('Attempting to retrieve auth token from globalThis.RMU_AUTH');
    const auth = (globalThis as any).RMU_AUTH;
    if (!auth) {
      console.warn('RMU_AUTH is not defined on globalThis');
      return null;
    }
    if (!auth.token) {
      console.warn('RMU_AUTH does not contain a token field');
      console.warn('Current RMU_AUTH value:', auth);
      return null;
    }
    console.debug('Auth token retrieved successfully');
    console.debug('Token value (truncated):', auth.token.substring(0, 10) + '...');
    // Prefer explicit token field
    return auth.token ?? null;
  } catch (e) {
    console.error('Error accessing auth token:', e);
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getBearerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Optional helper to build headers merging content-type when needed
export function mergeJsonHeaders(extra?: Record<string, string>): Record<string, string> {
  return { 'Content-Type': 'application/json', ...getAuthHeaders(), ...(extra || {}) };
}
