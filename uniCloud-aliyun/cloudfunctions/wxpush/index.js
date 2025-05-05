// 引入uni-subscribemsg公共模块
const UniSubscribemsg = require('uni-subscribemsg');
// 初始化实例
exports.main = async (event, context) => {
	const {
		openid,
		template_id,
		page,
		miniprogram_state,
		lang,
		data,
	} = event;
	if(!template_id || !page || !miniprogram_state || !page || !miniprogram_state || !lang || !data){
		return false;
	}
	let uniSubscribemsg = new UniSubscribemsg({
		dcloudAppid: "__UNI__FCC2B55",
		provider: "weixin-mp",
	});
	// 发送订阅消息
	let res = await uniSubscribemsg.sendSubscribeMessage({
		touser: openid,
		template_id,
		page, // 小程序页面地址
		miniprogram_state, // 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
		lang,
		data,
	});
	return res
}