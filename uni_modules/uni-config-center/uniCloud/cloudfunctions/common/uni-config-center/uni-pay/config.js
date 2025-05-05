const fs = require('fs');
const path = require('path')
module.exports = {
	// 统一 - 支付回调地址,格式为 "服务空间ID":"URL化地址"
	"notifyUrl": {
		// 测试环境服务空间-支付回调地址
		// "mp-b267e273-19a7-4288-99c7-f6f27f9c5b77": "https://fc-mp-b267e273-19a7-4288-99c7-f6f27f9c5b77.next.bspapp.com/uni-pay-co",
		// 线上环境服务空间-支付回调地址（如果只有一个服务空间，则只需要配置线上环境服务空间即可）
		"mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4": "https://fc-mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.next.bspapp.com/uni-pay-co",
	},
	"notifyKey":"5FB2CD73C5B53918728457C50762E6D45FB2CS73C7B53918728417C50762E6D4", // 跨云函数通信时的加密密钥，建议手动改下，不要使用默认的密钥，长度保持在64位以上即可
	// 微信支付相关
	"wxpay": {
		"enable": true, // 是否启用微信支付
		// 微信 - 小程序支付
		"mp": {
			"appId": "wx7a339130c3ff4961", // 小程序的appid
			"secret": "fab5faee1818851ee8bd465b72245bba", // 小程序的secret
			"mchId": "1669521210", // 商户id
			// "key": "", // v2的api key
			// "pfx": fs.readFileSync(__dirname + '/wxpay/apiclient_cert.p12'), // v2需要用到的证书
			"v3Key": "Ew7elIjsCj67J2KzCMCkfs0hwpwIBKd0", // v3的api key
			"appCertPath": path.join(__dirname, 'wxpay/apiclient_cert.pem'), // v3需要用到的证书
			"appPrivateKeyPath": path.join(__dirname, 'wxpay/apiclient_key.pem'), // v3需要用到的证书
			"version": 3, // 启用支付的版本 2代表v2版本 3 代表v3版本
		},
	}
}