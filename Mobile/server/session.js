const { createPublicKey, verify } = require('node:crypto');

let cachedKeys;
let expiresAt = 0;

async function authenticate(req) {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const encodedHost = publishableKey?.match(/^pk_(?:test|live)_(.+)$/)?.[1];
  const decoded = encodedHost ? Buffer.from(encodedHost, 'base64url').toString('utf8') : '';
  const inferredIssuer = /^[a-z0-9.-]+\$/i.test(decoded) ? 'https://' + decoded.slice(0, -1) : undefined;
  const issuer = process.env.CLERK_ISSUER?.replace(/\/$/, '') || inferredIssuer;
  if (!issuer || !issuer.startsWith('https://')) return null;

  const token = req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, claims] = parts.slice(0, 2).map(part =>
      JSON.parse(Buffer.from(part, 'base64url').toString())
    );
    const now = Date.now() / 1000;
    if (header.alg !== 'RS256' || !header.kid || claims.iss !== issuer ||
        typeof claims.sub !== 'string' || !claims.sub || !Number.isFinite(claims.exp) ||
        claims.exp <= now || (claims.nbf != null && (!Number.isFinite(claims.nbf) || claims.nbf > now))) return null;

    const authorizedParties = process.env.CLERK_AUTHORIZED_PARTIES?.split(',').map(value => value.trim());
    if (claims.sts === 'pending' || (claims.azp && authorizedParties && !authorizedParties.includes(claims.azp))) return null;

    if (Date.now() >= expiresAt) {
      const response = await fetch(issuer + '/.well-known/jwks.json', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return null;
      cachedKeys = (await response.json()).keys;
      expiresAt = Date.now() + 5 * 60 * 1000;
    }
    const jwk = cachedKeys.find(key => key.kid === header.kid && key.kty === 'RSA');
    if (!jwk || !verify('RSA-SHA256', Buffer.from(parts.slice(0, 2).join('.')),
      createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url'))) return null;
    return claims.sub;
  } catch {
    return null;
  }
}

module.exports = { authenticate };
