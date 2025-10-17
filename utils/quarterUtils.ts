export function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  let quarter: number;
  if (month <= 3) {
    quarter = 1;
  } else if (month <= 6) {
    quarter = 2;
  } else if (month <= 9) {
    quarter = 3;
  } else {
    quarter = 4;
  }

  return `Q${quarter} ${year}`;
}

export function getQuarterFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  let quarter: number;
  if (month <= 3) {
    quarter = 1;
  } else if (month <= 6) {
    quarter = 2;
  } else if (month <= 9) {
    quarter = 3;
  } else {
    quarter = 4;
  }

  return `Q${quarter} ${year}`;
}

export function compareQuarters(q1: string, q2: string): number {
  const [quarter1, year1] = q1.split(' ');
  const [quarter2, year2] = q2.split(' ');

  const y1 = parseInt(year1);
  const y2 = parseInt(year2);

  if (y1 !== y2) {
    return y1 - y2;
  }

  const qNum1 = parseInt(quarter1.replace('Q', ''));
  const qNum2 = parseInt(quarter2.replace('Q', ''));

  return qNum1 - qNum2;
}

export function isCurrentQuarter(quarter: string): boolean {
  return quarter === getCurrentQuarter();
}

export function isPastQuarter(quarter: string): boolean {
  return compareQuarters(quarter, getCurrentQuarter()) < 0;
}

export function getAllPastQuarters(quarters: string[]): string[] {
  const currentQ = getCurrentQuarter();
  return quarters
    .filter(q => compareQuarters(q, currentQ) < 0)
    .sort((a, b) => compareQuarters(b, a));
}
