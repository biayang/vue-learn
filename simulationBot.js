'use strict';


const crypto = require('crypto');
const https = require('https');

const simulationBot = (content, token, secret) => {

	// const body = { 
	// 	msgtype: 'link',
	// 	link: {
	// 		"text": "都是跑在本地的机台模拟，一天一次，挂了不管，",
	// 		"title": "每天一次要命的机台数值模拟",
	// 		"picUrl": "",
	// 		"messageUrl": "https://centurygame.yuque.com/docs/share/d016b2c6-2911-4acf-8e44-62a0913a1cf1?#dbec"
	// 	}
	// };
	const body = {
		msgtype: 'text',
		text: {
			content
		},
		isAtAll: false
	}

	const ts = Date.now();
	const signature= `${ts}\n${secret}`;
	const crypt = crypto.createHmac('sha256', secret).update(signature);
	const hash = encodeURIComponent(crypt.digest('base64'));
	const query = `?access_token=${token}&timestamp=${ts}&sign=${hash}`;

	const s = JSON.stringify(body);

	const option = {
		hostname: 'oapi.dingtalk.com',
		path: `/robot/send${query}`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(s),
		},
	};

	const req = https.request(option);
	req.write(s);
	req.end();
}
module.exports = simulationBot;
