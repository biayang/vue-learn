const config = require('../conf')
const path = require('path')
const express = require('express');
const router = express.Router();
const simpleGit = require('simple-git');
const { exec } = require('child_process');
const fs = require('fs')

/**
 * config
 */
let gitLib = (req) => {
  let fileName = null;
  let configPath = null;

  if (req.body.branch == 'prod') {
    baseDir = config.gitProd.dir;
    subDir = config.gitProd.subDir;
    igDirs = config.gitProd.igDirs;
    commitCmd = config.gitProd.commitCmd;
    downCmd = config.gitProd.downCmd;
    cloneCmd = config.gitProd.cloneCmd;
  } else {
    baseDir = config.gitDev.dir;
    subDir = config.gitDev.subDir;
    igDirs = config.gitDev.igDirs;
    commitCmd = config.gitDev.commitCmd;
    downCmd = config.gitDev.downCmd;
    cloneCmd = config.gitDev.cloneCmd;
  }
  return {
    configPath: configPath,
    fileName: fileName,
    subDir: subDir,
    igDirs: igDirs,
    baseDir: baseDir,
    downCmd: downCmd,
    commitCmd: commitCmd,
    cloneCmd: cloneCmd,
    env: req.body.branch,
    git: simpleGit({
      baseDir: baseDir,
      binary: 'git',
      maxConcurrentProcesses: 6
    })
  };
}

/**
 * router
 */
router.post('/', async function (req, res, next) {
  let gitlib = gitLib(req)
  if (!checkAuth(req.headers.authorization)) {
    res.status(403).send();
    return;
  }
  let git = gitlib.git

  let files = await git.raw(["ls-files", "--full-name", "-oc"])

  let arr = files.split("\n").filter((item) => {
    if (gitlib.igDirs) {

      for (j = 0, len = gitlib.igDirs.length; j < len; j++) {
        if (item != "" && item.indexOf(gitlib.igDirs[j]) === 0) {
          return false;
        }
      }
    }
    if (gitlib.subDir) {
      return item != "" && item.indexOf(gitlib.subDir) === 0;
    }
    return item != ""
  }, gitlib)

  let st = await git.status();
  res.json({ err: null, files: arr, status: st })
});

router.post('/down', function (req, res, next) {
  let gitlib = gitLib(req)
  let shellUrl = `cd ${gitlib.baseDir}tools/ && ` + gitlib.downCmd;
  //记录操作日志
  _oplog(req.headers.authorization, "do config down");

  const cmd = [shellUrl, gitlib.env, req.body.file].join(' ');
  doCmd(res, cmd)
})

router.post('/commit', async (req, res, next) => {
  fileName = req.body.file;

  if (Object.keys(fileName).length == 0) {
    console.error('empty param tbData');
    return;
  }

  let gitlib = gitLib(req)

  let git = gitlib.git
  let commitCmd = gitlib.commitCmd

  try {

    await git.add(fileName)

    const commitMsg = `update ${fileName}`;
    await git.commit(commitMsg, fileName);

    await git.push()
  }
  catch (e) {
    console.error(e);
  }
  //记录操作日志
  _oplog(req.headers.authorization, `do config commit and push,${fileName}`);
  doCmd(res, commitCmd)
})

router.post('/diff', async (req, res, next) => {
  fileName = req.body.file;

  let gitlib = gitLib(req)
  let git = gitlib.git

  if (Object.keys(fileName).length == 0) {
    diff = await git.diff()
  } else {
    diff = await git.diff([fileName])
  }
  console.log('the diff is', JSON.stringify(diff))
  //记录操作日志
  _oplog(req.headers.authorization, `do config diff,${fileName}`);

  res.json({ diff: diff, file: fileName })
})

router.post('/log', async (req, res, next) => {
  fileName = req.body.file;

  let gitlib = gitLib(req)
  let git = gitlib.git

  log = await git.log({
    n: 5,
    file: fileName
  })
  console.log('the log is', JSON.stringify(log))
  //记录操作日志
  _oplog(req.headers.authorization, `do config log show,${fileName}`);

  res.json({ log: log, file: fileName })
})

router.post('/clone', async (req, res, next) => {
  let gitlib = gitLib(req)
  let cmd = `${gitlib.baseDir}${gitlib.cloneCmd}`;
  //记录操作日志
  _oplog(req.headers.authorization, `DO ALL CONFIG CLONE,${gitlib.baseDir}`);
  doCmd(res, cmd);
})

module.exports = router;

let doCmd = (res, cmd) => {
  exec(cmd, (err, stdout, stderr) => {
	if (err) {
      console.error(err);
	}
	console.info({ out: stdout, err: stderr });
    res.json({ out: stdout, err: stderr })
  })
}

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
          if (!config.auth.git.includes(authority)) {
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
