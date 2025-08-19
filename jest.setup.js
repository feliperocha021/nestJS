// jest.setup.js
module.exports = async () => {
  let why;
  try {
    why = require('why-is-node-running');
  } catch {
    console.warn(
      '[jest.setup.js] why-is-node-running não encontrado, pulando relatório de handles'
    );
    return;
  }

  console.log('\n===== HANDLES AINDA ABERTOS =====');
  await new Promise(resolve => setImmediate(resolve));
  why();
  console.log('===============================\n');
};
