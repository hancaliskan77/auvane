declare module 'lunar-javascript' {
  export const Solar: {
    fromYmd(y: number, m: number, d: number): { getLunar(): { getYearInGanZhi(): string } };
  };
}
