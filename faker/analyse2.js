const fs = require('fs');
const path = require('path');

const logdirPath = `${__dirname}/cslog`;
fs.mkdirSync(logdirPath, { recursive: true });
const cfile = './10012sim.log';
const spinclog = fs.readFileSync(cfile, { encoding: 'utf8', flag: 'r' }).trim('').split('\n');

let Count = 0;
let RTP = 0;
let BaseRTP = 0;
let FreeRTP = 0;
for (Count; Count < spinclog.length; Count++) {
	console.log(spinclog[Count]);
	const log = JSON.parse(spinclog[Count]);
	RTP += log.RTP;
	BaseRTP += log['Base RTP'];
	FreeRTP += log['FreeSpin RTP'];
}
console.log('RTP is', RTP / Count);
console.log('BaseRTP is', BaseRTP / Count);
console.log('Free RTP is', FreeRTP / Count);
console.log('RTP is', RTP / Count);
console.log('RTP is', RTP / Count);
