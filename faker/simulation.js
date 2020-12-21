#! /usr/bin/env node

'use strict';

const Client = require('../client/client');
const SlotState = require('../app/slot/entity/SlotState');
const StatFactors = require('../simulator/StatFactors');
const newSlotSimulator = require('./newSlotSimulator');
const nodeXlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');

let subjectId = 10012;
let count = 1000000;
let totalBet = 1000;
let coins = 0;
const slotState = new SlotState();
const statFactors = new StatFactors();

let port = 9881;

const startTime = new Date();

const ts = +startTime;

let udid = '';

const pid = process.pid;

console.log(ts);

const datetime = startTime.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/(:| )/g, '-');

const ClientTest = async () => {

	const filename = `${__dirname}/res/${subjectId}/${datetime}-${port}-${pid}.txt`;
	fs.mkdirSync(path.dirname(filename), { recursive: true });
	fs.mkdirSync(path.dirname('./10093.log'), { recursive: true });
	console.log(filename);

	const c = new Client({ udid, port });
	const login = await c.login();
	const playerid = login.s2c.p.id;
	await c.pollCheck();
	await c.afterLogin();
	await c.simAddChips();
	console.log(subjectId);
	const enterroom = await c.enterRoom(subjectId);
	coins = enterroom.coins;
	const simulator = new newSlotSimulator(subjectId, coins);
	let res = null;
	let resclaim = null;
	let chips = 0;
	const controlRtp = {};
	const controlCount = {};
	let run = 0;
	const normal = 0;
	let enterBonusGame = false;
	const outToXlsx = (totalWin) => {
		const file = './test1.xlsx';
		const str = nodeXlsx.parse(file, { encoding: 'utf8', flag: 'r' });
		str[0].data.push([playerid, totalWin, totalBet, res.machineUX, res.chips]);
		fs.writeFileSync('./test1.xlsx', nodeXlsx.build(str));
	};
	const createXlsx = () => {
		const mainData = [['uid', 'wincoins', 'betCoins', 'machine_ux', 'balance']];
		const mainSheet = { name: 'main', data: mainData };
		if (fs.existsSync('./test1.xlsx')) {
			console.log('文件存在');
		} else {
			fs.writeFileSync('./test1.xlsx', nodeXlsx.build([mainSheet]));
		}
	};

	const dump = () => {
		const rtp = statFactors.statTotalWin / statFactors.statTotalCost;
		const brtp = statFactors.baseTotalWin / statFactors.statTotalCost;
		const winR = statFactors.statWinCount / (statFactors.baseCount + statFactors.freeSpinCount);
		const win5R = statFactors.win5Count / (statFactors.baseCount + statFactors.freeSpinCount);
		const win7R = statFactors.win7Count / (statFactors.baseCount + statFactors.freeSpinCount);
		const win10R = statFactors.win10Count / (statFactors.baseCount + statFactors.freeSpinCount);
		const fsrtp = statFactors.freeSpinWinWithFeature / statFactors.statTotalCost;
		const fertp = statFactors.claimfeatureWin / statFactors.statTotalCost;
		const jprtp = statFactors.jackPotWin / statFactors.statTotalCost;
		const rertpb = statFactors.reSpinWinInBase / statFactors.statTotalCost;
		const rertpf = statFactors.reSpinWinInFree / statFactors.statTotalCost;
		const bortpb = statFactors.bonus1BaseWin / statFactors.statTotalCost;
		const bortpf = statFactors.bonus1FreeWin / statFactors.statTotalCost;
		const fshit = statFactors.freeSpinTriggerCount / statFactors.baseCount;
		const fsavg = statFactors.freeSpinCount / statFactors.freeSpinTriggerCount;
		const scatter = statFactors.scatterCount / (statFactors.baseCount + statFactors.freeSpinCount);
		const fofbkind = statFactors.fiveOFKindbaseCount / (statFactors.baseCount + statFactors.freeSpinCount);
		const foffkind = statFactors.fiveOFKindfreeCount / (statFactors.baseCount + statFactors.freeSpinCount);
		for (const type in statFactors.controlMap) {
			if (!controlRtp[type]) {
				controlRtp[type] = 0;
			}
			controlRtp[type] = statFactors.controlMap[type] / statFactors.statTotalCost;
		}
		const cc = `${JSON.stringify(controlCount)}`;
		const cs = `${JSON.stringify(controlRtp)}`;
		const s = `${rtp},${run},${port}`;
		const task = `${winR},${win7R},${win10R},${fsrtp},${fertp},${fsavg},${fshit},${scatter},${fofbkind},${win5R},${foffkind}`;
		const extra = `${brtp},${jprtp},${rertpb},${rertpf},${bortpb},${bortpf}`;
		const time = (new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '');
		console.log('time', time);
		console.log('controlCount', cc);
		console.log('controlRtp', cs);
		console.log('result', s);
		console.log(normal);
		fs.writeFileSync(filename, `${s}\n${task}\n${extra}\n${cs}\n`);
	};
	const config = fs.readFileSync(`${__dirname}/claimConfig.json`, { encoding: 'utf8', flag: 'r' });
	console.log('config', config);
	let bonuslist = JSON.parse(config)['value'][subjectId] || [];
	const scatterId = JSON.parse(config)['scatter'][subjectId];
	const fiveOFKind = JSON.parse(config)['5ofakind'][subjectId];
	console.log(bonuslist);
	//创建xlsx
	//createXlsx();
	for (; run < count; run++) {

		res = await c.spinsim(totalBet);
		//console.log(res.rs[0].ex)
		if (res.mbl.length > 0) {
			totalBet = res.mbl[res.mbl.length - 1];
		}
		enterBonusGame = res.rs[0].ex.isEnterBonusGame;
		if (subjectId === 10026) {
			bonuslist = res.rs[0].ex.fishBonusTypes;
		}
		for (let i = 0; i < bonuslist.length; i++) {
			if (enterBonusGame) {
				resclaim = await c.simClaim(subjectId, bonuslist[i]);
				chips += resclaim.chips;
				enterBonusGame = resclaim.fr.isEnterBonusGame;
			}

		}
		for (let j = 0; j < res.rs.length; j++) {
			if (res.rs[j].ex.isEnterFreeSpin) {
				const subjectArgs = JSON.parse(config)['subjectArgs'][subjectId] || {};
				if (subjectId === 10009 || subjectId === 10040) {
					subjectArgs['symbolId'] = subjectArgs['symbolId'] + Math.floor(Math.random() * 4) ;
				}
				if (subjectId === 10010) {
					subjectArgs['index'] = Math.floor(Math.random() * res.rs[0].ex.freeSpinArray.length) + 1;
				}
				await c.simClaimFree(subjectId, subjectArgs);
			}
		}
		if (run % 10000 === 9999) {
			dump();
			//specialMachineLog(subjectId, statFactors);
		}

		let totalWin = 0;
		for (let i = 0 ; i < res.rs.length; i++) {
			totalWin += res.rs[i].ch;
		}
		totalWin += chips;
		if (chips > 0) {
			statFactors.claimfeatureWin += chips;
		}
		chips = 0;
		const totalWinRate = totalWin / totalBet;
		const isBaseSpin = !res.ifs && !res.irs;
		const isFreeSpin = res.ifs > 0 && res.irs === 0;
		const machineUX = res.machineUX;
		if (!controlCount[machineUX]) {
			controlCount[machineUX] = 0;
		}
		controlCount[machineUX]++;
		//outToXlsx(totalWin);
		simulator.statBaseFactors(statFactors, isFreeSpin, totalBet, totalWin, totalWinRate, res, slotState, subjectId, isBaseSpin, machineUX, scatterId, fiveOFKind);
	}
};

const specialMachineLog = (subjectId, statFactors) => {
	const output = {};
	if (subjectId === 10093) {
		output['Bingo Trigger Probability'] = statFactors.bingoWinsNumber / statFactors.baseCount;
		output['Bingo Trigger Probability in base / free'] = statFactors.normalBingoWinsNumber / (statFactors.normalBingoSpin);

		output['Avg Spins When Bingo Wins'] = Math.ceil((statFactors.freeSpinCount + statFactors.baseCount) / statFactors.bingoWinsNumber);
		output['#10093 Bingo diamond'] = statFactors.bingoDiamond / statFactors.statTotalCost;
		output['#10093 Bingo jackpot'] = statFactors.bingoJackpot / statFactors.statTotalCost;

		output['#10093 Mega Diamond'] = statFactors.megaDiamondCoin / statFactors.statTotalCost;
		output['#10093 Super Diamond'] = statFactors.superDiamondCoin / statFactors.statTotalCost;

		output['#10093 Mega jackpot'] = statFactors.megaJackpotCoin / statFactors.statTotalCost;
		output['#10093 Super jackpot'] = statFactors.superJackpotCoin / statFactors.statTotalCost;

		output['#10093 Wheel Bingo diamond'] = (statFactors.wheelBingoDiamond) / statFactors.statTotalCost;
		output['#10093 Wheel Mega diamond'] = (statFactors.wheelMegaDiamond) / statFactors.statTotalCost;
		output['#10093 Wheel Super diamond'] = (statFactors.wheelSuperDiamond) / statFactors.statTotalCost;


		output['#10093 Wheel Bingo jackpot'] = (statFactors.wheelBingoJackpot) / statFactors.statTotalCost;
		output['#10093 Wheel Mega jackpot'] = (statFactors.wheelMegaJackpot) / statFactors.statTotalCost;
		output['#10093 Wheel Super jackpot'] = (statFactors.wheelSuperJackpot) / statFactors.statTotalCost;
		output['#10093 claim feature RTP'] = statFactors.claimfeatureWin / statFactors.statTotalCost;
		output['JackPot Level Count'] = {};
		for (const i in statFactors.jackpotLevelMap) {
			output['JackPot Level Count'][i] = statFactors.jackpotLevelMap[i];
		}

	}
	fs.appendFileSync('./10093.log', JSON.stringify(output));
};

const argv = require('optimist').argv;

const id = argv['bot-id'] | 0;
subjectId = argv['machine-id'] || subjectId;
port = argv['port'] || port;
count = argv['count'] || count;

udid = `sim_${ts}_${port}`;

console.log(id, subjectId);

(async () => {
	await ClientTest();
})();
