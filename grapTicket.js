var path = require("path"),
	https = require("https"),
	fs = require("fs"),
	trainOption = require("./train.config"),
	colors = require("colors"),
	mailer = require("./mailer"),
	schedule = require("node-schedule");

const options = {
	hostname: "kyfw.12306.cn",
	path: `/otn/leftTicket/queryA?leftTicketDTO.train_date=${trainOption.train_date}&leftTicketDTO.from_station=${trainOption.train_from}&leftTicketDTO.to_station=${trainOption.train_to}&purpose_codes=ADULT`,
	method: "GET",
	ca: fs.readFileSync(`${__dirname}/srca.cer.pem`)
}

options.agent = new https.Agent(options)

const queryTicket = function(){
	https.get(options, (res) => {
		var data = ""

		res.on("data", (chunk) => {
			data += chunk;
		})
		res.on("end", () => {
			const res = JSON.parse(data).data
			res.forEach((item, index) => {
				const DTO = item.queryLeftNewDTO;
				const code = DTO.station_train_code;
				let msg = "";
				if(trainOption.train_code.indexOf(code) < 0) return
				if(code.charAt(0) === "G"){
					msg = `匹配车次：${code} 车票信息: 一等座[${DTO.ze_num}] 二等卧[${DTO.zy_num}]`
					console.log(msg)
					if(parseInt(DTO.ze_num) > 0 || parseInt(DTO.zy_num) > 0 ){
						mailer.setMailTo("pdslly@yeah.net")
						mailer.setMailTitle(`车次：${code}有票了！！！！！`)
						mailer.setMailContent(msg);
						mailer.send();
					}
				}else{
					msg = `匹配车次：${code} 车票信息: 无座[${DTO.wz_num}] 硬座[${DTO.yz_num}] 硬卧[${DTO.yw_num}]`;
					console.log(msg)
					if(parseInt(DTO.wz_num) > 0 || parseInt(DTO.yz_num) > 0 || parseInt(DTO.yw_num) > 0 ){
						mailer.setMailTo("pdslly@yeah.net")
						mailer.setMailTitle(`车次：${code}有票了！！！！！`)
						mailer.setMailContent(msg);
						mailer.send();
					}
				}
			})
		})
	})
}

schedule.scheduleJob('30 * 8-23 * * *', () => {
	console.log(`Date: ${new Date().toLocaleString()}`)
	queryTicket();
})