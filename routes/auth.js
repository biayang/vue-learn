const fs = require('fs')
const express = require('express');
const path = require('path');
const config = require('../conf');
const router = express.Router();

const EXPIRE_TIME = 1000 * 60 * 60 * 24;

router.post('/', function (req, res, next) {
    let authlist = [];
    const authfilePath = path.normalize(path.join(__dirname, '../auth.json'));
    console.log(fs.existsSync(authfilePath))
    if (!fs.existsSync(authfilePath)) {
        const admin = 'admin' + '=' + '123456' + '=' + (Date.now() + EXPIRE_TIME);
        console.log(admin)
        const data = { token: admin, authority: 'admin' }
        fs.writeFileSync(authfilePath, `${JSON.stringify(data)}\n`);
        authlist.push({user:'admin', pass:'123456', authority:'admin'});
    } else {
        const auths = fs.readFileSync(authfilePath, { encoding: 'utf8', flag: 'r' }).trim().split('\n');
        for (let i = 0; i < auths.length; i++) {
            const token = JSON.parse(auths[i]).token;
            const authority = JSON.parse(auths[i]).authority;
            const user = token.split('=')[0];
            const pass = token.split('=')[1];
            authlist.push({user, pass, authority});
        }
    }
    return res.status(200).send({ message: 'init success', authlist});
});

router.post('/op', function (req, res, next) {
    let oplist = [];
    console.log(fs.existsSync(config.opLogPath))
    if (fs.existsSync(config.opLogPath)) {
        const ops = fs.readFileSync(config.opLogPath, { encoding: 'utf8', flag: 'r' }).split('\n');
        for (let i = 0; i < ops.length; i++) {
            const op = ops[i].split(',');
            const user = op[0];
            const date = op[1];
            const message = op[2];
            const path = op[3];
            oplist.push({user, date, message, path});
        }
    }
    return res.status(200).send({ message: 'init success', oplist: oplist});
});

router.post('/opfilter', function (req, res, next) {
    let oplist = [];
    const {name, starttime, endtime} = req.body;
    console.log(fs.existsSync(config.opLogPath))
    if (fs.existsSync(config.opLogPath)) {
        const ops = fs.readFileSync(config.opLogPath, { encoding: 'utf8', flag: 'r' }).split('\n');
        for (let i = 0; i < ops.length; i++) {
            const op = ops[i].split(',');
            const user = op[0];
            const date = op[1];
            const message = op[2];
            const path = op[3];
            if(user == name) {
                const logtime = new Date(date).getTime();
                const start = new Date(starttime).getTime();
                const end = new Date(endtime).getTime();
                if(logtime > start && logtime < end) {
                    oplist.push({user, date, message, path});
                }
            }
        }
    }
    return res.status(200).send({ message: 'init success', oplist: oplist});
});

router.post('/login', function (req, res, next) {
    const { name, password } = req.body;
    console.info('login param: ', name, password);
    if (name && password) {
        const authfilePath = path.normalize(path.join(__dirname, '../auth.json'));
        let ctoken = '';
        console.log(fs.existsSync(authfilePath))
        if (!fs.existsSync(authfilePath)) {
            const admin = 'admin' + '=' + '123456' + '=' + (Date.now() + EXPIRE_TIME);
            console.log(admin)
            const data = { token: admin, authority: 'admin' }
            fs.writeFileSync(authfilePath, `${JSON.stringify(data)}\n`);
        } else {
            //检测user是否已经存在
            const auths = fs.readFileSync(authfilePath, { encoding: 'utf8', flag: 'r' }).trim().split('\n');
            for (let i = 0; i < auths.length; i++) {
                let token = JSON.parse(auths[i]).token;
                const authority = JSON.parse(auths[i]).authority;
                const user = token.split('=')[0];
                const pass = token.split('=')[1];
                const time = token.split('=')[2];
                if (name != user) {
                    continue;
                }
                if (password != pass) {
                    return res.status(200).send({ errno: 997 });
                }
                if (Date.now() > parseInt(time)) {
                    token = name + "=" + password + "=" + (Date.now() + EXPIRE_TIME);
                    auths[i] = JSON.stringify({ token, authority })
                }
                fs.writeFileSync(authfilePath, `${auths.join('\n')}\n`)
                return res.status(200).send({ message: 'login success', token, authority});
            }
        }
    } else {
        console.error('signin failed : ', username, password);
        return res.status(500).send();
    }
});

router.post('/change', function (req, res, next) {
    console.log('req', req.body);
    const { name, password, auth } = req.body;
    console.info('login param: ', name, auth, password);
    const authfilePath = path.normalize(path.join(__dirname, '../auth.json'));
    console.log(fs.existsSync(authfilePath))
    if (!fs.existsSync(authfilePath)) {
        return res.status(200).send({ errno: 997 });
    } else {
        //检测user是否已经存在
        const auths = fs.readFileSync(authfilePath, { encoding: 'utf8', flag: 'r' }).trim().split('\n');
        if (!checkAuth(req.headers.authorization, auths)) {
            res.status(403).send();
            return;
        }
        for (let i = 0; i < auths.length; i++) {
            const token = JSON.parse(auths[i]).token;
            const user = token.split('=')[0];
            if (name == user) {
                const iner_token = name + "=" + password + "=" + (Date.now() + EXPIRE_TIME);
                const data = { token: iner_token, authority: auth }
                auths[i] = JSON.stringify(data);
            }
        }
        fs.writeFileSync(authfilePath, `${auths.join('\n')}\n`)
    }
    return res.status(200).send({ message: 'change success' });
});

router.post('/delete', function (req, res, next) {
    console.log('req', req.body);
    const { name, password, auth } = req.body;
    console.info('login param: ', name, auth, password);
    const authfilePath = path.normalize(path.join(__dirname, '../auth.json'));
    console.log(fs.existsSync(authfilePath))
    if (!fs.existsSync(authfilePath)) {
        return res.status(200).send({ errno: 997 });
    } else {
        //检测user是否已经存在
        const auths = fs.readFileSync(authfilePath, { encoding: 'utf8', flag: 'r' }).trim().split('\n');
        if (!checkAuth(req.headers.authorization, auths)) {
            res.status(403).send();
            return;
        }
        let cloneauth = [];
        for (let i = 0; i < auths.length; i++) {
            const token = JSON.parse(auths[i]).token;
            const user = token.split('=')[0];
            if (name == user) {
                continue;
            }
            cloneauth.push(auths[i]);
        }
        fs.writeFileSync(authfilePath, `${cloneauth.join('\n')}\n`)
    }
    return res.status(200).send({ message: 'change success' });
});

router.post('/register', function (req, res, next) {
    console.log('req', req.body);
    const { name, password, authority } = req.body;
    console.info('login param: ', name, password, authority);
    const authfilePath = path.normalize(path.join(__dirname, '../auth.json'));
    let ctoken = '';
    console.log(fs.existsSync(authfilePath))
    if (!fs.existsSync(authfilePath)) {
        const admin = 'admin' + '=' + '123456' + '=' + (Date.now() + EXPIRE_TIME);
        console.log(admin)
        const data = { token: admin, authority: 'admin' }
        fs.writeFileSync(authfilePath, `${JSON.stringify(data)}\n`);
    } else {
        //检测user是否已经存在
        const auths = fs.readFileSync(authfilePath, { encoding: 'utf8', flag: 'r' }).trim().split('\n');
        for (let i = 0; i < auths.length; i++) {
            const token = JSON.parse(auths[i]).token;
            const user = token.split('=')[0];
            if (name == user) {
                return res.status(200).send({ errno: 998 });
            }
        }
        const token = name + "=" + password + "=" + (Date.now() + EXPIRE_TIME);
        ctoken = token;
        const data = { token: token, authority: authority }
        fs.appendFileSync(authfilePath, `${JSON.stringify(data)}\n`)
    }
    return res.status(200).send({ message: 'register success', token: ctoken });
});

router.post('/logout', function (req, res, next) {
    res.cookie('token', '', { maxAge: EXPIRE_TIME });
    console.info('logout success! user : ' + JSON.stringify(req.user));
    next({ message: 'success' });
});

module.exports = router;

let checkAuth = (authorization, auths) => {
    for (let i = 0; i < auths.length; i++) {
        const token = JSON.parse(auths[i]).token;
        const authority = JSON.parse(auths[i]).authority;
        if (token == authorization) {
            if (authority == 'admin') {
                return true;
            }
        }
    }
    return false;
}