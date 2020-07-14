#!/usr/bin/env node
'use strict'

// 使脚本在未处理的Promise崩溃，而不是静默地崩溃
// 忽视他们。在未来，承诺拒绝没有处理将会
// 使用非零退出代码终止Node.js进程。
process.on('unhandledRejection', err => {
  throw err;
})

const spawn = require('react-dev-utils/crossSpawn')
const args = process.argv.slice(2)

const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'start' || x === 'test'
)
const script = scriptIndex === -1 ? args[0] : args[scriptIndex]
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : []

if (['build', 'start', 'test'].includes(script)) {
  const result = spawn.sync(
    'node',
    nodeArgs
      .concat(require.resolve('../scripts/' + script))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  )
	
  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
      )
    }
    process.exit(1);
  }

	process.exit(result.status);

}else {
	console.log('Unknown script "' + script + '".');
  console.log('Perhaps you need to update react-scripts?');
  console.log(
    'See: https://facebook.github.io/create-react-app/docs/updating-to-new-releases'
  );
}

