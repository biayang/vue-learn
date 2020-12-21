const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const SlotState = require('../app/slot/entity/SlotState');
const StatFactors = require('../simulator/StatFactors');
const newSlotSimulator = require('./newSlotSimulator');
const nodeXlsx = require('node-xlsx');

const logdirPath = `${__dirname}/cslog`;
fs.mkdirSync(logdirPath, { recursive: true });
console.log(path.dirname(logdirPath));
//有可能从线上获取log
execSync('touch ./cslog/sres.txt | cat ../../logs/pomelo-sim*|grep s2c_spin|grep LOGOBJ > cslog/sres.txt');
execSync('touch ./cslog/cres.txt | cat ../../logs/pomelo-sim*|grep c2s_spin|grep LOGOBJ > cslog/cres.txt');
const cfile = './cslog/cres.txt';
const sfile = './cslog/sres.txt';
let spinslog = [];
let spinclog = [];
//处理spinlog内容
const simulatorMap = {};

const ssize = fs.statSync(sfile).size;

if (ssize > 200000000) { // 文件大于200m, 分割文件
	execSync('mkdir ./cslog/splitslog | split -100000 ./cslog/sres.txt ./cslog/splitslog/');
	execSync('mkdir ./cslog/splitclog | split -100000 ./cslog/cres.txt ./cslog/splitclog/');
} else {
	spinslog = fs.readFileSync(sfile, { encoding: 'utf8', flag: 'r' }).trim('').split('\n');
	spinclog = fs.readFileSync(cfile, { encoding: 'utf8', flag: 'r' }).trim('').split('\n');
	console.log(JSON.parse(spinclog[0]).LOGOBJ, JSON.parse(spinslog[0]).LOGOBJ);
	console.log(spinclog.length);
	console.log(spinslog.length);
	//统计
	statistics(spinslog, spinclog);
}
let readDir = [];
if (fs.existsSync('./cslog/splitslog')) {
	readDir = fs.readdirSync('./cslog/splitslog');
}
console.log(readDir);
for (let i = 0; i < readDir.length; i++) {
	const filename = readDir[i];
	console.log(filename);
	const spinclog = fs.readFileSync(`./cslog/splitclog/${filename}`, { encoding: 'utf8', flag: 'r' }).trim('').split('\n');
	const spinslog = fs.readFileSync(`./cslog/splitslog/${filename}`, { encoding: 'utf8', flag: 'r' }).trim('').split('\n');

	statistics(spinslog, spinclog);
}


function statistics(spinslog, spinclog) {
	let res = null;
	let cres = null;
	let totalBet = 0;
	let subjectId = 0;
	let slotState = null;
	let statFactors = null;
	let simulator = null;
	for (let i = 0; i < spinslog.length; i++) {
		const spinjson = JSON.parse(spinslog[i]);
		const cspinjson = JSON.parse(spinclog[i]);
		const rsobj = spinjson.LOGOBJ.replace(/'/g, '"');
		res = JSON.parse(rsobj);
		cres = cspinjson.LOGOBJ.replace(/'/g, '"');
		subjectId = res.si;
		totalBet = JSON.parse(cres).c2s.b;
		if (subjectId <= 0) {
			continue;
		}
		initSimObj(subjectId);
		slotState = simulatorMap[subjectId]['slotState'];
		statFactors = simulatorMap[subjectId]['statFactors'];
		simulator = simulatorMap[subjectId]['simulator'];

		const resclaim = null;
		let chips = 0;
		const controlRtp = {};
		const controlCount = {};
		const run = 0;
		const normal = 0;


		let totalWin = 0;
		for (let i = 0 ; i < res.rs.length; i++) {
			totalWin += res.rs[i].ch;
		}
		totalWin += chips;
		chips = 0;
		const totalWinRate = totalWin / totalBet;
		const isBaseSpin = !res.ifs && !res.irs;
		const machineUX = res.machineUX;
		if (!controlCount[machineUX]) {
			controlCount[machineUX] = 0;
		}
		controlCount[machineUX]++;
		//outToXlsx(totalWin);
		//console.log(statFactors);

		simulator.statBaseFactors(statFactors, !isBaseSpin, totalBet, totalWin, totalWinRate, res, slotState, subjectId, isBaseSpin, machineUX);
	}
}
//初始化每个机台模拟所需obj
function initSimObj(subject) {
	if (!simulatorMap[subject]) {
		simulatorMap[subject] = {};
	}
	if (!simulatorMap[subject]['slotState']) {
		console.log('enter init');
		simulatorMap[subject]['slotState'] = new SlotState();
	}
	if (!simulatorMap[subject]['statFactors']) {
		console.log('enter init');
		simulatorMap[subject]['statFactors'] = new StatFactors();
	}
	if (!simulatorMap[subject]['simulator']) {
		console.log('enter init');
		const config = fs.readFileSync(`../app_configs/slot_config/subject_tmpl_list/subject_tmpl_${subject}.json`, { encoding: 'utf8', flag: 'r' });
		simulatorMap[subject]['simulator'] = new newSlotSimulator(subject, JSON.parse(config).coins);
	}
}

function analyse(simulatorMap) {
	for (const subjectId in simulatorMap) {
		const output = {};
		const slotState = simulatorMap[subjectId]['slotState'];
		const statFactors = simulatorMap[subjectId]['statFactors'];
		const simulator = simulatorMap[subjectId]['simulator'];
		output['subject'] = subjectId;
		output['loopCount'] = statFactors.totalCount;
		output['baseCount'] = statFactors.baseCount;
		output['TotalWin'] = statFactors.statTotalWin;
		output['TotalCost'] = statFactors.statTotalCost;
		output['RTP'] = statFactors.statTotalWin / statFactors.statTotalCost;
		output['Base RTP'] = statFactors.baseTotalWin / statFactors.statTotalCost;
		output['Base Win'] = statFactors.baseTotalWin;
		output['Base Hits'] = statFactors.baseSpinWins;
		output['win Rate'] = statFactors.statWinCount / statFactors.baseCount;
		output['win7 Rate'] = statFactors.win7Count / statFactors.baseCount;
		output['win10 Rate'] = statFactors.win10Count / statFactors.baseCount;
		output['scatter symbol AVG num'] = statFactors.scatterCount / (statFactors.baseCount + statFactors.freeSpinCount);
		output['Base Hit Frequency'] = statFactors.baseSpinWins / statFactors.baseCount;
		// output['Base Avg Pay'] = statFactors.baseTotalWin / statFactors.baseSpinWins / mainArgs.activeTotalBet;
		output['FreeSpin RTP'] = statFactors.statFreeSpinWin / statFactors.statTotalCost;
		output['FreeSpin Win'] = statFactors.statFreeSpinWin;
		output['FreeSpin Number'] = statFactors.freeSpinCount;
		output['Bingo Wins Number'] = statFactors.bingoWinsNumber;
		output['Avg Spins When Bingo Wins'] = Math.ceil((statFactors.freeSpinCount + statFactors.baseCount) / statFactors.bingoWinsNumber);
		output['Hit Frequency'] = statFactors.baseCount / statFactors.baseSpinWins;
		output['base respin trigger Frequency'] = statFactors.baseCount / statFactors.reSpinInbaseCount;
		output['FreeSpin Frequency'] = statFactors.baseCount / statFactors.freeSpinTriggerCount;
		output['FreeSpin Trigger Frequency'] = statFactors.freeSpinTriggerCount / statFactors.baseCount;
		output['FreeSpin Retrigger Frequency'] = statFactors.freeSpinRetriggerCount / statFactors.freeSpinCount;

		output['ReSpin RTP'] = statFactors.statFreeSpinWin / statFactors.statTotalCost;
		output['base ReSpin RTP'] = statFactors.reSpinWinInBase / statFactors.statTotalCost;
		output['free ReSpin RTP'] = statFactors.reSpinWinInFree / statFactors.statTotalCost;
		// output['Free HIT Total'] = statFactors.freeSpinWins / statFactors.freeSpinCount;
		output['baseWinSymbolMap'] = statFactors.baseWinSymbolMap;
		output['freeWinSymbolMap'] = statFactors.freeWinSymbolMap;
		for (const id in statFactors.baseWinSymbolMap) {
			output[`symbol ${id} Total`] = statFactors.baseWinSymbolMap[id] / statFactors.statTotalCost;
		}
		for (const id in statFactors.freeWinSymbolMap) {
			output[`Free symbol ${id} Total`] = statFactors.freeWinSymbolMap[id] / statFactors.statTotalCost;
		}

		output['JackPot HIT'] = statFactors.jackPotCount;
		output['JackPot RTP'] = statFactors.jackPotWin / statFactors.statTotalCost;
		output['JackPot RTP In Base'] = statFactors.jackPotWinInBase / statFactors.statTotalCost;
		output['JackPot RTP In Free'] = statFactors.jackPotWinInFree / statFactors.statTotalCost;
		output['18 symbol RTP In Free'] = statFactors.symbol18WinFree / statFactors.statTotalCost;
		output['18 symbol RTP In base'] = statFactors.symbol18WinBase / statFactors.statTotalCost;
		output['bonus win In base'] = statFactors.bonus1BaseWin / statFactors.statTotalCost;
		output['bonus win RTP In free'] = statFactors.bonus1FreeWin / statFactors.statTotalCost;

		output['JackPot Map'] = {};
		for (const i in statFactors.jackpotMap) {
			output['JackPot Map'][i] = statFactors.jackpotMap[i] / statFactors.statTotalCost;
		}
		output['JackPot Level Count'] = {};
		for (const i in statFactors.jackpotLevelMap) {
			output['JackPot Level Count'][i] = statFactors.jackpotLevelMap[i];
		}

		if (subjectId === 10096 || subjectId === 10029 || subjectId === 10046) {
			output['#10096 Jackpot '] = statFactors.jackpotReward / statFactors.statTotalCost;
		}
		const wildData = [['symbolId', 1, 2, 3]];
		if (subjectId === 10096) {
			output['Wild Map'] = {};

			for (const symbolId in statFactors.wild96Map) {
				output['Wild Map'][symbolId] = {};
				const record = [symbolId, 0, 0, 0];
				wildData.push(record);
				for (const len in statFactors.wild96Map[symbolId]) {
					if (output['Wild Map'][symbolId][len] === undefined) {
						output['Wild Map'][symbolId][len] = 0;
					}
					output['Wild Map'][symbolId][len] = statFactors.wild96Map[symbolId][len] / (statFactors.baseCount + statFactors.freeSpinCount);
					record[len] = statFactors.wild96Map[symbolId][len] / (statFactors.baseCount + statFactors.freeSpinCount);
				}
			}
		}
		output['Base RTP Total'] = 0;
		output['Free RTP Total'] = 0;
		output['Free'] = {};
		output['Base'] = {};

		const symbolCountData = [['Base', 'x1', 'x2', 'x3', 'x4', 'x5']];
		const symbolRTPData = [['Base RTP', 'x1', 'x2', 'x3', 'x4', 'x5']];
		for (const symbolId in statFactors.baseWinSymbolMap) {
			const record = [symbolId, 0, 0, 0, 0, 0];
			const rtpRecord = [symbolId, 0, 0, 0, 0, 0];
			symbolCountData.push(record);
			symbolRTPData.push(rtpRecord);
			const symbolInfo = statFactors.baseWinSymbolMap[symbolId];
			const winInfo = statFactors.baseWinMap[symbolId];
			const list = [];
			for (const matchCount in symbolInfo) {
				const winCount = symbolInfo[matchCount];
				const totalWin = winInfo[matchCount];

				record[matchCount] = winCount / statFactors.baseCount;
				rtpRecord[matchCount] = totalWin / statFactors.statTotalCost;

				output['Base'][matchCount + '个' + symbolId] = {};
				output['Base'][matchCount + '个' + symbolId]['HF'] = winCount / statFactors.baseCount ;
				output['Base'][matchCount + '个' + symbolId]['RTP'] = totalWin / statFactors.statTotalCost;
				list.push(output['Base'][matchCount + '个' + symbolId]['RTP']);
				output['Base RTP Total'] += totalWin / statFactors.statTotalCost;
			}
		}
		symbolCountData.push([], ['Free', 'x1', 'x2', 'x3', 'x4', 'x5']);
		symbolRTPData.push([], ['Free RTP', 'x1', 'x2', 'x3', 'x4', 'x5']);
		for (const symbolId in statFactors.freeWinSymbolMap) {
			const symbolInfo = statFactors.freeWinSymbolMap[symbolId];
			const winInfo = statFactors.freeWinMap[symbolId];
			const list = [];

			const record = [symbolId, 0, 0, 0, 0, 0];
			const rtpRecord = [symbolId, 0, 0, 0, 0, 0];
			symbolCountData.push(record);
			symbolRTPData.push(rtpRecord);
			for (const matchCount in symbolInfo) {
				const winCount = symbolInfo[matchCount];
				const totalWin = winInfo[matchCount];

				record[matchCount] = winCount / statFactors.baseCount;
				rtpRecord[matchCount] = totalWin / statFactors.statTotalCost;

				output['Free'][matchCount + '个' + symbolId] = {};
				output['Free'][matchCount + '个' + symbolId]['HF'] = winCount / statFactors.baseCount ;
				output['Free'][matchCount + '个' + symbolId]['RTP'] = totalWin / statFactors.statTotalCost;
				list.push(output['Free'][matchCount + '个' + symbolId]['RTP']);
				output['Free RTP Total'] += totalWin / statFactors.statTotalCost;
			}
		}
		//console.log('stat', statFactors);
		console.log(output);
		fs.writeFileSync(`${logdirPath}/res-${subjectId}.log`, JSON.stringify(output));
	}

}


//console.log(simulatorMap);

analyse(simulatorMap);





