const random = {
  getRandomNumberFromRatio(ratios: number[]) {
    const candidates = ratios
      .map<number[]>((ratio, index) => Array(ratio).fill(index))
      .reduce<number[]>((acc, candidate) => {
        acc.push(...candidate);
        return acc;
      }, []);

    return candidates[Math.floor(Math.random() * candidates.length)];
  },

  selectOneFromArray<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
  }
};

export default random;
