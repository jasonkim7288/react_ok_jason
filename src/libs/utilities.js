export const stringifyNumber = (n) => {
  const special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
  const decimal = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

  if (n < 20) return special[n];
  if (n % 10 === 0) return decimal[Math.floor(n / 10) - 2] + 'ieth';
  return decimal[Math.floor(n / 10) -2] + 'y-' + special[n % 10];
};
