import got from 'got';

const response = await got.get('https://ip.cn/api/index?ip=180.113.195.28&type=0').json();

console.log(response);