import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSilentWav } from './generateSilentWav.js';

test('generateSilentWav creates correct buffer length for 1s at 22050Hz', () => {
  const buffer = generateSilentWav(1, 22050);
  assert.strictEqual(buffer.length, 44144);
});
