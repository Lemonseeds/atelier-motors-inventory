import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PREVIEW_VEHICLES } from '../client/lib/catalog.js';
import { modelFor } from '../client/lib/vehicleModels.js';

test('every showroom car has a local 3D model with mapped paint and attribution', () => {
  for (const vehicle of PREVIEW_VEHICLES) {
    const model = modelFor(vehicle);
    assert.ok(model, `${vehicle.make} ${vehicle.model} is missing a model`);
    assert.ok(model.credit?.author && model.credit?.url, `${vehicle.model} needs attribution`);
    const file = readFileSync(join(process.cwd(), 'public', model.file));
    assert.equal(file.toString('ascii', 0, 4), 'glTF', `${vehicle.model} is not a GLB file`);
    const jsonLength = file.readUInt32LE(12);
    const gltf = JSON.parse(file.toString('utf8', 20, 20 + jsonLength));
    const materialNames = new Set(gltf.materials.map((material) => material.name));
    for (const name of model.paint) assert.ok(materialNames.has(name), `${vehicle.model} paint material ${name} is missing`);
    for (const name of model.interior || []) assert.ok(materialNames.has(name), `${vehicle.model} interior material ${name} is missing`);
    for (const name of model.performance || []) assert.ok(materialNames.has(name), `${vehicle.model} performance material ${name} is missing`);
    for (const name of model.wheel || []) assert.ok(materialNames.has(name), `${vehicle.model} wheel material ${name} is missing`);
  }
});
