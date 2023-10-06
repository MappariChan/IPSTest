export const GetDistance = (frequency, signalLevel) => {
  return Math.pow(
    10,
    (27.55 - 20 * Math.log10(frequency) + Math.abs(signalLevel)) / 20
  );
};

//10^((27.55 - (20 * log10(f)) + abs(rssi)) / 20)
