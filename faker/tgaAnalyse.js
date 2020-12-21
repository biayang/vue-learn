const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const SlotState = require('../app/slot/entity/SlotState');
const StatFactors = require('../simulator/StatFactors');
const newSlotSimulator = require('./newSlotSimulator');
const nodeXlsx = require('node-xlsx');

const tgaRTPMap = {};
const RTP = {};
const betMap = {};
const count = {};
const logdirPath = `${__dirname}/cslog`;
fs.mkdirSync(logdirPath, { recursive: true });
console.log(path.dirname(logdirPath));
//有可能从线上获取log
execSync('touch ./cslog/tgares.txt | cat ../../logs/tga.lo*|grep -w SpinClicked |sed "s/^.*tga -//g" > cslog/tgares.txt');
const tgafile = './cslog/tgares.txt';
if (!fs.existsSync('./cslog/splittga')) {
	execSync('mkdir ./cslog/splittga');
}
const size = fs.statSync(tgafile).size;
if (size >= 200000000) { // 文件大于200m, 分割文件
	console.log(size);
	execSync('split -100000 ./cslog/tgares.txt ./cslog/splittga/');
} else {
	const tgalog = fs.readFileSync('./cslog/tgares.txt', { encoding: 'utf8', flag: 'r' }).trim('').split('\n');
	analyse(tgalog);
}
let readDir = [];
if (fs.existsSync('./cslog/splittga')) {
	readDir = fs.readdirSync('./cslog/splittga');
}
console.log(readDir);
for (let i = 0; i < readDir.length; i++) {
	const filename = readDir[i];
	console.log(filename);
	const tgalog = fs.readFileSync(`./cslog/splittga/${filename}`, { encoding: 'utf8', flag: 'r' }).trim('').split('\n');

	analyse(tgalog);
}


function analyse(tgalog) {
	for (let i = 0; i < tgalog.length; i++) {
		const p = JSON.parse(tgalog[i]).properties;
		const subjectId = p.user_currentmachine;
		if (!tgaRTPMap[subjectId]) {
			tgaRTPMap[subjectId] = {};
		}
		if (!tgaRTPMap[subjectId][p.event_machine_ux]) {
			tgaRTPMap[subjectId][p.event_machine_ux] = p.event_wincoins;
		} else {
			tgaRTPMap[subjectId][p.event_machine_ux] += p.event_wincoins;
		}
		if (!betMap[subjectId]) {
			betMap[subjectId] = p.event_betcoins;
		} else {
			betMap[subjectId] += p.event_betcoins;
		}
		if (!count[subjectId]) {
			count[subjectId] = 0;
		}
		count[subjectId]++;
	}

	for (const id in tgaRTPMap) {
		const uxRtp = {};
		for (const ux in tgaRTPMap[id]) {
			uxRtp[ux] = tgaRTPMap[id][ux] / betMap[id];
		}
		RTP[id] = uxRtp;
	}
	console.log(count);
}
fs.writeFileSync(`${logdirPath}/tgaana.log`, JSON.stringify(RTP));

