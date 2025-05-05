import {
	store
} from "@/uni_modules/uni-id-pages/common/store";
import {
	generateOrderNumber
} from "../utils/generateUUID";
import {
	freeTrial
} from "./admin";
import {
	getNowTime
} from "../utils/timestamp";

const noticeMap = { // 键值对：type -> template_id
	"recordTips": {
		template_id: "9UXfURdpqI2FUYiCjA_hHCu2alyjsV5272Mi-40up6M",
		page: "pages/records/records",
		thing1: "「心脉AI」健康建议",
		thing4: "您的报告解读已生成，请点击查看~",
		phrase5: "已生成"
	},
	"orderFreight": {
		template_id: "Ehg_wC6u9XNWdVS18pBJPoVrwTsezl12qDUJKMaXK7U",
		page: "modules/device/pages/myproducts",
		thing1: "「心脉AI」订单更新",
		phrase4: "已发货",
		thing6: "京东快递"
	},
	"healthReport": {
		template_id: "jVLxl20cBYoPJ6cbNOki8EHb5-j4NrSwRjt42OGgbeU",
		page: "pages/device/device"
	}
};

async function cloudNotify(uid, type, extra = {}) {

	const db = uniCloud.database();
	let {
		result
	} = await db.collection('uni-id-users').where({
		_id: uid
	}).field('wx_openid').get({
		getOne: true
	});

	console.log("Record, 发送微信订阅: ", result);
	if (result.data && result.data.wx_openid && result.data.wx_openid.mp) {
		let needNotify = undefined;
		const notice = noticeMap[type];
		const params = {};
		if (type == "recordTips") {
			params.thing1 = {
				value: notice.thing1
			};
			params.date2 = {
				value: getNowTime()
			};
			params.thing4 = {
				value: notice.thing4
			};
			params.phrase5 = {
				value: notice.phrase5
			};
		} else if (type == "orderFreight") {
			params.thing1 = {
				value: notice.thing1
			};
			params.date2 = {
				value: getNowTime()
			};
			params.character_string3 = {
				value: extra.freightId
			};
			params.phrase4 = {
				value: notice.phrase4
			};
			params.thing6 = {
				value: notice.thing6
			};
		} else {
			needNotify = false;
		}

		if (needNotify) {
			uniCloud.callFunction({
				name: 'wxpush', // 云函数名称
				data: {
					openid: result.data.wx_openid.mp,
					template_id: notice.template_id, // 发送的模版ID;
					page: notice.page, // 小程序页面地址
					miniprogram_state: "formal", // 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
					lang: "zh_CN",
					data: params
				},
			});
		}
	}
}

function exchangeForTips(index) {
	const total_score = 199;
	const description = '积分兑换健康解读';
	uni.navigateTo({
		url: `/pages/pay/scorepay?index=${index}&total_score=${total_score}&description=${description}&type=healthTip`
	});
}

function payForTips(index, record, isExpert = false) {
	const order_no = generateOrderNumber();
	const out_trade_no = `${order_no}`;
	const normal_fee = freeTrial() ? 0.01 : 19.9;
	const normal_fee_value = freeTrial() ? 1 : 1990;
	const expert_fee = freeTrial() ? 0.01 : 199;
	const expert_fee_value = freeTrial() ? 1 : 19900;
	const total_fee = isExpert ? expert_fee : normal_fee;
	const total_fee_value = isExpert ? expert_fee_value : normal_fee_value;
	const description = isExpert ? '申请专家建议费用' : '申请健康解读费用';
	uniCloud.database().collection('health-record-pay-info').add({
		uid: store.userInfo._id,
		orderId: order_no,
		recordId: record._id,
		totalPrice: total_fee,
		status: 0,
	}).then(res => {
		uni.navigateTo({
			url: `/pages/pay/moneypay?index=${index}&orderId=${order_no}&total_fee_value=${total_fee_value}&total_fee=${total_fee}&description=${description}&out_trade_no=${out_trade_no}&type=healthTip`
		});
	}).catch(err => {
		console.log("Record, payForTips error: ", err);
		uni.showToast({
			icon: 'none',
			title: "网络故障，请稍后重试",
			duration: 1000
		});
	});
}

function payForAiTips(index, record, fee) {
	const order_no = generateOrderNumber();
	const out_trade_no = `${order_no}`;
	const total_fee = fee;
	const total_fee_value = Number(fee * 100).toFixed(0);
	const description = 'AI报告解读费用';
	uniCloud.database().collection('health-record-pay-info').add({
		uid: store.userInfo._id,
		orderId: order_no,
		recordId: record._id,
		totalPrice: total_fee,
		status: 0,
	}).then(res => {
		uni.navigateTo({
			url: `/pages/pay/aipay?index=${index}&orderId=${order_no}&total_fee_value=${total_fee_value}&total_fee=${total_fee}&description=${description}&out_trade_no=${out_trade_no}&type=healthTip`
		});
	}).catch(err => {
		console.log("Record, payForAiTips error: ", err);
		uni.showToast({
			icon: 'none',
			title: "网络故障，请稍后重试",
			duration: 1000
		});
	});
}

function tipActionText(record) {
	return record.isExpert ? "已申请（专家建议）" : (record.isPaid ? "已申请（健康解读）" : "解读");
}

function isPdf(filename) {
	const suffix = String(filename?.substr(filename.length - 4)).toLowerCase();
	return suffix == ".pdf";
}

function tipContent(reportTips, replace = '分析结果') {
	let content = '';
	const keyword = '诊断结果';
	const prefix = reportTips.indexOf(keyword);
	if (prefix < 0) {
		content = reportTips;
	} else {
		content = reportTips.replace(keyword, replace);
	}
	return content;
}

function imageAiTips(imageUrl, prompt, onSuccess = undefined, onFail = undefined) {
	uni.request({
		url: 'https://www.aicareme.cn/electronicCase', // 你的API接口地址
		method: 'POST',
		data: {
			prompt: prompt,
			pic_url: imageUrl
		},
		success: (res) => {
			console.log("Record, 图片解读成功: ", res);
			onSuccess && onSuccess(res);
		},
		fail: (err) => {
			console.log("Record, 图片解读失败: ", err);
			onFail && onFail(err);
		}
	});
}

function localImgAiTips(imagePath, cloudPath, prompt, onSuccess = undefined, onFail = undefined) {
	uniCloud.uploadFile({
		filePath: imagePath, //要上传的文件对象
		cloudPath: cloudPath, //保存在云端的文件名
		cloudPathAsRealPath: true,
		success(res) {
			console.log("Record, 上传图片成功: res = ", res);
			imageAiTips(res.fileID, prompt, onSuccess, onFail);
		},
		fail(err) {
			console.log("Record, 上传图片失败: err = ", err);
			onFail && onFail(err);
		}
	});
}

export {
	noticeMap,
	cloudNotify,
	exchangeForTips,
	payForTips,
	payForAiTips,
	tipActionText,
	isPdf,
	tipContent,
	imageAiTips,
	localImgAiTips
}