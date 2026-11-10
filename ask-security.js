export function clientRateKey(req) {
  // The socket address cannot be forged with a user-supplied X-Forwarded-For header.
  // A trusted reverse proxy may cause multiple clients to share one bucket.
  return req.socket?.remoteAddress || 'unknown'
}

export function validateAskPayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'invalid_request'
  if (typeof data.prompt !== 'string' || !data.prompt.trim() || data.prompt.length > 60000) return 'invalid_prompt'
  if (data.images !== undefined) {
    if (!Array.isArray(data.images) || data.images.length > 1) return 'invalid_images'
    for (const img of data.images) {
      if (!img || typeof img !== 'object' || !['image/jpeg', 'image/png', 'image/webp'].includes(img.type) ||
          typeof img.data !== 'string' || img.data.length > 5_000_000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(img.data)) return 'invalid_images'
    }
  }
  return null
}
