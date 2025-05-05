'use strict';
/**
 * 健康建议支付回调
 * 此处建议只改下订单状态，保证能及时返回给第三方支付服务器成功状态
 * 限制4秒内必须执行完全部的异步回调逻辑，建议将消息发送、返佣、业绩结算等业务逻辑异步处理（如用定时任务去处理这些异步逻辑）
 * 特别注意：因为金额是前端传的，需要再判断下金额和你业务系统订单中的金额是否一致，如果不一致，直接返回 return false;
 * 特别注意：因为金额是前端传的，需要再判断下金额和你业务系统订单中的金额是否一致，如果不一致，直接返回 return false;
 * 特别注意：因为金额是前端传的，需要再判断下金额和你业务系统订单中的金额是否一致，如果不一致，直接返回 return false;
 */
const db = uniCloud.databaseForJQL()
module.exports = async (obj) => {
	let {
		data = {}
	} = obj;
	let {
		order_no,
		out_trade_no,
		total_fee
	} = data; // uni-pay-orders 表内的数据均可获取到
	console.log(data, 'data====healthTip')
	let orderInfo = await db.collection('health-record-pay-info').where({
		orderId: order_no
	}).get();
	console.log(orderInfo, 'orderInfo');
	// 判断回调金额 和 数据是否与库里一致
	if (orderInfo.data.length > 0 && orderInfo.data[0].totalPrice === total_fee) {
		// 一致的话更新订单表和健康建议表
		db.collection('health-record-pay-info').where({
			orderId: order_no
		}).update({
			status: 1
		})
		db.collection('health-records').where({
			_id: data.recordId
		}).update({
			isPaid: true,
			orderId: order_no
		})
		return true
	}
	return false

	// 此处写你自己的支付成功逻辑开始-----------------------------------------------------------

	// 因为金额total_fee是前端传的，因此有被用户篡改的风险，因此需要判断下total_fee的值是否和你业务订单中的金额一致，如果不一致，直接返回 return false;

	// 有三种方式
	// 方式一：直接写数据库操作
	// 方式二：使用 await uniCloud.callFunction 调用其他云函数
	// 方式三：使用 await uniCloud.httpclient.request 调用http接口地址

	// 此处写你自己的支付成功逻辑结束-----------------------------------------------------------
	// user_order_success =  true 代表你自己的逻辑处理成功 返回 false 代表你自己的处理逻辑失败。
};