/**
 * 
 * 
 * 
 */

const { once } = require('events');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');
const fs = require('fs');
const path = require('path');

const LOG_DIR = '/ql/log/passerby-b_JDDJ_jddj_fruit'

const shareCodeBot = process.env.SHARE_CODE_BOT
if (!shareCodeBot) {
    console.log(`未设置提交机器人环境变量($${SHARE_CODE_BOT})`);
    process.exit()
}

async function findAndSubmitShareCode() {

    try {
        // 查找运行日志
        fs.accessSync(LOG_DIR, fs.constants.F_OK | fs.constants.R_OK);
        console.log(`开始查找${LOG_DIR}目录下的运行日志...`);
        const files = fs.readdirSync(LOG_DIR, { withFileTypes: false })
        let lastestLogFile
        files.forEach(f => {
            if (f.endsWith('.log')) {
                const stats = fs.statSync(path.join(LOG_DIR, f))
                const creatTime = new Date(stats.ctime) //创建时间
                // const updateTime = new Date(data.mtime) //修改时间
                // const activeTime = new Date(data.atime) //访问时间
                const logFile = {
                    name: f,
                    time: creatTime
                }
                if (!lastestLogFile || logFile.time > lastestLogFile.time) {
                    lastestLogFile = logFile
                }
            }
        })

        if (!lastestLogFile) {
            console.log('未找到运行日志')
            return
        }
        console.log('找到最新的运行日志: ', lastestLogFile.name)
        console.log('开始从日志中查找邀请码...')
        // 逐行读取  
        const rl = createInterface({
            input: createReadStream(path.join(LOG_DIR, lastestLogFile.name)),
            crlfDelay: Infinity
        });
        let shareCode
        rl.on('line', (line) => {
            // 处理行。
            if (line.startsWith('京东到家果园互助码:JD_')) {
                shareCode = line.split(':')[1]
            }
        });
    
        await once(rl, 'close');
    
        if (shareCode) {
            console.log('找到邀请码: ', shareCode)
            await submitShareCode(shareCode)
        } else {
            console.log('没有发现邀请码');
        }
    } catch (err) {
      console.error(err);
    }
}

// 通过telegram发送到bot
async function submitShareCode(shareCode) {
    console.log('开始发送提交邀请码消息...');
    const TgCli = require('./tg-cli')
    const tgCli = new TgCli()
    try {
        await tgCli.msg({
          username: shareCodeBot,
          message: shareCode,
        })
        console.log('😄 消息已发送');
    } catch(error) {
        console.log('❌ 消息发送失败');
        console.log(error);
    }
    process.exit(0)
}

findAndSubmitShareCode()