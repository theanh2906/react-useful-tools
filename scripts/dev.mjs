import { spawn } from 'node:child_process';

const forwardedArgs = process.argv.slice(2).flatMap((argument) => {
  if (argument === '--host') return ['--hostname'];
  if (argument === '--strictPort') return [];
  return [argument];
});

const child = spawn('next', ['dev', '--turbopack', ...forwardedArgs], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
