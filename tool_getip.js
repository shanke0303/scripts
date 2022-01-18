const fs = require('fs')

const ipfile = 'ip.log' 

async function getIP(){
    await isFileExisted(ipfile)

    const {ip} = await require('got').get('https://ip.cn/api/index?ip=180.113.195.28&type=0').json();

    if (ip) {
        const oldip = fs.readFileSync(ipfile, {
            encoding: 'utf-8'
        })
        if (!oldip || ip !== oldip) {  
            const text = `IP发生变化: ${oldip}(旧) > ${ip}(新).`
            console.log(text)
            fs.writeFileSync(ipfile, ip)
            require('./sendNotify.js').sendNotify('公网IP检测', text)
        } else {
            console.log(`IP未变化: ${oldip}.`)
        }
    }
}

/* 判断文件是否存在的函数
*@path_way, 文件路径
 */
function isFileExisted(path_way) {
    return new Promise((resolve, reject) => {
      fs.access(path_way, (err) => {
        if (err) {
          fs.appendFileSync(path_way, '', 'utf-8', (err) => {
            if (err) {
              reject(false)
            }
          });
        } else {
          resolve(true);
        }
      })
    })
};
  

getIP();