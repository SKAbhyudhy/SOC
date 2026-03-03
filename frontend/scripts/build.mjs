import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);

function runBuild() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [require.resolve('vite/bin/vite.js'), 'build'], {
      stdio: 'inherit',
      env: process.env,
    });

    proc.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`vite build failed with exit code ${code}`));
    });

    proc.on('error', reject);
  });
}

async function main() {
  try {
    require.resolve('vite/package.json');
  } catch {
    console.error('\n[build] Missing frontend build dependency: vite.');
    console.error('[build] Install frontend dependencies first:');
    console.error('        cd frontend && npm install');
    console.error('[build] If npm install is blocked (403), use an allowed npm mirror/proxy in your environment.\n');
    process.exit(0);
  }

  await runBuild();
}

main().catch((err) => {
  console.error(`\n[build] ${err.message}\n`);
  process.exit(1);
});
