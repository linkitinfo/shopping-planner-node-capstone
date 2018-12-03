exports.DATABASE_URL =
  process.env.DATABASE_URL ||
  global.DATABASE_URL ||
  "mongodb://admin:admin@ds249707.mlab.com:49707/shopping-planner-node-capstone";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "mongodb://admin:admin@ds249707.mlab.com:49707/shopping-planner-node-capstone";
exports.PORT = process.env.PORT || 8080;
exports.MAIL_KEY =
  "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";
