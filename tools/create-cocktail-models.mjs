import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirectory = join(projectRoot, "assets", "models");
const sides = 48;

function createModel(flavor) {
  const materials = [
    { name: "Verre clair", color: [0.91, 0.94, 0.88, 0.3], roughness: 0.08, alpha: true },
    { name: "Base rouge", color: flavor === "soleil" ? [0.62, 0.08, 0.18, 1] : [0.87, 0.35, 0.08, 1] },
    { name: "Milieu fruité", color: flavor === "soleil" ? [0.93, 0.29, 0.20, 1] : [0.96, 0.60, 0.17, 1] },
    { name: "Agrumes", color: flavor === "soleil" ? [1, 0.65, 0.24, 1] : [0.98, 0.73, 0.24, 1] },
    { name: "Paille ivoire", color: [0.95, 0.87, 0.66, 1], metallic: 0.05, roughness: 0.35 },
    { name: "Écorce d’orange", color: [0.96, 0.37, 0.08, 1], roughness: 0.42 },
    { name: "Pulpe d’agrume", color: [1, 0.79, 0.36, 1], roughness: 0.55 },
    { name: "Menthe", color: [0.20, 0.45, 0.23, 1], roughness: 0.75 },
    { name: "Glaçons", color: [0.75, 0.86, 0.82, 0.56], roughness: 0.13, alpha: true },
    { name: "Reflet du verre", color: [0.96, 0.97, 0.90, 0.68], roughness: 0.12, alpha: true },
  ];
  const meshes = [];

  function addMesh(name, material, positions, normals, indices) {
    meshes.push({ name, material, positions, normals, indices });
  }

  function addFrustum(name, material, bottomRadius, topRadius, bottomY, topY, segments = sides, capBottom = true, capTop = true) {
    const positions = [];
    const normals = [];
    const indices = [];
    for (let ring = 0; ring < 2; ring++) {
      const radius = ring === 0 ? bottomRadius : topRadius;
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        positions.push(cosine * radius, ring === 0 ? bottomY : topY, sine * radius);
        normals.push(cosine, (bottomRadius - topRadius) / (topY - bottomY), sine);
      }
    }
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const a = i;
      const b = next;
      const c = segments + i;
      const d = segments + next;
      indices.push(a, c, b, b, c, d);
    }
    function addCap(y, radius, normalY) {
      if (radius === 0) return;
      const centerIndex = positions.length / 3;
      positions.push(0, y, 0);
      normals.push(0, normalY, 0);
      const ringStart = positions.length / 3;
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        normals.push(0, normalY, 0);
      }
      for (let i = 0; i < segments; i++) {
        const a = ringStart + i;
        const b = ringStart + ((i + 1) % segments);
        indices.push(...(normalY < 0 ? [centerIndex, a, b] : [centerIndex, b, a]));
      }
    }
    if (capBottom) addCap(bottomY, bottomRadius, -1);
    if (capTop) addCap(topY, topRadius, 1);
    addMesh(name, material, positions, normals, indices);
  }

  function addGlassShell() {
    const positions = [];
    const normals = [];
    const indices = [];
    const profile = [
      [0.28, 0.12], [0.34, 0.12], [0.42, 2.38],
      [0.385, 2.38], [0.315, 0.23], [0, 0.23], [0, 0.12],
    ];
    for (let ring = 0; ring < profile.length; ring++) {
      const [radius, y] = profile[ring];
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle);
        const z = Math.sin(angle);
        positions.push(x * radius, y, z * radius);
        const next = profile[(ring + 1) % profile.length];
        const slope = (profile[ring][1] - next[1]) / Math.max(0.001, Math.abs(next[0] - radius));
        const normalLength = Math.hypot(1, slope);
        normals.push(x / normalLength, slope / normalLength, z / normalLength);
      }
    }
    for (let ring = 0; ring < profile.length; ring++) {
      const currentStart = ring * sides;
      const nextStart = ((ring + 1) % profile.length) * sides;
      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        indices.push(currentStart + i, currentStart + next, nextStart + i);
        indices.push(currentStart + next, nextStart + next, nextStart + i);
      }
    }
    addMesh("Verre haut", 0, positions, normals, indices);
  }

  function addBox(name, material, center, size) {
    const [cx, cy, cz] = center;
    const [sx, sy, sz] = size.map((value) => value / 2);
    const faces = [
      [[1, 0, 0], [[sx, -sy, -sz], [sx, sy, -sz], [sx, sy, sz], [sx, -sy, sz]]],
      [[-1, 0, 0], [[-sx, -sy, sz], [-sx, sy, sz], [-sx, sy, -sz], [-sx, -sy, -sz]]],
      [[0, 1, 0], [[-sx, sy, -sz], [-sx, sy, sz], [sx, sy, sz], [sx, sy, -sz]]],
      [[0, -1, 0], [[-sx, -sy, sz], [-sx, -sy, -sz], [sx, -sy, -sz], [sx, -sy, sz]]],
      [[0, 0, 1], [[sx, -sy, sz], [sx, sy, sz], [-sx, sy, sz], [-sx, -sy, sz]]],
      [[0, 0, -1], [[-sx, -sy, -sz], [-sx, sy, -sz], [sx, sy, -sz], [sx, -sy, -sz]]],
    ];
    const positions = [];
    const normals = [];
    const indices = [];
    for (const [normal, vertices] of faces) {
      const first = positions.length / 3;
      for (const [x, y, z] of vertices) {
        positions.push(cx + x, cy + y, cz + z);
        normals.push(...normal);
      }
      indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
    }
    addMesh(name, material, positions, normals, indices);
  }

  function addCylinderBetween(name, material, start, end, radius, segments = 24) {
    const direction = end.map((value, index) => value - start[index]);
    const length = Math.hypot(...direction);
    const axis = direction.map((value) => value / length);
    const reference = Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = [axis[1] * reference[2] - axis[2] * reference[1], axis[2] * reference[0] - axis[0] * reference[2], axis[0] * reference[1] - axis[1] * reference[0]];
    const uLength = Math.hypot(...u);
    for (let i = 0; i < 3; i++) u[i] /= uLength;
    const v = [axis[1] * u[2] - axis[2] * u[1], axis[2] * u[0] - axis[0] * u[2], axis[0] * u[1] - axis[1] * u[0]];
    const positions = [];
    const normals = [];
    const indices = [];
    for (const point of [start, end]) {
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const nx = Math.cos(angle) * u[0] + Math.sin(angle) * v[0];
        const ny = Math.cos(angle) * u[1] + Math.sin(angle) * v[1];
        const nz = Math.cos(angle) * u[2] + Math.sin(angle) * v[2];
        positions.push(point[0] + nx * radius, point[1] + ny * radius, point[2] + nz * radius);
        normals.push(nx, ny, nz);
      }
    }
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      indices.push(i, next, segments + i, next, segments + next, segments + i);
    }
    addMesh(name, material, positions, normals, indices);
  }

  function addEllipsoid(name, material, center, radii) {
    const positions = [];
    const normals = [];
    const indices = [];
    const latitudes = 14;
    const longitudes = 20;
    for (let lat = 0; lat <= latitudes; lat++) {
      const theta = (lat / latitudes) * Math.PI;
      for (let lon = 0; lon <= longitudes; lon++) {
        const phi = (lon / longitudes) * Math.PI * 2;
        const nx = Math.sin(theta) * Math.cos(phi);
        const ny = Math.cos(theta);
        const nz = Math.sin(theta) * Math.sin(phi);
        positions.push(center[0] + nx * radii[0], center[1] + ny * radii[1], center[2] + nz * radii[2]);
        normals.push(nx, ny, nz);
      }
    }
    for (let lat = 0; lat < latitudes; lat++) {
      for (let lon = 0; lon < longitudes; lon++) {
        const a = lat * (longitudes + 1) + lon;
        const b = a + longitudes + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    addMesh(name, material, positions, normals, indices);
  }

  addGlassShell();
  addFrustum("Pied du verre", 9, 0.34, 0.34, 0.08, 0.14, sides, true, true);
  addFrustum("Cocktail", 1, 0.30, 0.35, 0.23, 0.92, sides, true, true);
  addFrustum("Cocktail", 2, 0.35, 0.38, 0.92, 1.72, sides, false, true);
  addFrustum("Cocktail", 3, 0.38, 0.40, 1.72, 2.22, sides, false, true);
  addFrustum("Bord du verre", 9, 0.42, 0.42, 2.37, 2.42, sides, true, true);
  addFrustum("Bague du pied", 9, 0.34, 0.34, 0.08, 0.15, sides, true, true);

  addBox("Glaçon", 8, [-0.16, 2.03, 0.04], [0.19, 0.22, 0.18]);
  addBox("Glaçon", 8, [0.12, 2.13, -0.1], [0.18, 0.19, 0.17]);
  addCylinderBetween("Paille", 4, [0.19, 1.82, 0.12], [0.47, 2.86, 0.12], 0.025, 16);
  addCylinderBetween("Rondelle d’orange", 5, [-0.04, 2.48, 0.02], [0.08, 2.56, 0.35], 0.28, 40);
  addCylinderBetween("Chair d’orange", 6, [-0.025, 2.491, 0.035], [0.055, 2.537, 0.257], 0.205, 40);
  addEllipsoid("Feuille de menthe", 7, [-0.18, 2.49, 0.23], [0.16, 0.035, 0.07]);
  addEllipsoid("Feuille de menthe", 7, [0.22, 2.51, 0.22], [0.14, 0.035, 0.065]);

  return { materials, meshes, title: flavor === "soleil" ? "Cocktail Soleil" : "Cocktail Orange" };
}

function toGlb({ materials, meshes, title }) {
  const chunks = [];
  const bufferViews = [];
  const accessors = [];
  const gltfMeshes = [];
  let byteOffset = 0;

  function append(data, target, componentType, type, count, bounds = null) {
    while (byteOffset % 4 !== 0) {
      chunks.push(Buffer.from([0]));
      byteOffset++;
    }
    const buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    const viewIndex = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: buffer.byteLength, target });
    chunks.push(buffer);
    byteOffset += buffer.byteLength;
    const accessor = { bufferView: viewIndex, componentType, count, type };
    if (bounds) {
      accessor.min = bounds.min;
      accessor.max = bounds.max;
    }
    const accessorIndex = accessors.length;
    accessors.push(accessor);
    return accessorIndex;
  }

  for (const mesh of meshes) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < mesh.positions.length; i++) {
      const axis = i % 3;
      min[axis] = Math.min(min[axis], mesh.positions[i]);
      max[axis] = Math.max(max[axis], mesh.positions[i]);
    }
    const positionAccessor = append(new Float32Array(mesh.positions), 34962, 5126, "VEC3", mesh.positions.length / 3, { min, max });
    const normalAccessor = append(new Float32Array(mesh.normals), 34962, 5126, "VEC3", mesh.normals.length / 3);
    const indexAccessor = append(new Uint16Array(mesh.indices), 34963, 5123, "SCALAR", mesh.indices.length);
    gltfMeshes.push({ name: mesh.name, primitives: [{ attributes: { POSITION: positionAccessor, NORMAL: normalAccessor }, indices: indexAccessor, material: mesh.material, mode: 4 }] });
  }

  const gltfMaterials = materials.map((material) => ({
    name: material.name,
    pbrMetallicRoughness: {
      baseColorFactor: material.color,
      metallicFactor: material.metallic ?? 0,
      roughnessFactor: material.roughness ?? 0.4,
    },
    ...(material.alpha ? { alphaMode: "BLEND", doubleSided: true } : {}),
  }));
  const json = {
    asset: { version: "2.0", generator: "Meiji cocktail model generator" },
    scene: 0,
    scenes: [{ name: title, nodes: meshes.map((_, index) => index) }],
    nodes: meshes.map((mesh, index) => ({ name: mesh.name, mesh: index })),
    meshes: gltfMeshes,
    materials: gltfMaterials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: byteOffset }],
  };
  let jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  while (jsonBuffer.length % 4 !== 0) jsonBuffer = Buffer.concat([jsonBuffer, Buffer.from([0x20])]);
  const binBuffer = Buffer.concat(chunks);
  const totalLength = 12 + 8 + jsonBuffer.length + 8 + binBuffer.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binBuffer.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jsonHeader, jsonBuffer, binHeader, binBuffer]);
}

for (const flavor of ["soleil", "orange"]) {
  const fileName = `cocktail-${flavor}.glb`;
  writeFileSync(join(outputDirectory, fileName), toGlb(createModel(flavor)));
  console.log(`Created ${fileName}`);
}
