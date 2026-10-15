export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

/** Test clock that can be advanced manually. */
export class ManualClock implements Clock {
  constructor(private current: Date = new Date("2026-11-02T08:00:00Z")) {}
  now(): Date {
    return new Date(this.current);
  }
  advanceSeconds(seconds: number): void {
    this.current = new Date(this.current.getTime() + seconds * 1000);
  }
}
