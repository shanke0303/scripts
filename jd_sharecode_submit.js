/**
 * 
 * 
 */

const got = require('got');
const TgCli = require('./tg-cli')
const tgCli = new TgCli()

const shareCodeBot = process.env.SHARE_CODE_BOT
if (!shareCodeBot) {
    console.log(`未设置提交机器人环境变量($${SHARE_CODE_BOT})`);
    process.exit()
}

let jxCfdSharecodes = []
let FruitShareCodes = []
let shareCodes = []

let usernames = []


async function submit() {
    getShareCodes()
    getUsernames()

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

    process.exit(0)
}



function getShareCodes() {
    // 惊喜财富岛互助码
    if (process.env.JDCFD_SHARECODES) {
        if (process.env.JDCFD_SHARECODES.indexOf('&') > -1) {
            console.log(`您的东东农场互助码选择的是用&隔开\n`)
            jxCfdSharecodes = process.env.JDCFD_SHARECODES.split('&');
        } else if (process.env.JDCFD_SHARECODES.indexOf('\n') > -1) {
            console.log(`您的东东农场互助码选择的是用换行隔开\n`)
            jxCfdSharecodes = process.env.JDCFD_SHARECODES.split('\n');
        } else {
            jxCfdSharecodes = process.env.JDCFD_SHARECODES.split();
        }
    } else {
        console.log(`您环境变量(JDCFD_SHARECODES)里面未设置`)
    }

    // 东东农场互助码
    if (process.env.FRUITSHARECODES) {
        if (process.env.FRUITSHARECODES.indexOf('&') > -1) {
            console.log(`您的东东农场互助码选择的是用&隔开\n`)
            FruitShareCodes = process.env.FRUITSHARECODES.split('&');
        } else if (process.env.FRUITSHARECODES.indexOf('\n') > -1) {
            console.log(`您的东东农场互助码选择的是用换行隔开\n`)
            FruitShareCodes = process.env.FRUITSHARECODES.split('\n');
        } else {
            FruitShareCodes = process.env.FRUITSHARECODES.split();  
        }
    } else {
        console.log(`您环境变量(FRUITSHARECODES)里面未设置`)
    }

    // 京喜工厂互助码
    if (process.env.DREAM_FACTORY_SHARE_CODES) {
        if (process.env.DREAM_FACTORY_SHARE_CODES.indexOf('&') > -1) {
            console.log(`您的互助码选择的是用&隔开\n`)
            shareCodes = process.env.DREAM_FACTORY_SHARE_CODES.split('&');
        } else if (process.env.DREAM_FACTORY_SHARE_CODES.indexOf('\n') > -1) {
            console.log(`您的互助码选择的是用换行隔开\n`)
            shareCodes = process.env.DREAM_FACTORY_SHARE_CODES.split('\n');
        } else {
            shareCodes = process.env.DREAM_FACTORY_SHARE_CODES.split();
        }
    } else {
        console.log(`您环境变量(DREAM_FACTORY_SHARE_CODES)里面未设置`)
    }
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


submit()