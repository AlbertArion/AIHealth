'use strict';
const uniID = require('uni-id-common');
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

	console.log('ai sms cloud function: event = ' + JSON.stringify(event));

	if (!uid) {
		console.log('ai sms cloud function failed, unregistered uid: ' + uid);
		return "";
	}

	// 短信模版：「心脉AI」用户(昵称)申请了病历(病历id)的健康建议，快去「健康建议」中查看吧
	// 短信号码：钟医生：13683082173；浩然：18910646380
	const res = await uniCloud.sendSms({
		appid: '__UNI__FCC2B55',
		phoneList: ['13683082173', '18910646380'],
		templateId: '32008',
		data: {
			nickname: data.nickname,
			rid: data.rid
		}
	}).then((res) => {
		console.log('ai sms success, uid = ' + uid + ', nickname = ' + data.nickname + ', rid = ' +
			data.rid);
	}).catch((err) => {
		console.log('ai sms failed', err);
	});

	//返回数据给客户端
	return event;
};