import {
	compareScore
} from '@/common/utils/tool';
import pagesJson from '@/pages.json';
import config from '@/uni_modules/uni-id-pages/config.js';

const uniIdCo = uniCloud.importObject("uni-id-co");
const db = uniCloud.database();
const usersTable = db.collection('uni-id-users');
const hostUserInfo = uni.getStorageSync('uni-id-pages-userInfo') || {};
const storeData = {
	userConfig: {
		// 用户配置
		deviceID: uni.getDeviceInfo()?.deviceId,
		fontStyle: uni.getStorageSync('fontStyle') || 'normal', // 'normal', 'large'
		productIndex: 0, // 产品索引
		// 健康相关
		reportIndex: 0, // 健康报告索引
		reportTemp: undefined, // 临时健康报告
		deviceReports: uni.getStorageSync('healthReports'), // 设备健康报告
		dataSource: 0, // 数据来源，0: 手机数据，1: 设备同步
		monitorUpdated: false, // 在智能问答页面触发替换问题的标识
		dailyTips: uni.getStorageSync('dailyTips'),
		dailyReport: uni.getStorageSync('dailyReport'),
		monitorTemp: undefined, // 临时健康数据
		beating: false, // 心率实时监测
		monitor: [ // 健康数据
			{
				name: "运动",
				value: 0,
				text: "",
				data: 0,
				color: '#0088BB',
				date: '', // 缓存日期
			},
			{
				name: "饮食",
				value: 0,
				text: "",
				data: 0,
				color: '#5EC29C',
				date: '', // 缓存日期
			},
			{
				name: "心情",
				value: 0,
				text: "",
				data: 0,
				color: '#F1C96A',
				date: '', // 缓存日期
			},
			{
				name: "睡眠",
				value: 0,
				text: "",
				data: 0,
				color: '#7C4B75',
				date: '', // 缓存日期
				quality: {} // 睡眠质量
			},
			{
				name: "心率",
				value: 0,
				text: "",
				data: 0,
				color: '#AA3311',
				date: '', // 缓存日期
				risk: {
					trendRisk: undefined, // 心率趋势图
					distRisk: undefined, // 心率分布图
					scatterRisk: undefined, // 心率散点图
					advice: '' // 健康风险提醒
				},
			},
			{
				name: "最大摄氧量",
				value: 0,
				text: "",
				data: 0,
				color: '#99CCFF',
				date: '', // 缓存日期
			}
		],
		// 医院随访相关
		realname: '',
		doctor: '',
		// 通话语音播放相关
		calling: false,
		inputValue: '',
		captionText: '',
		speakingLines: [],
		speakingIndex: -1, // 通话语音播放索引
		speakingTtsIndex: -1 // 通话语音合成索引
	},
	// 报告病历相关
	currentRecordIndex: -1,
	healthRecords: [],
	healthTips: [],
	// 用户信息
	userInfo: hostUserInfo,
	hasLogin: Object.keys(hostUserInfo).length != 0,
	lastPlayingMessage: {},
	setNicknameIng: false,
	isLoginToast: true,
	sessionKey: uni.getStorageSync('sessionKey'),
	currentProductState: -1,
	orderCount: 1680,
	reLaunchUrl: undefined,

	/**
	 *  是否已经购买产品或服务
	 */
	hasProducts() {
		return this.userInfo.products?.length > 0;
	},

	/**
	 * 获取设备健康报告
	 */
	getDeviceReports() {
		const mapping = this.userConfig.deviceReports;
		if (mapping && this.hasProducts()) {
			const current = this.userConfig.productIndex;
			const deviceName = this.userInfo.products[current].device?.name;
			if (deviceName?.length > 0 && mapping[deviceName]) {
				return mapping[deviceName];
			}
		}
		return undefined;
	},
	/**
	 * 为设备健康报告赋值，并持久化
	 * @param {Object} reports: 如果不传则表示持久化当前值
	 */
	setDeviceReports(reports = undefined) {
		if (!this.userConfig.deviceReports) {
			this.userConfig.deviceReports = {};
		}
		const mapping = this.userConfig.deviceReports;
		if (reports) {
			const current = this.userConfig.productIndex;
			const deviceName = this.userInfo.products[current].device?.name;
			if (deviceName?.length > 0) {
				mapping[deviceName] = reports;
			}
		}
		uni.setStorage({
			key: 'healthReports',
			data: mapping
		});
	},
	hasInviteCode() {
		return this.userInfo?.inviteCode?.length > 0;
	},
	setRecordIndex(index) {
		this.currentRecordIndex = index;
	},
	resetRecordIndex() {
		this.currentRecordIndex = -1;
	},
	removeHealthRecord() {
		if (this.currentRecordIndex < this.healthRecords.length) {
			this.healthRecords.splice(this.currentRecordIndex, 1);
		}
	},
	getHealthRecord(index = this.currentRecordIndex) {
		let record = {};
		if (index < this.healthRecords.length) {
			record = this.healthRecords[index];
		}
		return record;
	},
	isHealthRecordsEmpty() {
		return this.healthRecords.length == 0;
	},
	clearHealthRecord() {
		this.healthRecords = [];
	},
	pushHealthRecord(record) {
		this.healthRecords.push(record);
	},
	unshiftHealthRecord(record) {
		this.healthRecords.unshift(record);
	},
	updateHealthRecord(record) {
		this.healthRecords[this.currentRecordIndex] = record;
	},
	isDeviceBound() {
		let sensorID = undefined;
		const products = this.userInfo.products;
		if (products?.length > 0) {
			sensorID = products[this.userConfig.productIndex].device?.sensorID;
		}
		return sensorID?.length > 0;
	},
	fetchProducts(onSuccess, onFail = undefined) {
		usersTable.where("'_id' == $cloudEnv_uid").field('score, products').get().then(res => {
			const data = res.result.data[0];
			if (!data) {
				return;
			}
			const localScore = this.userInfo.score;
			compareScore(localScore, data.score);

			this.userInfo.score = data.score;
			this.userInfo.products = data.products;

			this.refreshUser();
			onSuccess && onSuccess(res);

		}).catch((err) => {
			console.log("Store, 获取用户产品信息失败: ", err);
			onFail && onFail(err);
		});
	},
	// 保存字体配置
	refreshFont() {
		uni.setStorageSync('fontStyle', this.userConfig.fontStyle);
	},
	// 保存UserInfo配置
	refreshUser() {
		uni.setStorageSync('uni-id-pages-userInfo', this.userInfo);
	},
	// data不为空，表示传递要更新的值(注意不是覆盖是合并),什么也不传时，直接查库获取更新
	async updateUserInfo(data = false) {
		if (data) {
			console.log("Store, 更新用户信息: ", data);
			usersTable.where('_id==$env.uid').update(data).then(e => {
				if (e.result.updated) {
					uni.showToast({
						title: "更新成功",
						icon: 'none',
						duration: 2000
					});
					this.setUserInfo(data)
				} else {
					uni.showToast({
						title: "没有改变",
						icon: 'none',
						duration: 2000
					});
				}
			})
		} else {
			const uniIdCo = uniCloud.importObject("uni-id-co", {
				customUI: true
			});
			try {
				const res = await usersTable.where("'_id' == $cloudEnv_uid").field(
					'mobile, nickname, username, email, gender, avatar_file, score, products, addresses, age'
				).get();
				console.log("Store, 获取用户信息: ", res.result);
				const realNameRes = await uniIdCo.getRealNameInfo();
				this.setUserInfo({
					...res.result.data[0],
					realNameAuth: realNameRes
				})
			} catch (e) {
				this.setUserInfo({}, {
					cover: true
				})
				console.error(e.message, e.errCode);
			}
		}
	},
	async setUserInfo(data, {
		cover
	} = {
		cover: false
	}) {
		const userInfo = cover ? data : Object.assign(this.userInfo, data);
		this.userInfo = Object.assign({}, userInfo);
		this.hasLogin = Object.keys(this.userInfo).length != 0;
		this.refreshUser();
		return data;
	},
	async logout() {
		// 已经过期就不需要调用服务端的注销接口;即使调用注销接口失败,不能阻塞客户端.
		if (uniCloud.getCurrentUserInfo().tokenExpired > Date.now()) {
			try {
				await uniIdCo.logout();
			} catch (e) {
				console.error(e);
			}
		}
		uni.removeStorageSync('uni_id_token');
		uni.setStorageSync('uni_id_token_expired', 0);
		uni.redirectTo({
			url: `/${pagesJson.uniIdRouter && pagesJson.uniIdRouter.loginPage ? pagesJson.uniIdRouter.loginPage: 'uni_modules/uni-id-pages/pages/login/login-withoutpwd'}`,
		});
		uni.$emit('logoutSuccess');
		this.setUserInfo({}, {
			cover: true
		})
	},
	loginBack(e = {}) {
		const uniIdRedirectUrl = e.uniIdRedirectUrl;
		let delta = 0; //判断需要返回几层
		let pages = getCurrentPages();
		pages.forEach((page, index) => {
			if (pages[pages.length - index - 1].route.split('/')[3] == 'login') {
				delta++
			}
		});
		if (uniIdRedirectUrl) {
			console.log('Store, loginRedirect and emit: ' + uniIdRedirectUrl);
			uni.$emit('loginSuccess');
			return uni.redirectTo({
				url: uniIdRedirectUrl,
				fail: (err1) => {
					console.log("Store, loginBack redirectTo err: ", err1);
					uni.switchTab({
						url: uniIdRedirectUrl,
						fail: (err2) => {
							console.log("Store, loginBack switchTab err: ", err2);
						}
					});
				}
			});
		}
		// #ifdef H5
		if (e.loginType == 'weixin') {
			return window.history.go(-3)
		}
		// #endif

		if (delta) {
			const page = this.reLaunchUrl ? {
				path: this.reLaunchUrl
			} : pagesJson.pages[0];
			this.reLaunchUrl = undefined;
			return uni.reLaunch({
				url: `/${page.path}`
			});
		} else {
			uni.$emit('loginSuccess');
			if (getCurrentPages().length > 1) {
				uni.navigateBack({
					delta
				});
			}
		}
	},
	loginSuccess(e = {}) {
		console.log('Store, loginSuccess: ', e);
		const {
			showToast = this.isLoginToast && true,
				toastText = '登录成功',
				autoBack = true,
				uniIdRedirectUrl = '',
				passwordConfirmed,
				sessionKey
		} = e;
		// 初始化sessionKey
		uni.setStorageSync('sessionKey', sessionKey);
		this.sessionKey = sessionKey;
		if (showToast) {
			uni.showToast({
				title: toastText,
				icon: 'none',
				duration: 1000
			});
		} else {
			this.isLoginToast = true;
		}
		this.updateUserInfo().then(result => {
			if (autoBack) {
				this.loginBack({
					uniIdRedirectUrl
				});
			} else {
				console.log("Store, loginSuccess, emit");
				uni.$emit('loginSuccess');
			}
		});
		if (config.setPasswordAfterLogin && !passwordConfirmed) {
			return uni.redirectTo({
				url: uniIdRedirectUrl ?
					`/uni_modules/uni-id-pages/pages/userinfo/set-pwd/set-pwd?uniIdRedirectUrl=${uniIdRedirectUrl}&loginType=${e.loginType}` :
					`/uni_modules/uni-id-pages/pages/userinfo/set-pwd/set-pwd?loginType=${e.loginType}`,
				fail: (err) => {
					console.log(err)
				}
			})
		}
	},
	username() {
		return this.hasAddress() ? this.userInfo.addresses[0].username : this.userInfo.nickname;
	},
	hasAddress() {
		return store.userInfo.addresses?.length > 0
	},
	addressText() {
		const address = this.userInfo.addresses[0];
		return `${address.provinceName}${address.cityname}${address.countyName}${address.detailInfo}`;
	},
}


// 定义 VUE2 的 Store 对象
// #ifdef VUE2
import Vue from 'vue'
// 通过Vue.observable创建一个可响应的对象
export const store = Vue.observable(storeData)
// #endif


// 定义 VUE3 的 Store 对象
// #ifdef VUE3
import {
	reactive
} from 'vue'
// 通过Vue.observable创建一个可响应的对象
export const store = reactive(storeData)
// #endif