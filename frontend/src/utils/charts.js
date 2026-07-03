/**
 * Convert raw values to (x,y) screen points within a box.
 */
export function pointsFromValues(values, width, height, padding = 4) {
  if (!values || values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (values.length - 1 || 1);
  return values.map((v, i) => ({
    x: padding + i * stepX,
    y: padding + (height - padding * 2) * (1 - (v - min) / range),
  }));
}

/**
 * Catmull-Rom→Bezier smooth path through points.
 */
export function smoothPath(points) {
  if (!points || points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

/**
 * Closed area path for gradient fills under a sparkline.
 */
export function areaPath(points, height) {
  if (!points || points.length < 2) return '';
  const top = smoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L ${last.x.toFixed(2)},${height} L ${first.x.toFixed(2)},${height} Z`;
}
