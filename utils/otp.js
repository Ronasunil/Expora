const otpGenerator = function () {
  return String(Math.floor(Math.random() * 9999 + 1000));
};

module.exports = otpGenerator;
