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

	console.log('add tips cloud function: data = ', data);

	if (!uid) {
		console.log('add tips cloud function failed, unregistered uid: ' + uid);
		return "";
	}

	// 业务代码
	if (data.op == "accept") {
		db.collection('health-tips').where({
			_id: data._id
		}).update({
			nickname: data.nickname,
			accept: data.accept,
		});
	} else if (data.op == "update") {
		db.collection('health-tips').where({
			_id: data._id
		}).update({
			cid: data.cid,
			content: data.content,
		});
	} else {
		db.collection('health-tips').add({
			uid: data.uid,
			nickname: data.nickname,
			cid: data.cid,
			rid: data.rid,
			fileUrl: data.fileUrl,
			content: data.content,
			accept: false
		});
	}
	return data.content;
};