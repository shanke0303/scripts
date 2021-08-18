/**
 * 
 * 
 */


 const { once } = require('events');
 const { createReadStream } = require('fs');
 const { createInterface } = require('readline');
 const fs = require('fs');
 const path = require('path');

const got = require('got');
const TgCli = require('./tg-cli')
const tgCli = new TgCli()

const LOG_DIR = '/ql/log/code'

const shareCodeBot = process.env.SHARE_CODE_BOT
if (!shareCodeBot) {
    console.log(`未设置提交机器人环境变量($${SHARE_CODE_BOT})`);
    process.exit()
}

let jxCfdSharecodes = []
let FruitShareCodes = []
let shareCodes = []

let usernames = []

async function start() {
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

        rl.on('line', (line) => {
            // 处理行。
            if (line.startsWith('MyCfd')) {
                const sc = getCodeInline(line)
                if (sc) jxCfdSharecodes.push(sc)
            } else if (line.startsWith('MyFruit')) {
                const sc = getCodeInline(line)
                if (sc) FruitShareCodes.push(sc)
            } else if (line.startsWith('MyDreamFactory')) {
                const sc = getCodeInline(line)
                if (sc) shareCodes.push(sc)
            }
        });
    
        await once(rl, 'close');

        getUsernames()

        await submit()

        process.exit(0)
    } catch (err) {
      console.error(err);
    }
}

function getCodeInline(line) {
    console.log('Line Found:', line);
    let code = ''
    if (line) {
       const tmp = /'(.+?)'/.exec(line)
       if (tmp && tmp.length >= 2) {
        code = tmp[1]
       }
    }
    return code
}

function getUsernames() {
    // 用户名
    if (process.env.JD_USERNAME) {
        if (process.env.JD_USERNAME.indexOf('&') > -1) {
            console.log(`您的用户名选择的是用&隔开\n`)
            usernames = process.env.JD_USERNAME.split('&');
        } else if (process.env.JD_USERNAME.indexOf('\n') > -1) {
            console.log(`您的用户名选择的是用换行隔开\n`)
            usernames = process.env.JD_USERNAME.split('\n');
        } else {
            usernames = process.env.JD_USERNAME.split();
        }
    } else {
        console.log(`您环境变量(JD_USERNAME)里面未设置`)
    }
}




async function submit() {

    console.log('惊喜财富岛互助码:', jxCfdSharecodes);
    console.log('东东农场互助码:', FruitShareCodes);
    console.log('京喜工厂互助码:', shareCodes);
    console.log('用户名:', usernames);
    
    if (jxCfdSharecodes.length > 0 && jxCfdSharecodes.length > 0) {
        console.log('// 1.');
        console.log('-------------------------【惊喜财富岛互助码】开始提交...-------------------------');
        try{
            // /jx_cfd code1&code1@username1&username2
            const cfdCode = '/jx_cfd ' + jxCfdSharecodes.join('&') + '@' + usernames.join('&')
            await submitShareCode(cfdCode)
            await sleep(5000)
            const response = await got('http://51.15.187.136:8080/activeJdCfdCode?code=' + usernames.join('&'));
            console.log('激活状态:', response.body);
        } catch (error) {
            console.log(error);
        }
        console.log('-------------------------【惊喜财富岛互助码】提交结束。-------------------------');
    }
    await sleep(3000)
    if(FruitShareCodes.length > 0) {   
        console.log('// 2.');
        console.log('-------------------------【东东农场互助码】开始提交...-------------------------');
        try{
            // /jd_fruit code1&code2&code3
            const fruitCode = '/jd_fruit ' + FruitShareCodes.join('&')
            await submitShareCode(fruitCode)
            await sleep(5000)
            const response = await got('http://51.15.187.136:8080/activeJdFruitCode?code=' + FruitShareCodes.join('&'));
            console.log('激活状态:', response.body);
        } catch (error) {
            console.log(error);
        }
        console.log('-------------------------【东东农场互助码】提交结束。-------------------------');

        
    }
    await sleep(3000)

    if (shareCodes.length) {
        console.log('// 3.');
        console.log('-------------------------【京喜工厂互助码】开始提交...-------------------------');
        try{
            // /jx_factory code1&code2
            const factoryCode = '/jx_factory ' + shareCodes.join('&')
            await submitShareCode(factoryCode)
            await sleep(5000)
            const response = await got('http://51.15.187.136:8080/activeJdFactoryCode?code=' + shareCodes.join('&'));
            console.log('激活状态:', response.body);
        } catch (error) {
            console.log(error);
        }
        console.log('-------------------------【东东农场互助码】提交结束。-------------------------');
    }
}

// 通过telegram发送到bot
async function submitShareCode(shareCode) {
    console.log('开始发送提交邀请码消息:', shareCode);
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
}

function sleep(time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    })
}


start()