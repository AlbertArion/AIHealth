'use strict';
const {
	decode
} = require('querystring');
const uniID = require('uni-id-common');
const crypto = require('crypto');
exports.main = async (event, context) => {
	//event为客户端上传的参数
	const {
		method,
		data,
		uniIdToken
	} = event;
	const uniIDIns = uniID.createInstance({ // 创建uni-id实例
		context: context,
		// config: {} // 完整uni-id配置信息，使用config.json进行配置时无需传此参数
	});
	const payload = await uniIDIns.checkToken(event.uniIdToken); // 后续使用uniIDIns调用相关接口
	const uid = payload.uid;

	if (!uid) {
		console.log('we run cloud function failed, unregistered uid: ' + uid);
		return "";
	}

	//返回数据给客户端
	return decryptData(data.appid, data.sessionKey, data.encryptedData, data.iv);
};

function decryptData(appid, sessionKey, encryptedData, iv) {
	// base64 decode
	var sessionKeyBuffer = new Buffer(sessionKey, 'base64');
	var encryptedDataBuffer = new Buffer(encryptedData, 'base64');
	iv = new Buffer(iv, 'base64');
	// 解密
	var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, iv);
	// 设置自动 padding 为 true，删除填充补位
	decipher.setAutoPadding(true);
	var decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
	decoded += decipher.final('utf8');

	console.log("werun, decoded = " + decoded);

	decoded = JSON.parse(decoded);
	if (decoded.watermark && decoded.watermark.appid) {
		const waid = decoded.watermark.appid;
		if (waid != "" && waid != appid) {
			console.log("werun, appid not match: decoded.water.appid = " + waid + ", appid = " +
				appid);
		}
	}

	return decoded;
}