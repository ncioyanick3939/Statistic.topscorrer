import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { resolveStaticPath, contentType } from '../static-files.js'

const root = path.resolve('/tmp/topscorer-dist')
test('static assets resolve inside dist', () => {
  assert.equal(resolveStaticPath(root, '/assets/app.js'), path.join(root, 'assets', 'app.js'))
  assert.equal(resolveStaticPath(root, '/'), root)
})
test('traversal and malformed paths are rejected', () => {
  for (const input of ['/../secret', '/%2e%2e/secret', '/assets/../../secret', '/%5csecret', '/%00secret', '/%ZZ']) {
    assert.equal(resolveStaticPath(root, input), null, input)
  }
})
test('static MIME types are safe for Vite assets', () => {
  assert.match(contentType('app.js'), /javascript/)
  assert.match(contentType('style.css'), /css/)
  assert.match(contentType('icon.svg'), /svg/)
  assert.equal(contentType('unknown.bin'), 'application/octet-stream')
})
