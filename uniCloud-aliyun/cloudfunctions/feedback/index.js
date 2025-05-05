'use strict';
const uniID = require('uni-id-common');
const db = uniCloud.databaseForJQL();
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
	let uid = payload.uid;

	if (!uid) {
		uid = "unregistered";
	}
	console.log('feedback cloud function : data = ' + JSON.stringify(data));
	// 业务代码
	db.collection('feedback-list').add({
		uid,
		nickname: data.nickname,
		feedback: data.feedback,
	});
	// // 将 Java 接口的响应返回给前端
	return data.feedback;
};