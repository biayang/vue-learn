const cluster = require('cluster');
if (cluster.isMaster) {
	require('./MTMaster');
} else {
	console.info('worker id:', process.pid);
	require('./simulation');
}
