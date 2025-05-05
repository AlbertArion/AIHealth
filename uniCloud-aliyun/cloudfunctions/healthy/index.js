'use strict';
const uniID = require('uni-id-common')
const db = uniCloud.databaseForJQL()
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('chatai-msg, event : ', event)
	const {
		method,
		url,
		data,
		uniIdToken
	} = event;
	const uniIDIns = uniID.createInstance({ // 创建uni-id实例
		context: context,
		// config: {} // 完整uni-id配置信息，使用config.json进行配置时无需传此参数
	})
	const payload = await uniIDIns.checkToken(event.uniIdToken) // 后续使用uniIDIns调用相关接口
	const uid = payload.uid

	// console.log(payload,'payload')
	// 发起 HTTP 请求到 Java 接口
	const javaResponse = await uniCloud.httpclient.request(url, {
		method,
		data,
		contentType: 'json', // 指定以application/json发送data内的数据
		dataType: 'json', // 指定返回值为json格式，自动进行parse
		timeout: 20000,
	});
	const response = javaResponse.data;
	console.log("chatai-msg, response = " + JSON.stringify(response));
	if (uid && response.output) {
		// 业务代码
		db.collection('chatai-msg').add({
			uid,
			nickname: data.nickname,
			message: data.input.question,
			ai_message: response.output.content,
			approve: false,
			disapprove: false
		}).then((res) => {
			console.log("chatai message added, res = " + JSON.stringify(res));
			let {
				data: [userScore]
			} = db.collection('uni-id-scores').where({
					user_id: uid,
				})
				.orderBy("create_date", "desc")
				.limit(1)
				.get();
			let balance = 0
			if (userScore) {
				balance = userScore.balance
			}
			// 加积分
			// let score = 1;
			// balance += score
			// db.collection('uni-id-scores').add({
			// 	user_id: uid,
			// 	balance,
			// 	score,
			// 	type: 1,
			// 	create_date: Date.now(),
			// 	comment: '智能问答CID:' + res._id,
			// });
			// db.collection('uni-id-users').where({
			// 	_id: uid,
			// }).update({
			// 	score: balance,
			// });
		});
	} else {
		console.log("healthy 请求出错：uid = " + uid + ", response = " + JSON.stringify(response));
	}
	// 将 Java 接口的响应返回给前端
	return response;
};