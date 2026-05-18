export function nextMomentum(current: number): number {
  return Math.min(5, current + 1);
}

export function chainMultiplier(chain: number): number {
  if (chain >= 4) return 2;
  if (chain === 3) return 1.5;
  if (chain === 2) return 1.2;
  return 1;
}

export function momentumMultiplier(momentum: number): number {
  return 1 + momentum * 0.1;
}
