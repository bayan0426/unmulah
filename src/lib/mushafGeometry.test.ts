import { describe, expect, it } from 'vitest';
import { findAyahAtPoint, mapViewerPoint } from './mushafGeometry';

describe('generic Mushaf interaction geometry', () => {
  const regions = [{ ayahNumber: 1, points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }] }];
  it('maps a viewer coordinate without assuming any Quran page data', () => {
    expect(mapViewerPoint({ x: 60, y: 45 }, { left: 10, top: 20, width: 100, height: 50 }, 1000, 500)).toEqual({ x: 500, y: 250 });
    expect(mapViewerPoint({ x: 0, y: 0 }, { left: 0, top: 0, width: 0, height: 1 }, 1, 1)).toBeNull();
  });
  it('finds only a polygon containing the selected point', () => {
    expect(findAyahAtPoint(regions, { x: 50, y: 50 })).toBe(1);
    expect(findAyahAtPoint(regions, { x: 150, y: 50 })).toBeNull();
  });
});
