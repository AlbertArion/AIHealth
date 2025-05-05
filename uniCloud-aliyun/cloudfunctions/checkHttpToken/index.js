'use strict';
const uniID = require('uni-id-common')
exports.main = async (event, context) => {
	const uniIDIns = uniID.createInstance({ // 创建uni-id实例
		context: context,
		// config: {} // 完整uni-id配置信息，使用config.json进行配置时无需传此参数
	})
	//event为客户端上传的参数
	console.log('event : ', event)
	let data = JSON.parse(event.body);
	if (!data.token) {
		return {
			code: 401,
			msg: '未认证',
		}
	}
	const payload = await uniIDIns.checkToken(data.token) // 后续使用uniIDIns调用相关接口
	if (payload.code !== 0) {
		return {
			code: 401,
			msg: '未认证',
		}
	}
	//返回数据给客户端
	return {
		code: 200,
		msg: 'success',
		data: payload
	}
};