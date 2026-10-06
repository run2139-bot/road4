const smooth = (t: number) => t * t * (3 - 2 * t);

/** [시작고도, 최고고도, 종료고도]로 그래프용 [거리, 고도] 배열을 만듭니다. */
export function generateElevationData(
  distance: number,
  start: number,
  peak: number,
  end: number,
  steps = 10,
): [number, number][] {
  const peakAt = 0.6;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const elevation =
      t <= peakAt
        ? start + (peak - start) * smooth(t / peakAt)
        : peak + (end - peak) * smooth((t - peakAt) / (1 - peakAt));
    return [Math.round(distance * t * 10) / 10, Math.round(elevation)];
  });
}

export function summarizeElevation(data: [number, number][]) {
  const values = data.map(([, e]) => e);
  return {
    start: values[0] ?? 0,
    peak: Math.max(...values, 0),
    end: values[values.length - 1] ?? 0,
  };
}
