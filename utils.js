export const generateRandomStringNumber = () => {
  return Math.random().toString().slice(2, 7);
};

export const calculateAverageRate = (rates) => {
  if (rates) {
    return rates.reduce((acc, rating) => acc + rating.rating, 0) / rates.length;
  } else {
    return 0;
  }
};
