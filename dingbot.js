'use strict';
// usage:

const dingbot = require('./simulationBot');
//https://oapi.dingtalk.com/robot/send?access_token=a688a597c2749aca81c532d615cf66854a06a8e2dca2e93aafd5325d322a0e76
const token = 'a688a597c2749aca81c532d615cf66854a06a8e2dca2e93aafd5325d322a0e76';
const secret = 'SECb9f4a36454d50ba00c102e6b9a5ba0dcc6b1895f86ec21917954feb144b23537';
const content = '模拟结果跑完了， 点击http://10.0.88.100:8082/simulation/ 下载模拟结果'
dingbot(content, token, secret);
