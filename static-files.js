import path from 'node:path'

const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

export function contentType(file) {
  return TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream'
}

export function resolveStaticPath(root, pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.includes('\\')) return null
  let decoded
  try { decoded = decodeURIComponent(pathname) } catch { return null }
  if (decoded.includes('\\') || decoded.includes('\0') || decoded.includes('?') || decoded.includes('#')) return null
  const segments = decoded.split('/')
  if (segments.some(segment => segment === '..' || segment === '.')) return null
  const file = path.resolve(root, '.' + decoded)
  const relative = path.relative(root, file)
  if (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) return null
  return file
}
