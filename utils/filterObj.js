const filterObj = function (obj, ...values) {
  const filteObj = {};

  const keys = Object.keys(obj);
  keys.forEach((key) => {
    if (!values.includes(key)) filteObj[key] = obj[key];
  });

  return filteObj;
};

module.exports = filterObj;
