//主进程

const cluster = require('cluster');
const fs = require('fs');
const nodeXlsx = require('node-xlsx');
//const nodeCsv = require('node-csv');
// const numpCPUs = require('os').cpus().length;
const numpCPUs = 10;
const argv = require('optimist').argv;
const workers = {};
let mainArgs = null;
const stats = [];
const statFactors = {};
const combineStat = function () {
	mainArgs.repeat *= stats.length;
	stats.forEach(stat => {
		for (const key in stat) {
			if (statFactors[key] === undefined) {
				statFactors[key] = stat[key];
				continue;
			}
			switch (key) {
				case 'statTotalWin':
				case 'totalCount':
				case 'statTotalCost':
				case 'baseCount':
				case 'baseTotalWin':
				case 'baseSpinWins':
				case 'statFreeSpinWin':
				case 'freeSpinTriggerCount':
				case 'freeSpinNoRetrigger':
				case 'freeRetriggerNoRepeat':
				case 'freeSpinCount':
				case 'freeSpinRetriggerCount':
				case 'freeSpinWithRetrigger':
				case 'freeSpinWins':
				case 'RIDiamond':
				case 'bingoDiamond':
				case 'bingoJackpot':
				case 'megaBonus':
				case 'superBonus':
				case 'wheelJackpot':
				case 'wheelDiamond':
				case 'bingoWinsNumber':
				case 'wheelBingoJackpot':
				case 'wheelMegaJackpot':
				case 'wheelSuperJackpot':
				case 'wheelBingoDiamond':
				case 'wheelMegaDiamond':
				case 'wheelSuperDiamond':
				case 'jackpotReward':
				case 'reSpinInfreeCount':
				case 'reSpinInbaseCount':
				case 'respinFreeSize':
				case 'respinBaseSize':
				case 'reSpinWinInFree':
				case 'reSpinWinInBase':
				case 'wild03BaseWin':
				case 'bonus1FreeWin':
				case 'bonus1BaseWin':
				case 'jackPotWin':
				case 'jackPotCount':
				case 'jackPotWinInFree':
				case 'jackPotWinInBase':
				case 'symbol18WinBase':
				case 'statWinCount':
				case 'winCount':
				case 'win7Count':
				case 'win10Count':
				case 'scatterCount':
					statFactors[key] += stat[key];
					break;
				case 'freeRetriggerTimeMap':
					break;
				case 'diamondCollected':
				case 'scatterCollected':
				case 'baseWinMap':
				case 'freeWinMap':
				case 'baseWinSymbolMap':
				case 'freeWinSymbolMap':
				case 'wild96Map':
					for (const k1 in stat[key]) {
						if (!statFactors[key][k1]) {
							statFactors[key][k1] = [];
						}
						for (const k2 in stat[key][k1]) {
							if (!statFactors[key][k1][k2]) {
								statFactors[key][k1][k2] = 0;
							}
							statFactors[key][k1][k2] += stat[key][k1][k2];
						}
					}
					break;
				case 'symbolWinMap':
				case 'freeSymbolWinMap':
				case 'jackpotMap':
				case 'jackpotLevelMap':
					for (const k1 in stat[key]) {
						if (!statFactors[key][k1]) {
							statFactors[key][k1] = 0;
						}
					}
					break;
			}
		}
	});
};

const printResult = function () {
	combineStat();
	const output = {};
	output['subject'] = mainArgs.subjectId;
	output['activeBet'] = mainArgs.activeTotalBet / mainArgs.linNum;
	output['activeTotalBet'] = mainArgs.activeTotalBet;
	output['loopCount'] = statFactors.totalCount;
	output['baseCount'] = statFactors.baseCount;
	output['running time'] = (Date.now() - mainArgs.statStartTime) / 60000;
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

	if (mainArgs.subjectId === 10096 || mainArgs.subjectId === 10029 || mainArgs.subjectId === 10046) {
		output['#10096 Jackpot '] = statFactors.jackpotReward / statFactors.statTotalCost;
	}
	const wildData = [['symbolId', 1, 2, 3]];
	if (mainArgs.subjectId === 10096) {
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
	//console.log(output);
	fs.writeFileSync(`./simulationRes/statFactors-${output['subject']}.log`, JSON.stringify(statFactors));
	outToXlsx(output, {
		symbolData: symbolCountData.concat(symbolRTPData),
		wildData,
	});
	outToCsv(output);
};

const outToCsv = function(output) {
	let csvStr = 'subjectId,activeTotalBet,loopCount,baseCount,totalRTP\n';
	const data = `${output['subject']} , ${output['activeTotalBet']} , ${output['loopCount']} , ${output['RTP']}`;
	csvStr = csvStr.concat(data);
	const date = new Date().toISOString();
	fs.writeFileSync(`./simulationRes/simulation-${date}-${output['subject']}.csv`, csvStr);
};

const outToXlsx = function(output, data) {
	const mainData = [['指标', '结果']];
	const mainSheet = { name: 'main', data: mainData };

	mainData.push(
		['subject', output['subject']],
		['activeBet', output['activeBet']],
		['activeTotalBet', output['activeTotalBet']],
		['loopCount', output['loopCount']],
		['TotalCost', output['TotalCost']],
		['TotalWin', output['TotalWin']],
		[],
		['RTP', output['RTP']],
		['Base RTP', output['Base RTP']],
		['Base Win', output['Base Win']],
		['Base Hits', output['Base Hits']],
		['Base Hit Frequency', output['Base Hit Frequency']],
		[],
		['FreeSpin RTP', output['FreeSpin RTP']],
		['FreeSpin Win', output['FreeSpin Win']],
		['FreeSpin Number', output['FreeSpin Number']],
		['FreeSpin Trigger Frequency', output['FreeSpin Trigger Frequency']],
		['FreeSpin Retrigger Frequency', output['FreeSpin Retrigger Frequency']],
		[],
		['JackPot HIT', output['JackPot HIT']],
		['JackPot RTP', output['JackPot RTP']],
		['JackPot RTP In Base', output['JackPot RTP In Base']],
		['JackPot RTP In Free', output['JackPot RTP In Free']],
		['', '次数', 'RTP'],
		['JackPot Mini', output['JackPot Level Count'][1], output['JackPot Map'][1]],
		['JackPot Minor', output['JackPot Level Count'][2], output['JackPot Map'][2]],
		['JackPot Major', output['JackPot Level Count'][3], output['JackPot Map'][3]],
		['JackPot Grand', output['JackPot Level Count'][4], output['JackPot Map'][4]],
	);

	const symbolSheet = { name: 'symbol', data: data.symbolData };
	const wildSheet = { name: 'wild', data: data.wildData };
	const date = new Date().toISOString();
	fs.writeFileSync(`./simulationRes/simRes-${date}-${output['subject']}.xlsx`, nodeXlsx.build([mainSheet, symbolSheet, wildSheet]));
};

const onMessage = function (id, data) {
	const { args, statFactors } = data;
	mainArgs = args;
	stats.push(statFactors);
	workers[id].kill();
	delete workers[id];

	if (Object.keys(workers).length === 0) {
		printResult();
	}
};

const onWorkerOnline = function (worker) {
	worker.send({ runTimes: worker.runTimes, _subjectId: worker.subjectId, pname: worker.pname });
};

const Launch = function () {
	let count = argv['count'] | 0;
	const id = argv['id'] || 10001;
	const arvCount = Math.floor(count / numpCPUs);
	for (let i = 0; i < numpCPUs; ++i) {
		const curTime = new Date().getTime();
		const worker = cluster.fork();
		workers[worker.id] = worker;
		worker.runTimes = arvCount;
		worker.subjectId = id;
		worker.pname = `simulation_${curTime}_${i}`;
		count -= arvCount;
		if (count < arvCount) {
			worker.runTimes += count;
			count = 0;
		}
		worker.once('online', onWorkerOnline.bind(null, worker));
		worker.on('message', onMessage.bind(null, worker.id));
	}
};
Launch();
