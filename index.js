/** Created by 31325_000 on 2018/1/15...*/
const https = require('https')
const fs = require('fs')
const trainOption = require('./train.config')
const smtp = require('./mailer')
const schedule = require('node-schedule')

const options = {
    hostname: "kyfw.12306.cn",
    path: `/otn/leftTicket/queryZ?leftTicketDTO.train_date=${trainOption.train_date}&leftTicketDTO.from_station=${trainOption.train_from}&leftTicketDTO.to_station=${trainOption.train_to}&purpose_codes=ADULT`,
    method: "GET",
    cert: fs.readFileSync(`${__dirname}/srca.pem`)
}

options.agent = new https.Agent(options)

function task(){
    https.get(options, function(res){
        let data = ''
        if (res.statusCode !== 200){
            console.log(`failed!!!`)
            return
        }
        res.on('data', function(chunk){
            data += chunk
        })
        res.on('end', function(){
            let result = JSON.parse(data).data.result
            result.forEach(function(info){
                let fields = info.split('|')
                let label = `车次${fields[3]} 硬卧-${fields[23]||'无'} 无座-${fields[26] || '无'} 硬座-${fields[29] || '无'}`
                if (fields[23] === '有' || fields[26] === '有' || fields[29] === '有' || fields[23] > 0 || fields[26] > 0|| fields[29] > 0){
                    //smtp.setMailTitle(`车次${fields[3]}有票了！！！！！！`)
                    //smtp.send()
                    console.log(label)
                }
            })
        })
    })
}

schedule.scheduleJob('30 * 8-23 * * *', () => {
    console.log(`Date: ${new Date().toLocaleString()}`)
    task();
})