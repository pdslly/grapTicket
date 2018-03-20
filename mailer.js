var nodemailer = require("nodemailer");

var transportOption = {
	host: "smtp.qq.com",
	secureConnection: true,
	port: 465,
	auth: {
		user: "313250678@qq.com",
		pass: ""//这里填写QQ邮箱授权码
	}
};

var mailOption = {
	from: "票务提示 <313250678@qq.com>",
	to: "pdslly@yeah.net",
	subject: "hello world",
	html: "<h1>HELLO WORLD</h1>"
}

function SMTP(){
	this.smtpTransport = nodemailer.createTransport(transportOption);
}

SMTP.prototype = {
	setMailTo(mailAddr){
		mailOption.to = mailAddr
	},
	setMailTitle(title){
		mailOption.subject = title
	},
	setMailContent(content){
		mailOption.html = content
	},
	send(){
		const smtpTransport = this.smtpTransport;
		smtpTransport.sendMail(mailOption, function(error, response){
			if(error){
				console.log(error)
			}else{
				console.log("Message sent: "+response.message);
			}
			smtpTransport.close();
		})
	}
}

module.exports = new SMTP();
