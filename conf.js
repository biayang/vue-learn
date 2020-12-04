let path = require('path');
module.exports = {
    /**
     * auth
     */
    auth: {
        git: ['admin', 'qa', 'pm'],
        trans: ['admin', 'pm']
    },
    /**
	 * op log
	 */
	opLogPath: path.join(__dirname, '.oplog.log'),
    /**
     * trans
     */
    // 翻译系统默认文件路径
    saveFilePath: path.join(__dirname, 'transData/tb.json'),
    /**
     * git
     */
    // git 开发配置
    gitDev: {
        // git目录
        dir: "../videoslotconfig/",
        // git忽略指定目录
        igDirs: [
                 "game-configs/video_slots_dev/app_configs/slot_config/subject_tmpl_list",
                 "game-configs/video_slots_dev/config"],
        // git指定目录, 默认留空
        subDir: "game-configs/video_slots_dev",
        // git 更新文件的自定义bash命令 如: 执行下载googledoc
        downCmd: "node switch-download.js",
        // git 更新、提交、push后执行的自定义bash命令
        commitCmd: "echo 'require configure [gitProd.commitCmd] in conf.js, like a bash command   ^_^'",
        //clone pm分支配置 to QAUpdate
        cloneCmd: "./clone-to-qabranch.sh"
    },
    // git 线上配置
    gitProd: {
        // git目录
        dir: "../videoslotconfig/",
        // git忽略指定目录
        igDirs: [
        "game-configs/video_slots_prod/app_configs/slot_config/subject_tmpl_list",
        "game-configs/video_slots_prod/config"],
        // git指定目录, 默认留空
        subDir: "game-configs/video_slots_prod",
        // git 更新文件的自定义bash命令 如: 执行下载googledoc
        downCmd: "node switch-download.js",
        // git 更新、提交、push后执行的自定义bash命令
        commitCmd: "echo 'require configure [gitProd.commitCmd] in conf.js, like a bash command   ^_^'",
        //clone pm分支配置 to QAUpdate
        cloneCmd: "./clone-to-qabranch.sh"
    },

}
