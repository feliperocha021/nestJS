// jest.teardown.js
module.exports = async () => {
  console.log('\n===== HANDLES AINDA ABERTOS =====');
  await new Promise(r => setImmediate(r));
  const why = require('why-is-node-running');
  why();
  console.log('===============================\n');
};
