const path = require('path');
const { spawn } = require('child_process');

const proxy = spawn(process.execPath, [path.join(__dirname, 'open-food-facts-proxy.js')], {
  stdio: 'inherit',
});
const expoCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const expo = spawn(expoCommand, ['expo', 'start', '--web', '--port', '8087'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const stop = () => {
  proxy.kill();
  expo.kill();
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
expo.on('exit', () => {
  proxy.kill();
});