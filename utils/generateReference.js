exports.generateReference = () => {
  return "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
};
