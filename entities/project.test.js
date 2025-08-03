import test from 'node:test';
import assert from 'node:assert/strict';
import { Project } from './project.js';

test('Project.create returns object containing original data and numeric id', async () => {
  const data = { name: 'My Project', description: 'Sample' };
  const result = await Project.create(data);

  // includes original data
  assert.deepStrictEqual(result, { ...data, id: result.id });
  // id property is numeric
  assert.strictEqual(typeof result.id, 'number');
});
