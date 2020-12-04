const path = require('path')
const config = require('../conf')
const express = require('express');
const router = express.Router();
const fs = require('fs');
const simpleGit = require('simple-git');
const { format } = require('path');


let filePath = config.saveFilePath;
let fileDir = path.parse(config.saveFilePath).dir;
let fileName = path.parse(config.saveFilePath).base;

const git = simpleGit({
  baseDir: fileDir,
  binary: 'git',
  maxConcurrentProcesses: 6
});

router.get('/load', function (req, res, next) {
  if (!checkAuth(req.headers.authorization)) {
    res.status(403).send();
    return;
  }
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
      fs.writeFile(filePath, '[]', function (err) {
        if (err) {
          console.error(err);
        }
      })
    }
    res.json({ err: null, d: content ? JSON.parse(content) : '[]' })
  })
});

router.post('/save', async function (req, res, next) {
  tbData = req.body.tbData;

  if (Object.keys(tbData).length == 0) {
    console.error('empty param tbData');
    return;
  }

  tbDataStr = JSON.stringify(tbData, null, "\t");

  fs.writeFile(filePath, tbDataStr, { flag: 'w' }, async function (err) {
    if (err) {
      console.error(err);
    }

    try {
      await git.init()

      await git.add(fileName)

      await git.commit('default commit msg', fileName);
    }
    catch (e) {
      console.error(e);
    }
    //记录操作日志
    _oplog(req.headers.authorization, `翻译系统,save操作`);
    res.end('ok');
  })
});

router.get('/update', async function (req, res, next) {
  row = req.query.row

  content = fs.readFileSync(fileName, 'utf-8')
  console.log(content);
  //记录操作日志
  _oplog(req.headers.authorization, "翻译系统,update操作");
  res.json([])
})

let _oplog = (authorization, message) => {
  //记录操作日志
  if(authorization) {
    const user = _getName(authorization);
    const time = (new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    fs.appendFileSync(config.opLogPath, `${user},${time},${message}\n`);
  }
}

let _getName = (authorization) => {
const authfilePath = path.normalize(path.join(__dirname, '../auth.json'));
if(!fs.existsSync(authfilePath)) {
  res.json({ err: "no auth config, need register first"})
  return "";
} else {
  const auths = fs.readFileSync(authfilePath,{ encoding: 'utf8', flag: 'r' }).trim().split('\n');
  for (let i = 0; i < auths.length; i++) {
      const token = JSON.parse(auths[i]).token;
      if(token == authorization) {
        return token.split('=')[0];
      }
  }
  return "";
} 
}

let checkAuth = (authorization) => {
  const authfilePath = path.normalize(path.join(__dirname, '../auth.json'));
  if(!fs.existsSync(authfilePath)) {
    res.json({ err: "no auth config, need register first"})
    return false;
  } else {
    const auths = fs.readFileSync(authfilePath,{ encoding: 'utf8', flag: 'r' }).trim().split('\n');
    for (let i = 0; i < auths.length; i++) {
        const token = JSON.parse(auths[i]).token;
        const authority = JSON.parse(auths[i]).authority;
        if(token == authorization) {
          if (!config.auth.trans.includes(authority)) {
            return false;
          }
          const tokentime = token.split('=')[2];
          if (Date.now() > parseInt(tokentime)) {
            return res.status(200).send({ errno: 999 });
          }
        }
    }
    return true;
  }
}

module.exports = router;