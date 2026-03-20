// Minimal startup file for DomaiNesia/cPanel Application Manager
// This wraps Next.js start via npm script.
const { spawn } = require('child_process');

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['start'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('close', (code) => {
  console.log(`npm start exited with code ${code}`);
  process.exit(code);
});
