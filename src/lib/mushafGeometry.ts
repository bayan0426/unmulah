export type MushafPoint = { x: number; y: number };
export type MushafAyahRegion = { ayahNumber: number; points: readonly MushafPoint[] };

/** Generic viewer geometry only. It deliberately contains no Quran page coordinates. */
export function findAyahAtPoint(regions: readonly MushafAyahRegion[], point: MushafPoint): number | null {
  return regions.find((region) => pointInPolygon(point, region.points))?.ayahNumber ?? null;
}

export function mapViewerPoint(client: MushafPoint, bounds: { left: number; top: number; width: number; height: number }, sourceWidth: number, sourceHeight: number): MushafPoint | null {
  if (bounds.width <= 0 || bounds.height <= 0 || sourceWidth <= 0 || sourceHeight <= 0) return null;
  return { x: (client.x - bounds.left) * sourceWidth / bounds.width, y: (client.y - bounds.top) * sourceHeight / bounds.height };
}

function pointInPolygon(point: MushafPoint, polygon: readonly MushafPoint[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const a = polygon[current]; const b = polygon[previous];
    const intersects = ((a.y > point.y) !== (b.y > point.y)) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}
