const fs = require('fs');
const nodeXlsx = require('node-xlsx');
const SymbolCounter = require('../app/slot/analyser/SymbolCounterAnywhere');
const SymbolId = require('../app/slot/enum/SymbolId');

const SlotSimulator = function (subjectId, coins) {
	this.subjectId = subjectId;
	this.coins = coins;

	this.symbolCounter = new SymbolCounter();
	/**
	 * @type {Strategy}
	 * @private
	 */
	this._strategy = null;
};

SlotSimulator.prototype.statBaseFactors = function(statFactors, isFreeSpin, activeTotalBet, totalWin,
	totalWinRate, s2CSpin, slotState, subjectId, isBaseSpin, simUx, scatterId, fiveOFKind) {
	const activeBet = activeTotalBet / this.coins;
	statFactors.totalCount++;
	if (isFreeSpin) {
		const wl = s2CSpin.rs[0].wl;
		if (wl.length > 0) {
			for (let i = 0 ; i < wl.length; i++) {
				const id = wl[i].matchSymbolId * 10 + wl[i].num;
				const win = wl[i].wr * activeBet;
				if (!statFactors.freeSymbolWinMap[id]) {
					statFactors.freeSymbolWinMap[id] = win;
				} else {
					statFactors.freeSymbolWinMap[id] += win;
				}
			}
		}
		statFactors.freeWin10 += totalWin;
		statFactors.bonus1FreeWin += s2CSpin.rs[0].ex.bonusWin || 0;
		statFactors.bonus2FreeWin += s2CSpin.rs[0].ex.bonusWin2 || 0;
		if (s2CSpin.rs[0].ex.lockWildCol && s2CSpin.rs[0].ex.lockWildCol.length > 0) {
			statFactors.b02FreeFeatureCount++;
		}
		if (s2CSpin.rs[0].ex.symbolExtraWin) {
			statFactors.symbol18WinFree += s2CSpin.rs[0].ex.symbolExtraWin;
		}
		statFactors.freeSpinCount++;
		statFactors.wild03FreeWin += s2CSpin.rs[s2CSpin.rs.length - 1].exch;
		if (s2CSpin.rs[s2CSpin.rs.length - 1].exch > 0) {
			statFactors.scatter21FreeHit++;
		}
		statFactors.statFreeSpinWin += s2CSpin.rs[0].wr * activeBet;
		if (s2CSpin.rs[s2CSpin.rs.length - 1].wr > 0) {
			const wild = this.symbolCounter.count(s2CSpin.rs[0].pa, [1102, 1103, 1104]);
			if (!statFactors.wildMap[wild.length]) {
				statFactors.wildMap[wild.length] = 0;
			}
			statFactors.wildMap[wild.length] += 1;
			statFactors.freeSpinWins++;
			statFactors.extraFreeSpinMap16[s2CSpin.rs[0].ex.extraFreeSpinTime]++;
		}
		if (s2CSpin.rs[0].collectPool) {
			let fullCount = 0;
			for (let col = 1; col < 5; col++) {
				if (s2CSpin.rs[0].collectPool[col] >= 4) {
					fullCount++;
				}
			}
			statFactors.bonus9FullMap[fullCount]++;
		}
		if (!statFactors.freeSpinTotal15[s2CSpin.rs[0].ex.tfs]) {
			statFactors.freeSpinTotal15[s2CSpin.rs[0].ex.tfs] = 0;
		}
		statFactors.freeSpinTotal15[s2CSpin.rs[0].ex.tfs]++;
		if (s2CSpin.rs[0].ex.bonus && s2CSpin.rs[0].ex.bonus.length >= 5) {
			statFactors.retriggerCount15++;
			if (!statFactors.retriggerMap15[s2CSpin.rs[0].lfs]) {
				statFactors.retriggerMap15[s2CSpin.rs[0].lfs] = 0;
			}
			statFactors.retriggerMap15[s2CSpin.rs[0].lfs]++;
		}

		if (s2CSpin.rs[0].ex.scatterWin) {
			statFactors.scatterWinFree += s2CSpin.rs[0].ex.scatterWin;
		}
		if (s2CSpin.rs[0].ex.bonusCreditsWin) {
			statFactors.bonusCreditsWinFree += s2CSpin.rs[0].ex.bonusCreditsWin;
		}
		if (s2CSpin.rs[0].ex.scatter4Win) {
			statFactors.scatter4WinFree += s2CSpin.rs[0].ex.scatter4Win;
		}
	} else if (isBaseSpin) {
		const wl = s2CSpin.rs[0].wl;
		if (wl.length > 0) {
			for (let i = 0 ; i < wl.length; i++) {
				const id = wl[i].matchSymbolId * 10 + wl[i].num;
				const win = wl[i].wr * activeBet;
				if (!statFactors.symbolWinMap[id]) {
					statFactors.symbolWinMap[id] = win;
				} else {
					statFactors.symbolWinMap[id] += win;
				}
			}
		}
		statFactors.baseWin10 += totalWin;
		statFactors.bonus1BaseWin += s2CSpin.rs[0].ex.bonusWin || 0;
		statFactors.bonus2BaseWin += s2CSpin.rs[0].ex.bonusWin2 || 0;
		statFactors.wild03BaseWin += s2CSpin.rs[0].exch;
		if (s2CSpin.rs[0].exch > 0) {
			statFactors.scatter21BaseHit++;
		}
		if (s2CSpin.rs.length > 1) {
			++statFactors.baseSpinRetriggerCount;
		}
		if (s2CSpin.rs[0].wr > 0) {
			statFactors.baseSpinWins++;
		}
		statFactors.baseCount++;
		statFactors.baseTotalWin += s2CSpin.rs[0].wr * activeBet;
		statFactors.statTotalCost += activeTotalBet;
		statFactors.winRateStore.push(totalWinRate);
		if (s2CSpin.rs[0].ex.symbolExtraWin) {
			statFactors.symbol18WinBase += s2CSpin.rs[0].ex.symbolExtraWin;
		}
		if (s2CSpin.rs[0].ex.bonus && s2CSpin.rs[0].ex.bonus.length >= 3) {
			statFactors.bonusMap[s2CSpin.rs[0].ex.bonus.length] = statFactors.bonusMap[s2CSpin.rs[0].ex.bonus.length] ? statFactors.bonusMap[s2CSpin.rs[0].ex.bonus.length] + 1 : 1;
			statFactors.boxCount++;
		}
		if (s2CSpin.rs[0].ex.scatterWin) {
			statFactors.scatterWin += s2CSpin.rs[0].ex.scatterWin;
		}
		if (s2CSpin.rs[0].ex.bonusCreditsWin) {
			statFactors.bonusCreditsWin += s2CSpin.rs[0].ex.bonusCreditsWin;
		}
		if (s2CSpin.rs[0].ex.scatter4Win) {
			statFactors.scatter4Win += s2CSpin.rs[0].ex.scatter4Win;
		}
		if (s2CSpin.rs[0].ex.lockWildCol && s2CSpin.rs[0].ex.lockWildCol.length > 0) {
			statFactors.b02BaseFeatureCount++;
		}
	}
	if (s2CSpin.rs[0].ex.featureWin) {
		statFactors.bonus9Win += s2CSpin.rs[0].ex.featureWin;
		statFactors.bonus9Count++;
	}

	if (this.verbose) {
		this.rsVerbose(s2CSpin.rs, statFactors);
	}
	// this.statAR(s2CSpin.rs, statFactors, isFreeSpin);

	if (totalWin > 0) {
		//正常的win rate统计，如果base中了free或者respin，要把freespin totalwin累积到触发那次base中（但于游戏流程不符）
		statFactors.statTotalWin += totalWin;
		++statFactors.statWinCount;
		if (totalWinRate >= 1) {
			++statFactors.winCount;
		}
		if (totalWinRate >= 5) {
			++statFactors.win5Count;
		}
		if (totalWinRate >= 7) {
			++statFactors.win7Count;
		}
		if (totalWinRate >= 10) {
			++statFactors.win10Count;
		}
		//体验控制
		if (!statFactors.controlMap[simUx]) {
			statFactors.controlMap[simUx] = 0;
		}
		statFactors.controlMap[simUx] += totalWin;
		if (!statFactors.controlCount[simUx]) {
			statFactors.controlCount[simUx] = 0;
		}
		statFactors.controlCount[simUx]++;

		if (isFreeSpin) {
			statFactors.freeSpinWinCount++;
			statFactors.freeSpinWinWithFeature += totalWin;
			statFactors.winRateStore[statFactors.winRateStore.length - 1] += totalWinRate;
		} else {
			statFactors.statNormalWin += totalWin;
		}
	}
	statFactors.scatterWin13 += s2CSpin.rs[0].ex.scatterWin || 0;

	if (s2CSpin.rs.length > 1) {

		this.statRespinCount(s2CSpin, statFactors, isFreeSpin);

		statFactors.respinCount += s2CSpin.rs.length;
		for (let i = 0; i < s2CSpin.rs.length && subjectId === 10091; i++) {
			const spinpa = s2CSpin.rs[i];
			statFactors.coinsHitCount += spinpa.ex.coinsHit.length;
			statFactors.coinsSymbolWin += spinpa.ex.coinsSymbolWin;
		}
		if (isFreeSpin) {
			++statFactors.reSpinInfreeCount;
			statFactors.respinFreeSize += s2CSpin.rs.length;
		} else {
			statFactors.respinBaseSize += s2CSpin.rs.length;
			++statFactors.reSpinInbaseCount;
		}
		++statFactors.featureCount;
		if (s2CSpin.rs[0].reSpinType === 0) {
			statFactors.reSpinInBase++;
			statFactors.reSpinTotalWinInBase += s2CSpin.rs[s2CSpin.rs.length - 1].ex.jw;
		} else {
			statFactors.reSpinInBox++;
			statFactors.reSpinWinInBox += s2CSpin.rs[s2CSpin.rs.length - 1].ex.jw;
		}
		if (s2CSpin.rs[s2CSpin.rs.length - 1].wl.length > 0) {
			statFactors.collectWinCount_22++;
		}
	}

	if (s2CSpin.rs[0].reSpinType) {
		statFactors.reSpin01BoxCount++;
		statFactors.reSpin01BoxWin += s2CSpin.rs[s2CSpin.rs.length - 1].ex.jw ? s2CSpin.rs[s2CSpin.rs.length - 1].ex.jw : 0;
	} else {
		const jackpot = this.symbolCounter.count(s2CSpin.rs[s2CSpin.rs.length - 1].pa, [1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512]);
		statFactors.jackpotCombineNum++;
		statFactors.reSpin01BaseCount++;
		statFactors.reSpin01BaseWin += s2CSpin.rs[s2CSpin.rs.length - 1].ex.jw ? s2CSpin.rs[s2CSpin.rs.length - 1].ex.jw : 0;
	}
	if (!isFreeSpin && subjectId === 10025) {
		const wildCount = Object.keys(statFactors.wildMap25).length;
		if (wildCount > 0) {
			statFactors.showWildCount++;
			statFactors.wildCount += wildCount;
			statFactors.wildMap25 = {};
		}
		if (statFactors.freeRetriggerOneFree) {
			statFactors.freeRetriggerNoRepeat++;
			if (statFactors.freeRetriggerOneFree < 4) {
				statFactors.freeRetriggerTimeMap[statFactors.freeRetriggerOneFree]++;
			} else {
				statFactors.freeRetriggerTimeMap[4]++;
			}
			statFactors.freeRetriggerOneFree = 0;
		}
	}
	for (let i = 0; i < s2CSpin.rs.length; i++) {
		if (s2CSpin.rs[i].tgfs) {
			statFactors.totalFreeSpin += slotState.getTotalFreeSpin(subjectId);
			++statFactors.featureCount;
			++statFactors.freeSpinTriggerCount;
			statFactors.freeSpinNoRetrigger += s2CSpin.rs[i].lfs;
			if (!statFactors.freeSpinTimesMap[s2CSpin.rs[i].lfs]) {
				statFactors.freeSpinTimesMap[s2CSpin.rs[i].lfs] = 0;
			}
			statFactors.freeSpinTimesMap[s2CSpin.rs[i].lfs]++;

			if (s2CSpin.rs[i].ex.lockWild) {
				if (!statFactors.B02Map[s2CSpin.rs[i].ex.lockWild.length]) {
					statFactors.B02Map[s2CSpin.rs[i].ex.lockWild.length] = 0;
				}
				statFactors.B02Map[s2CSpin.rs[i].ex.lockWild.length]++;
				statFactors.B02Count++;
			}
			if (subjectId === 10025 && s2CSpin.rs[i].ex.lockWild.length) {
				s2CSpin.rs[i].ex.lockWild.map(wild => {
					statFactors.wildMap25[wild.col + '_' + wild.row] = 1;
				});
			}
		}
		if (s2CSpin.rs[i].rtfst > 0) {
			++statFactors.freeSpinRetriggerCount;
			++statFactors.freeRetriggerOneFree;
			statFactors.freeSpinWithRetrigger += s2CSpin.rs[i].rtfst;
			if (!statFactors.freeSpinTimesMap[s2CSpin.rs[i].rtfst]) {
				statFactors.freeSpinTimesMap[s2CSpin.rs[i].rtfst] = 0;
			}
			statFactors.freeSpinTimesMap[s2CSpin.rs[i].rtfst]++;
			if (subjectId === 10025 && s2CSpin.rs[i].ex.lockWild.length) {
				s2CSpin.rs[i].ex.lockWild.map(wild => {
					statFactors.wildMap25[wild.col + '_' + wild.row] = 1;
				});
			}
		}
		if (s2CSpin.rs[i].ex.challengeWin > 0) {
			statFactors.challengeFinishCount++;
			statFactors.challengeWin += s2CSpin.rs[i].ex.challengeWin;
		}
		if (s2CSpin.irs > 0) {
			if (isFreeSpin) {
				statFactors.reSpinWinInFree += s2CSpin.rs[i].wr * activeBet;
			} else {
				statFactors.reSpinWinInBase += s2CSpin.rs[i].wr * activeBet;
			}
		}

		if (s2CSpin.rs[i].ex.jackPotWin > 0) {
			++statFactors.featureCount;
			++statFactors.jackPotCount;
			statFactors.jackPotWin += s2CSpin.rs[i].ex.jackPotWin;
			if (isFreeSpin) {
				statFactors.jackPotWinInFree += s2CSpin.rs[i].ex.jackPotWin;
			} else {
				statFactors.jackPotWinInBase += s2CSpin.rs[i].ex.jackPotWin;
				statFactors.jackPotWinNoCredit += s2CSpin.rs[i].ex.jackPotWinNoCredit;
			}
			if (!statFactors.jackpotMap[s2CSpin.rs[i].ex.jackPotLevel]) {
				statFactors.jackpotMap[s2CSpin.rs[i].ex.jackPotLevel] = 0;
			}
			statFactors.jackpotMap[s2CSpin.rs[i].ex.jackPotLevel] += s2CSpin.rs[i].ex.jackPotWin;
			if (!statFactors.jackpotLevelMap[s2CSpin.rs[i].ex.jackPotLevel]) {
				statFactors.jackpotLevelMap[s2CSpin.rs[i].ex.jackPotLevel] = 0;
			}
			statFactors.jackpotLevelMap[s2CSpin.rs[i].ex.jackPotLevel]++;

			if (!statFactors.b02Map_29[s2CSpin.rs[i].lockedPos]) {
				statFactors.b02Map_29[s2CSpin.rs[i].lockedPos] = 0;
			}
			statFactors.b02Map_29[s2CSpin.rs[i].lockedPos]++;
			statFactors.b02Count_29++;
		}

		if (subjectId === 10096) {
			const wild = this.symbolCounter.count(s2CSpin.rs[i].pa, [1101, 1102, 1103]);
			if (wild.length > 0) {
				const symbolId = wild[0].symbolId;
				if (statFactors.wild96Map[symbolId] === undefined) {
					statFactors.wild96Map[symbolId] = {};
				}
				if (statFactors.wild96Map[symbolId][wild.length] === undefined) {
					statFactors.wild96Map[symbolId][wild.length] = 0;
				}
				statFactors.wild96Map[symbolId][wild.length]++;
			}
		}
	}
	if (s2CSpin.rs[0].ex.rewardDragons) {
		const rewardDragons = s2CSpin.rs[0].ex.rewardDragons;
		let bonus05Win = 0;
		for (const i in rewardDragons) {
			bonus05Win += rewardDragons[i] / activeTotalBet;
		}
		if (bonus05Win > 0) {
			if (!statFactors.bonus05Map[bonus05Win]) {
				statFactors.bonus05Map[bonus05Win] = 0;
			}
			statFactors.bonus05Map[bonus05Win]++;
			statFactors.bonus05Count++;
		}
	}

	if (s2CSpin.rs[s2CSpin.rs.length - 1].ex.collectWin) {
		statFactors.collectWin_22 += s2CSpin.rs[s2CSpin.rs.length - 1].ex.collectWin;
		statFactors.collectCount_22++;
	}
	if (s2CSpin.rs[0].ex.freeSpinType) {
		statFactors.freeTypeMap[s2CSpin.rs[0].ex.freeSpinType]++;
		statFactors.freeTypeWinMap[s2CSpin.rs[0].ex.freeSpinType] += totalWin;
	}
	if (subjectId === 10025 && s2CSpin.rs[0].bonusWin && s2CSpin.rs[0].bonusWin > 0) {
		statFactors.awakeningBonus25Win += s2CSpin.rs[0].bonusWin;
		statFactors.awakeningBonus25Count++;
	}


	if (subjectId === 10093) {
		const scatterCollected = isFreeSpin ? statFactors.scatterCollected.free : statFactors.scatterCollected.base;
		scatterCollected[s2CSpin.rs[0].ex.scatter.length]++;

		const diamondCollected = isFreeSpin ? statFactors.diamondCollected.free : statFactors.diamondCollected.base;
		let hasRIDiamond = false;
		for (let i = 0; i < s2CSpin.rs[0].ex.diamondInfo.length; ++i) {
			if (s2CSpin.rs[0].ex.diamondInfo[i].isRI) {
				hasRIDiamond = true;
				statFactors.RIDiamond++;
				break;
			}
		}
		const diamondCount = hasRIDiamond ? s2CSpin.rs[0].ex.diamondInfo.length - 2 : s2CSpin.rs[0].ex.diamondInfo.length;
		diamondCollected[diamondCount]++;

		statFactors.bingoDiamond += s2CSpin.rs[0].ex.bingoDiamondCoin;
		statFactors.bingoJackpot += s2CSpin.rs[0].ex.bingoJackpotCoin;

		statFactors.megaBonus += s2CSpin.rs[0].ex.megaBonus;
		statFactors.superBonus += s2CSpin.rs[0].ex.superBonus;

		statFactors.wheelJackpot += (s2CSpin.rs[0].ex.wheelBingoJackpotCoin + s2CSpin.rs[0].ex.wheelMegaJackpotCoin + s2CSpin.rs[0].ex.wheelSuperJackpotCoin);
		statFactors.wheelBingoJackpot += s2CSpin.rs[0].ex.wheelBingoJackpotCoin;
		statFactors.wheelMegaJackpot += s2CSpin.rs[0].ex.wheelMegaJackpotCoin;
		statFactors.wheelSuperJackpot += s2CSpin.rs[0].ex.wheelSuperJackpotCoin;

		statFactors.wheelDiamond += (s2CSpin.rs[0].ex.wheelBingoDiamondCoin + s2CSpin.rs[0].ex.wheelMegaDiamondCoin + s2CSpin.rs[0].ex.wheelSuperDiamondCoin);
		statFactors.wheelBingoDiamond += s2CSpin.rs[0].ex.wheelBingoDiamondCoin;
		statFactors.wheelMegaDiamond += s2CSpin.rs[0].ex.wheelMegaDiamondCoin;
		statFactors.wheelSuperDiamond += s2CSpin.rs[0].ex.wheelSuperDiamondCoin;

		if (s2CSpin.rs[0].ex.triggerBingo) {
			statFactors.bingoWinsNumber++;
			statFactors.bingoWheelTrigger += s2CSpin.rs[0].ex.bingoWheelTrigger;

			if (s2CSpin.rs[0].ex.normalBingoTrigger) {
				statFactors.normalBingoWinsNumber += s2CSpin.rs[0].ex.normalBingoTrigger;
			}
		}
		if (s2CSpin.rs[0].ex.normalBingoSpin) {
			statFactors.normalBingoSpin++;
		}

		for (const k in s2CSpin.rs[0].ex.jackPotWinMap) {
			const info = s2CSpin.rs[0].ex.jackPotWinMap[k];
			if (!statFactors.jackpotLevelMap[info.level]) {
				statFactors.jackpotLevelMap[info.level] = 0;
			}
			statFactors.jackpotLevelMap[info.level]++;
		}

	}
	if (isFreeSpin) {
		for (var i = 0; i < s2CSpin.rs.length; i++) {
			var rs = s2CSpin.rs[i];
			if (rs.ex.scatterWin) {
				statFactors.scatterWinFree += rs.ex.scatterWin;
			}
			var winRes = s2CSpin.rs[i].wl.length > 0 ? s2CSpin.rs[i].wl : s2CSpin.rs[i].wp;

			if (winRes.length > 0) {
				let count = 0;
				for (var index = 0; index < winRes.length; index++) {
					var line = winRes[index];
					if (!statFactors.freeWinSymbolMap[line.matchSymbolId]) {
						statFactors.freeWinSymbolMap[line.matchSymbolId] = {};
					}
					if (!statFactors.freeWinSymbolMap[line.matchSymbolId][line.num]) {
						statFactors.freeWinSymbolMap[line.matchSymbolId][line.num] = 0;
					}
					statFactors.freeWinSymbolMap[line.matchSymbolId][line.num] += 1;

					if (!statFactors.freeWinMap[line.matchSymbolId]) {
						statFactors.freeWinMap[line.matchSymbolId] = {};
					}
					if (!statFactors.freeWinMap[line.matchSymbolId][line.num]) {
						statFactors.freeWinMap[line.matchSymbolId][line.num] = 0;
					}
					statFactors.freeWinMap[line.matchSymbolId][line.num] += line.winRate * activeBet;
					//5 of a kind
					if (line.num >= fiveOFKind) {
						count ++;
					}
				}
				//5 of a kind
				if (i != 0) {
					continue;
				}
				if (count > 0) {
					statFactors.fiveOFKindbaseCount ++;
				}
			}
		}
	} else if (isBaseSpin) {
		for (var i = 0; i < s2CSpin.rs.length; i++) {
			var rs = s2CSpin.rs[i];
			if (rs.ex.scatterWin) {
				statFactors.scatterWinBase += rs.ex.scatterWin;
			}
			var winRes = s2CSpin.rs[i].wl.length > 0 ? s2CSpin.rs[i].wl : s2CSpin.rs[i].wp;
			if (winRes.length > 0) {
				let count = 0;
				for (var index = 0; index < winRes.length; index++) {
					var line = winRes[index];

					if (!statFactors.baseWinSymbolMap[line.matchSymbolId]) {
						statFactors.baseWinSymbolMap[line.matchSymbolId] = {};
					}
					if (!statFactors.baseWinSymbolMap[line.matchSymbolId][line.num]) {
						statFactors.baseWinSymbolMap[line.matchSymbolId][line.num] = 0;
					}
					statFactors.baseWinSymbolMap[line.matchSymbolId][line.num] += 1;

					if (!statFactors.baseWinMap[line.matchSymbolId]) {
						statFactors.baseWinMap[line.matchSymbolId] = {};
					}
					if (!statFactors.baseWinMap[line.matchSymbolId][line.num]) {
						statFactors.baseWinMap[line.matchSymbolId][line.num] = 0;
					}
					statFactors.baseWinMap[line.matchSymbolId][line.num] += line.winRate * activeBet;
					//5 of a kind
					if (line.num >= fiveOFKind) {
						count ++;
					}
				}
				if (i != 0) {
					continue;
				}
				if (count > 0) {
					statFactors.fiveOFKindfreeCount ++;
				}
			}
		}
	}

	if (subjectId === 10029) {
		statFactors.bigFortuneRewardBase += s2CSpin.rs[0].ex.bigFortuneRewardBase;
		statFactors.bigFortuneRewardFree += s2CSpin.rs[0].ex.bigFortuneRewardFree;
		statFactors.baseWinRate += s2CSpin.rs[0].ex.baseWinRate;
		statFactors.freeWinRate += s2CSpin.rs[0].ex.freeWinRate;
		statFactors.jackpotReward += s2CSpin.rs[0].ex.jw;
	}

	const pa = s2CSpin.rs[0].pa;
	if (scatterId > 0) {
		if (pa != null && pa != undefined) {
			for (let i = 0; i < pa.length; i++) {
				for (let j = 0; j < pa[i].length; j++) {
					if (pa[i][j] == scatterId) {
						statFactors.scatterCount++;
					}
				}
			}
		}
	}
};

SlotSimulator.prototype.statRespinCount = function (s2CSpin, statFactors, isFreeSpin) {

	const len = s2CSpin.rs[0].ex['totalReSpin'] || s2CSpin.rs.length - 1;
	if (len < 1) {
		return;
	}

	const key = 'respin' + (isFreeSpin ? 'Free' : 'Base');
	statFactors[`${key}Size`] += len;
	statFactors[`${key}Cnt`]++;
};

SlotSimulator.prototype.printResult = function (mainArgs, statFactors) {
	const output = {};
	output['subject'] = mainArgs.subjectId;
	output['activeBet'] = mainArgs.activeTotalBet / this.coins;
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

	outToXlsx(output, {
		symbolData: symbolCountData.concat(symbolRTPData),
		wildData,
	});
};

const outToXlsx = function(output, data) {
	const mainData = [['指标', '结果']];
	const mainSheet = { name: 'main', data: mainData };

	mainData.push(
		['subject', output['subject']],
		['activeBet', output['activeBet']],
		['activeTotalBet', output['activeTotalBet']],
		['loopCount', output['loopCount']],
		['baseCount', output['baseCount']],
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

	fs.writeFileSync(`./simulationRes/simRes-${Date.now()}-${output['subject']}.xlsx`, nodeXlsx.build([mainSheet, symbolSheet, wildSheet]));
};

module.exports = SlotSimulator;
