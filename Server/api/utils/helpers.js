const getMonthRange = (month) => {
  const start = new Date(`2022-${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);
  return { start, end };
};

module.exports = getMonthRange;
