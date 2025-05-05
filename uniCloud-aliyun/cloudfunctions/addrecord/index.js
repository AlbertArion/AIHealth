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
	const uid = payload.uid;

	console.log('add records cloud function : data = ' + JSON.stringify(data));

	if (!uid) {
		console.log('add records cloud function failed, unregistered uid: ' + uid);
		return "";
	}

	// 业务代码
	if (data.op == "update") {
		db.collection('health-records').where({
			_id: data._id
		}).update({
			nickname: data.nickname,
			fileUrl: data.fileUrl,
			name: data.name,
			gender: data.gender,
			age: data.age,
			hospital: data.hospital,
			content: data.content,
			label: data.label
		});
	} else {
		db.collection('health-records').add({
			uid,
			nickname: data.nickname,
			avatar: data.avatar,
			fileUrl: data.fileUrl,
			name: data.name,
			gender: data.gender,
			age: data.age,
			hospital: data.hospital,
			content: data.content,
			label: data.label
		}).then((res) => {
			console.log("record added, res = " + JSON.stringify(res));
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
			// let score = 2;
			// balance += score
			// db.collection('uni-id-scores').add({
			// 	user_id: uid,
			// 	balance,
			// 	score,
			// 	type: 1,
			// 	create_date: Date.now(),
			// 	comment: '上传电子病历RID:' + res._id,
			// });
			// db.collection('uni-id-users').where({
			// 	_id: uid,
			// }).update({
			// 	score: balance,
			// });
		});
	}
	// 将 Java 接口的响应返回给前端
	return data.fileUrl;
};