const fs = require('fs');

function sqDist(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}

function sqSegDist(p, p1, p2) {
  let x = p1[0], y = p1[1];
  let dx = p2[0] - x, dy = p2[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

function simplifyDouglasPeucker(points, sqTolerance) {
  if (points.length <= 2) return points;

  let maxSqDist = sqTolerance;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = sqSegDist(points[i], points[0], points[points.length - 1]);
    if (d > maxSqDist) {
      index = i;
      maxSqDist = d;
    }
  }

  if (maxSqDist > sqTolerance) {
    const left = simplifyDouglasPeucker(points.slice(0, index + 1), sqTolerance);
    const right = simplifyDouglasPeucker(points.slice(index), sqTolerance);
    return left.slice(0, left.length - 1).concat(right);
  }

  return [points[0], points[points.length - 1]];
}

function roundCoord(c) {
  return [Math.round(c[0] * 1000) / 1000, Math.round(c[1] * 1000) / 1000];
}

function simplifyCoords(coords, sqTol, isMulti) {
  if (typeof coords[0] === 'number') {
    return roundCoord(coords);
  }
  if (typeof coords[0][0] === 'number') {
    // Array of points: ring
    const simplified = simplifyDouglasPeucker(coords, sqTol);
    if (simplified.length < 4) return coords.map(roundCoord);
    return simplified.map(roundCoord);
  }
  return coords.map(c => simplifyCoords(c, sqTol, isMulti));
}

const raw = fs.readFileSync('public/india.geojson', 'utf-8');
const geojson = JSON.parse(raw);

// sqTolerance ~ 0.045 deg squared = ~0.002
const tol = 0.002;

for (const feature of geojson.features) {
  if (feature.geometry && feature.geometry.coordinates) {
    feature.geometry.coordinates = simplifyCoords(feature.geometry.coordinates, tol);
  }
  // Strip heavy properties if any, keep name/state
  const props = feature.properties || {};
  const name = props.NAME_1 || props.st_nm || props.NAME || props.STATE || props.name || '';
  feature.properties = { name };
}

const out = JSON.stringify(geojson);
fs.writeFileSync('public/india.geojson', out, 'utf-8');
console.log('Simplified GeoJSON written. New size:', (out.length / 1024).toFixed(1), 'KB');
