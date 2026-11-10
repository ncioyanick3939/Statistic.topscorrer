import test from 'node:test'
import assert from 'node:assert/strict'
import { clientRateKey, validateAskPayload } from '../ask-security.js'

test('rate limiting ignores spoofable forwarded-for header', () => {
  const req = { headers: { 'x-forwarded-for': '8.8.8.8' }, socket: { remoteAddress: '10.0.0.1' } }
  assert.equal(clientRateKey(req), '10.0.0.1')
})
test('AI payload requires a bounded nonempty prompt', () => {
  assert.equal(validateAskPayload({ prompt: 'Frage' }), null)
  assert.equal(validateAskPayload({ prompt: ' ' }), 'invalid_prompt')
  assert.equal(validateAskPayload({ prompt: 'x'.repeat(60001) }), 'invalid_prompt')
  assert.equal(validateAskPayload(null), 'invalid_request')
})
test('AI payload rejects malformed or oversized image attachments', () => {
  assert.equal(validateAskPayload({ prompt: 'a', images: [{ type: 'image/jpeg', data: 'AQID' }] }), null)
  assert.equal(validateAskPayload({ prompt: 'a', images: [{ type: 'image/svg+xml', data: 'AQID' }] }), 'invalid_images')
  assert.equal(validateAskPayload({ prompt: 'a', images: [{ type: 'image/png', data: '!bad' }] }), 'invalid_images')
  assert.equal(validateAskPayload({ prompt: 'a', images: [{ type: 'image/png', data: 'A'.repeat(5_000_001) }] }), 'invalid_images')
  assert.equal(validateAskPayload({ prompt: 'a', images: [{ type: 'image/png', data: '' }, { type: 'image/png', data: '' }] }), 'invalid_images')
})
