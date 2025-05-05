import {
	monthInMillis,
	yearInMillis
} from "../utils/timestamp";
import {
	updateUserInfo
} from "./device";
import {
	store
} from "@/uni_modules/uni-id-pages/common/store";

const PRODUCT_SLEEP_BELT = '心肺+睡眠监测仪';
const PRODUCT_SLEEP_BELT_NICK = '智能监测仪';
const PRODUCT_TYPE_SLEEP_BELT = 'sleepBelt';
const SERVICE_TYPE_CARDIO_CARE = 'cardioCare';

// const PRODUCT_PRICE_NORMAL = 969;
// const PRODUCT_PRICE_AUTOTIP = 1139;
// const PRODUCT_PRICE_EXPERT_MONTH = 1258;
// const PRODUCT_PRICE_EXPERT = 3868;

const PRODUCT_PRICE_NORMAL = 3888;
const PRODUCT_PRICE_AUTOTIP = 9800;
const PRODUCT_PRICE_EXPERT_MONTH = 4188;
const PRODUCT_PRICE_EXPERT = 28800;

const SERVICE_PRICE_MONTH = 34;
const SERVICE_PRICE_FIRST_YEAR = 200;
const SERVICE_PRICE_YEAR = 249;
const EXPERT_PRICE_MONTH = 300;
const EXPERT_PRICE_YEAR = 2400;

// 产品订单价格
function getProductPrice(serviceType) {
	const prices = [
		PRODUCT_PRICE_NORMAL,
		PRODUCT_PRICE_AUTOTIP,
		PRODUCT_PRICE_EXPERT_MONTH,
		PRODUCT_PRICE_EXPERT
	];
	return prices[serviceType + 1];
}

// 产品订单服务类型
function getServiceType(price) {
	let serviceType = -1;
	if (price == PRODUCT_PRICE_EXPERT) {
		serviceType = 2;
	} else if (price == PRODUCT_PRICE_EXPERT_MONTH) {
		serviceType = 1;
	} else if (price == PRODUCT_PRICE_AUTOTIP) {
		serviceType = 0;
	}
	return serviceType;
}

// 服务订单套餐
function getServiceVersion(price) {
	return price == PRODUCT_PRICE_EXPERT ? '旗舰版' : price == PRODUCT_PRICE_AUTOTIP ? '专业版' : '标准版';
}

// 产品订单服务时长
function getServiceDuration(price) {
	return (price == PRODUCT_PRICE_NORMAL || price == PRODUCT_PRICE_EXPERT_MONTH) ? '1月' : '1年';
}

// 产品订单服务时长(ms)
function getServiceMillis(price) {
	return (price == PRODUCT_PRICE_NORMAL || price == PRODUCT_PRICE_EXPERT_MONTH) ? monthInMillis() : yearInMillis();
}

// 产品订单公共方法
function updateProductOrder(query, data, onSuccess = undefined, onFail = undefined) {
	const db = uniCloud.database();
	db.collection('health-product-order').where(query).update(data).then((res) => {
		console.log("ProductOrder, 更新产品订单信息成功");
		onSuccess && onSuccess(res);
	}).catch((err) => {
		console.log("ProductOrder, 更新产品订单信息失败: ", err);
		onFail && onFail(err);
	}).finally(() => {});
}

function updateOrderAddress(poid, address) {
	// 更新产品订单地址信息
	if (poid?.length > 0) {
		updateProductOrder({
			_id: poid
		}, {
			address: address
		});
	}
}

function updateUserAddress(poid) {
	uni.chooseAddress({
		success: (res) => {
			if (res?.errMsg == "chooseAddress:ok") {
				const address = {
					cityname: res.cityName,
					countyName: res.countyName,
					detailInfo: res.detailInfo,
					nationalCode: res.nationalCode,
					postalCode: res.postalCode,
					provinceName: res.provinceName,
					telNumber: res.telNumber,
					username: res.userName
				};
				store.userInfo.addresses = [];
				store.userInfo.addresses.push(address);
				store.refreshUser();
				if (store.userInfo.nickname?.length > 0) {
					const data = {
						addresses: store.userInfo.addresses
					};
					updateUserInfo(store.userInfo._id, data);
					updateOrderAddress(poid, address);
				} else {
					const that = this;
					uni.showModal({
						content: `您还没有设置昵称，是否使用收件人「${address.username}」作为昵称？`,
						confirmColor: '#4C5382',
						confirmText: "好的",
						showCancel: true,
						cancelText: "不用",
						cancelColor: '#808080',
						success(res) {
							const data = {
								addresses: store.userInfo.addresses
							};
							if (res.confirm) {
								store.userInfo.username = address.username;
								data.username = address.username;
							}
							updateUserInfo(store.userInfo._id, data);
							updateOrderAddress(poid, address);
						}
					});
				}
			}
		},
		fail: (err) => {
			console.log('chooseAddress fail', err);
		}
	});
}

/**
 *  Type: 服务类型，想要切换为产品类型修改默认值为 PRODUCT_TYPE_SLEEP_BELT
 */
function createProduct(type = SERVICE_TYPE_CARDIO_CARE) {
	return {
		poid: undefined,
		type: type,
		name: PRODUCT_SLEEP_BELT,
		price: PRODUCT_PRICE_NORMAL,
		amount: 1,
		state: -1,
		serviceStart: undefined,
		serviceEnd: undefined
	};
}

function toCustomService() {
	/**
	 * 气泡消息图片
	 * sendMessageImg ? : string;
	 * 
	 * 气泡消息小程序路径
	 * sendMessagePath ? : string;
	 * 
	 * 气泡消息标题
	 * sendMessageTitle ? : string;
	 * 
	 * 是否发送小程序气泡消息
	 * showMessageCard ? : boolean;
	 */
	uni.openCustomerServiceChat({
		corpId: 'ww9aef2b8873e6cc92',
		extInfo: {
			url: 'https://work.weixin.qq.com/kfid/kfcc37194672d76ede7'
		},
		success: (res) => {
			console.log("ProductOrder, 打开企业微信客服成功: ", res);
		},
		fail: (err) => {
			console.log("ProductOrder, 打开企业微信客服失败: ", err);
		}
	});
}

export {
	PRODUCT_SLEEP_BELT,
	PRODUCT_SLEEP_BELT_NICK,
	PRODUCT_TYPE_SLEEP_BELT,
	SERVICE_TYPE_CARDIO_CARE,
	PRODUCT_PRICE_NORMAL,
	PRODUCT_PRICE_AUTOTIP,
	PRODUCT_PRICE_EXPERT,
	PRODUCT_PRICE_EXPERT_MONTH,
	getProductPrice,
	getServiceType,
	getServiceMillis,
	getServiceVersion,
	getServiceDuration,
	SERVICE_PRICE_MONTH,
	SERVICE_PRICE_FIRST_YEAR,
	SERVICE_PRICE_YEAR,
	EXPERT_PRICE_MONTH,
	EXPERT_PRICE_YEAR,
	updateProductOrder,
	updateUserAddress,
	createProduct,
	toCustomService
}