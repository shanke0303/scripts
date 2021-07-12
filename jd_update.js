/**
 * 强制更新
 * cron=0 0-23/12 * * *
 */

const exec = require('child_process').exec;

exec("cd /ql/repo/shanke0303_scripts; git fetch --all; git reset --hard origin/master; git pull", (error, stdout, stderr) => {
  console.log(1, error)
  console.log(2, stdout.trim())
  console.log(3, stderr)
})

if (__dirname.indexOf('/ql/') > -1) {
  exec('ql repo https://github.com/shanke0303/scripts.git "jd_|jx_|jddj_|getCookie|smzdm_mission" "activity|backUp" "^jd[^_]|USER|Env|tg-cli|sign_graphics_validate|JDJRValidator_Pure|ZooFaker_Necklace"', (error, stdout, stderr) => {
    console.log(1, error)
    console.log(2, stdout.trim())
    console.log(3, stderr)
  })
}