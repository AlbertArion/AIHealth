<template>
	<view class="pay-content">
		<view class="pay-item-container">
			<view class="pay-item-title">服务名称：</view>
			<view class="pay-item-content">
				<text class="pay-item-text">{{description}}</text>
				<text class="pay-item-value">¥ {{order_fee}}</text>
			</view>
		</view>
		<view v-if="isPurchase" class="pay-item-container">
			<view class="pay-item-title" style="margin-bottom: 6px;">积分余额：
				<text class="pay-item-value"
					style="font-size: 12px; margin-left: 0px; color: darkgray; font-weight: normal;">{{hasDiscount ? (myScore - discountScore) : myScore}}</text>
			</view>
			<view class="pay-item-content" @click="useDiscount">
				<uni-icons v-if="isPaid" :type="`${hasDiscount ? 'circle-filled' : 'circle'}`" size="18" color="#A0A0A0"
					style="margin-left: 20px; margin-top: 3px;" />
				<uni-icons v-else :type="`${hasDiscount ? 'circle-filled' : 'circle'}`" size="18" color="#4C5382"
					style="margin-left: 20px; margin-top: 3px;" />
				<text class="pay-item-text" style="color: darkgray; font-size: 12px; margin-left: 6px;">可用
					{{discountScore}} 积分抵扣</text>
				<text class="pay-item-value"
					:style="`${hasDiscount ? '' : 'color: darkgray;'} font-size: 12px;`">{{hasDiscount ? (' - ' + myDiscount + '元') : '请选择优惠'}}</text>
			</view>
		</view>
		<view class="pay-item-container">
			<view class="pay-item-title">支付单号：</view>
			<text class="pay-item-text" style="color: darkgray;">{{order_no}}</text>
		</view>
		<view v-if="!isPaid" class="pay-result-container">
			<view class="pay-result">共需支付：</view>
			<text class="pay-result-value">¥ {{total_fee}}</text>
		</view>
		<view v-if="isPaid" class="pay-tips-container">
			<text class="pay-result-title">订单状态： 支付成功！</text>
			<text class="pay-result-content"> - 「心脉AI」心脏健康管理服务在2025-03-15开始售卖，订单状态变化会在微信小程序「心脉AI」的消息提醒中通知；</text>
			<text class="pay-result-content"> - 您也可以在「心脉AI」小程序内「健康管理」页中查看。</text>
		</view>
		<view v-else class="pay-tips-container">
			<view class="pay-item-tips-title">
				支付须知：
			</view>
			<view class="pay-item-tips">
				1. 本产品为「心脏健康管理」服务，配套硬件包含在服务之内，不收取额外收费；
			</view>
			<view class="pay-item-tips">
				2. 心脏健康管理服务到期后，可以续费；
			</view>
			<view class="pay-item-tips">
				3. 支付成功后，请在「我的订单」页中查看状态；
			</view>
			<view class="pay-item-tips">
				4. 支付、使用过程中，如遇问题，请前往「我的」->「我的反馈」提交问题，我们会尽快处理；
			</view>
			<view class="pay-item-tips">
				5. 本产品的最终解释权归北京和美健康科技有限责任公司「心脉AI」所有。
			</view>
			<view class="pay-item-tips-title" style="margin-top: 20px;">
				免责声明：
			</view>
			<view class="pay-item-tips">
				1. 配套硬件属于非医疗器械，测量数据、显示报告、结果、风险提示等仅供参考，不作为诊疗依据；
			</view>
			<view class="pay-item-tips">
				2. 对任何使用方未正确使用设备、未查看数据或查看数据后采取的任何行为及造成的结果，厂家与供货方均不承担任何责任。
			</view>
		</view>
		<view class="pay-action">
			<button v-if="isPaid" @click="navigateBack">返回上页</button>
			<!-- #ifdef MP-WEIXIN || H5 || APP -->
			<button v-else @click="onPayClick('wxpay')">{{payActionText}}</button>
			<!-- #endif -->
			<!-- #ifdef MP-ALIPAY || H5 || APP -->
			<button v-if="!isPaid" @click="onPayClick('alipay')">{{payActionText}}</button>
			<!-- #endif -->
			<!-- <button @click="createQRcode('wxpay')">生成独立支付二维码</button>
			<view class="tips">用于把生成的二维码放到自己写的页面中（组件不会弹窗，请从日志中查看二维码base64值）</view> -->
			<button v-if="false" @click="getOrder">查询支付状态</button>
		</view>

		<!--
		<button @click="refund">发起退款</button>
		<view class="tips">发起退款需要admin权限，本示例未对接登录功能</view>
		<button @click="getRefund">查询退款状态</button>
		<button @click="closeOrder">关闭订单</button>
		-->
		<!-- #ifdef H5 -->
		<button v-if="h5Env === 'h5-weixin'" @click="getWeiXinJsCode('snsapi_base')">公众号获取openid示例</button>
		<!-- #endif -->
		<!-- 统一支付组件，注意：vue3下ref不可以等于组件名，因此这里ref="pay" 而不能是 ref="uniPay"
			- :adpid="adpid"可以增加广告位
			- return-url="/pages/pay/productpay?res=success"可以增加查看订单页
		-->
		<uni-pay ref="pay" @success="onSuccess" @create="onCreate" @cancel="onCancel" main-color="#4C5382"
			return-url="/modules/device/pages/myproducts"
			logo="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/xinmai_logo_288.png" />
	</view>
</template>

<script>
	import {
		getMillisNow
	} from '@/common/utils/timestamp';
	import {
		updateUserInfo
	} from '@/common/js/device';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		noticeMap
	} from '@/common/js/record';
	import {
		generateOrderNumber
	} from '@/common/utils/generateUUID';
	import {
		PRODUCT_PRICE_NORMAL,
		PRODUCT_PRICE_AUTOTIP,
		PRODUCT_SLEEP_BELT,
		SERVICE_PRICE_MONTH,
		SERVICE_PRICE_YEAR,
		createProduct
	} from '@/common/js/productorder';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				product: undefined,
				myScore: store.userInfo.score,
				myDiscount: '--',
				discountScore: '--',
				hasDiscount: false,
				price: 0, // 产品单价，单位：元(1 = 1元)
				amount: 1, // 产品数量
				order_fee: 0, // 订单金额（支付金额 + 积分抵扣金额）
				total_fee: 0, // 支付金额，单位: 元(1 = 1元)
				total_fee_value: 0, // 支付金额，单位: 分(100 = 1元)
				description: "购买产品",
				poid: undefined,
				order_no: "", // 业务系统订单号（即你自己业务系统的订单表的订单号）
				money_order_no: "", // 仅用现金支付的订单号
				score_order_no: "", // 支持积分抵扣的订单号
				type: "product", // 支付的商品或服务类型
				state: -1,
				//qr_code: true, // 是否强制使用扫码支付
				openid: "", // 微信公众号需要
				custom: {
					a: "a",
					b: 1
				},
				// adpid: "1000000001", // uni-ad的广告位id
				payActionText: "立即支付",
				isPaid: false,
				backToastTitle: ""
			}
		},
		computed: {
			priceNormal: function() {
				return PRODUCT_PRICE_NORMAL;
			},
			priceAutoTip: function() {
				return PRODUCT_PRICE_AUTOTIP;
			},
			servicePriceMonth: function() {
				return SERVICE_PRICE_MONTH;
			},
			servicePriceYear: function() {
				return SERVICE_PRICE_YEAR;
			},
			isPurchase: function() {
				return this.state == 1;
			},
			h5Env() {
				// #ifdef H5
				let ua = window.navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == 'micromessenger' && (ua.match(/miniprogram/i) ==
						'miniprogram')) {
					// 微信小程序
					return "mp-weixin";
				}
				if (ua.match(/MicroMessenger/i) == 'micromessenger') {
					// 微信公众号
					return "h5-weixin";
				}
				if (ua.match(/alipay/i) == 'alipay' && ua.match(/miniprogram/i) == 'miniprogram') {
					return "mp-alipay";
				}
				if (ua.match(/alipay/i) == 'alipay') {
					return "h5-alipay";
				}
				// 外部 H5
				return "h5";
				// #endif
			}
		},
		onLoad(options = {}) {
			if (!store.hasLogin) {
				uni.showToast({
					title: '未登录',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
					})
				}, 1500);
			}
			console.log("ProductPay, onLoad, options = ", options);
			if (options.description && options.total_fee && options.type) {
				this.poid = options.poid;
				this.money_order_no = generateOrderNumber();
				this.score_order_no = String(Number(this.money_order_no) + 1);
				this.order_no = this.money_order_no;
				this.description = options.description;
				this.price = Number(options.price);
				this.amount = Number(options.amount);
				this.order_fee = Number(options.total_fee);
				this.total_fee = this.order_fee;
				this.total_fee_value = Number(options.total_fee_value);
				this.type = options.type;
				this.state = Number(options.state);
				const maxDiscount = 1000; // 最大可用 1000积分，抵扣 100元
				this.myDiscount = Math.round(Math.min(this.myScore, maxDiscount) * 0.1);
				this.discountScore = this.myDiscount * 10;
			} else {
				uni.showToast({
					title: '参数错误',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
			if (options.code && options.state) {
				// 获取微信公众号的openid
				setTimeout(() => {
					this.getOpenid({
						provider: "wxpay",
						code: options.code
					});
				}, 300);
			}
		},
		onShow() {
			if (this.isPaid) {
				uni.showToast({
					title: this.backToastTitle,
					icon: "none",
					duration: 1000
				});
			}
		},
		methods: {
			/**
			 * 发起支付（唤起收银台，如果只有一种支付方式，则收银台不会弹出来，会直接使用此支付方式）
			 * 在调用此api前，你应该先创建自己的业务系统订单，并获得订单号 order_no，把order_no当参数传给此api，而示例中为了简化跟支付插件无关的代码，这里直接已时间戳生成了order_no
			 */
			open() {
				// 打开支付收银台
				this.$refs.pay.open({
					total_fee: this
						.total_fee_value, // 支付金额，单位分 100 = 1元（注意：因为是前端传的，此参数可能会被伪造，回调时需要再校验下是否和自己业务订单金额一致）
					order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
					out_trade_no: this.order_no, // 插件支付单号
					description: this.description, // 支付描述
					type: this.type, // 支付回调类型
					qr_code: this.qr_code, // 是否强制使用扫码支付
					openid: this.openid, // 微信公众号需要
					custom: this.custom, // 自定义数据（此参数不推荐使用，因为是前端传的，此参数可能会被伪造，建议通过order_no查询自己业务订单表来获取自定义业务数据）
				});
			},
			useDiscount() { // 切换积分抵扣
				if (this.isPaid) {
					console.log("ProductPay, 已经支付完成，积分抵扣不能更改");
					return;
				}
				this.hasDiscount = !this.hasDiscount;
				this.order_no = this.hasDiscount ? this.score_order_no : this.money_order_no;
				this.total_fee = this.order_fee - (this.hasDiscount ? this.myDiscount : 0);
				this.total_fee_value = this.total_fee * 100;
			},
			onPayClick: function(provider) {
				if (uni.subscribed) {
					this.createOrder(provider);
				} else {
					uni.subscribed = true;
					uni.requestSubscribeMessage({
						tmplIds: [noticeMap["orderFreight"].template_id],
						complete: (data) => {
							console.log("ProductPay, subscribe success", data);
							this.createOrder(provider);
						}
					});
				}
			},
			/**
			 * 发起支付（不唤起收银台，手动指定支付方式）
			 * 在调用此api前，你应该先创建自己的业务系统订单，并获得订单号 order_no，把order_no当参数传给此api，而示例中为了简化跟支付插件无关的代码，这里直接已时间戳生成了order_no
			 */
			createOrder(provider) {
				if (this.isPaid) {
					return;
				}
				// 发起支付
				this.$refs.pay.createOrder({
					provider: provider, // 支付供应商
					total_fee: this
						.total_fee_value, // 支付金额，单位分 100 = 1元（注意：因为是前端传的，此参数可能会被伪造，回调时需要再校验下是否和自己业务订单金额一致）
					order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
					out_trade_no: this.order_no, // 插件支付单号
					description: this.description, // 支付描述
					type: this.type, // 支付回调类型
					qr_code: this.qr_code, // 是否强制使用扫码支付
					openid: this.openid, // 微信公众号需要
					custom: this
						.custom, // 自定义数据（此参数不推荐使用，因为是前端传的，此参数可能会被伪造，建议通过order_no查询自己业务订单表来获取自定义业务数据）
				}).then((res) => {
					console.log("ProductPay, createOrder, res = ", res);
				});
			},
			/**
			 * 生成支付独立二维码（只返回支付二维码）
			 * 在调用此api前，你应该先创建自己的业务系统订单，并获得订单号 order_no，把order_no当参数传给此api，而示例中为了简化跟支付插件无关的代码，这里直接已时间戳生成了order_no
			 */
			createQRcode(provider) {
				// 发起支付
				this.$refs.pay.createOrder({
					provider: provider, // 支付供应商
					total_fee: this
						.total_fee_value, // 支付金额，单位分 100 = 1元（注意：因为是前端传的，此参数可能会被伪造，回调时需要再校验下是否和自己业务订单金额一致）
					order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
					out_trade_no: this.order_no, // 插件支付单号
					description: this.description, // 支付描述
					type: this.type, // 支付回调类型
					qr_code: true, // 是否强制使用扫码支付
					cancel_popup: true, // 配合qr_code:true使用，是否只生成支付二维码，没有二维码弹窗
					openid: this.openid, // 微信公众号需要
					custom: this
						.custom, // 自定义数据（此参数不推荐使用，因为是前端传的，此参数可能会被伪造，建议通过order_no查询自己业务订单表来获取自定义业务数据）
				});
			},
			// 查询支付状态
			async getOrder() {
				const res = await this.$refs.pay.getOrder({
					out_trade_no: this.order_no, // 插件支付单号
					await_notify: true
				});
				if (res) {
					const obj = {
						"-1": "已关闭",
						"1": "已支付",
						"0": "未支付",
						"2": "已部分退款",
						"3": "已全额退款"
					};
					this.payActionText = obj[res.status] || this.payActionText;
					uni.showToast({
						title: obj[res.status] || res.errMsg,
						icon: "none"
					}).then(() => {
						if (res.status == 1 || res.status == -1) {
							uni.navigateBack();
						} else if (res.status == 0) {

						}
					});
				}
			},
			// 发起退款
			async refund() {
				let res = await this.$refs.pay.refund({
					out_trade_no: this.order_no, // 插件支付单号
				});
				if (res) {
					uni.showToast({
						title: res.errMsg,
						icon: "none"
					});
				}
			},
			// 查询退款状态
			async getRefund() {
				let res = await this.$refs.pay.getRefund({
					out_trade_no: this.order_no, // 插件支付单号
				});
				if (res) {
					uni.showModal({
						content: res.errMsg,
						showCancel: false
					});
				}
			},
			// 关闭订单
			async closeOrder() {
				let res = await this.$refs.pay.closeOrder({
					out_trade_no: this.order_no, // 插件支付单号
				});
				if (res) {
					uni.showModal({
						content: res.errMsg,
						showCancel: false
					});
				}
			},
			// 获取公众号code
			async getWeiXinJsCode(scope = "snsapi_base") {
				let res = await this.$refs.pay.getProviderAppId({
					provider: "wxpay",
					provider_pay_type: "jsapi"
				});
				if (res.appid) {
					let appid = res.appid;
					let redirect_uri = window.location.href.split("?")[0];
					let url =
						`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`;
					window.location.href = url;
				}

			},
			// 获取公众号openid
			async getOpenid(data) {
				let res = await this.$refs.pay.getOpenid(data);
				if (res) {
					this.openid = res.openid;
					uni.showToast({
						title: "已获取到openid，可以开始支付",
						icon: "none"
					});
				}
			},
			// 监听事件 - 支付订单创建成功（此时用户还未支付）
			onCreate(res) {
				console.log('ProductPay, pay onCreate: ', res);
				// 如果只是想生成支付二维码，不需要组件自带的弹窗，则在这里可以获取到支付二维码 qr_code_image
			},
			updatePayInfo: function(poid) {
				db.collection('health-record-pay-info').add({
					uid: store.userInfo._id,
					orderId: this.order_no,
					totalPrice: this.total_fee,
					poid: poid,
					status: 1
				}).then(res => {
					console.log("Device, 创建支付信息成功，res: ", res);
				});
			},
			updateMyProducts: function(poid) {
				const data = {
					products: store.userInfo.products
				};
				if (this.hasDiscount) {
					store.userInfo.score -= this.discountScore;
					data.score = store.userInfo.score;
				}
				updateUserInfo(store.userInfo._id, data, (res) => {
					uni.$emit('productUpdate', this.product);
				});
			},
			updateScoreRecord: function(poid) {
				db.collection('uni-id-scores').add({
					user_id: store.userInfo._id,
					balance: store.userInfo.score,
					score: this.discountScore,
					type: 2,
					comment: `积分抵扣智能产品购买POID:' ${this.poid}`,
				});
			},
			// 监听事件 - 支付成功
			onSuccess(res) {
				console.log('ProductPay, pay onSuccess: ', res);
				if (res) {
					const obj = {
						"-1": "已关闭",
						"1": "已支付",
						"0": "未支付",
						"2": "已部分退款",
						"3": "已全额退款"
					};
					if (res.status == 1 || res.status == -1) {
						this.isPaid = true;
					}
					this.backToastTitle = obj[res.status] || res.errMsg;
					this.payActionText = obj[res.status] || this.payActionText;

					const product = createProduct();
					product.fee = this.isPurchase ? (this.price * this.amount) : this.order_fee;
					product.price = this.price;
					product.amount = this.amount;
					product.state = this.state;

					// 新增数据库产品订单
					const orderData = {
						...product,
						uid: store.userInfo._id
					};
					if (store.userInfo.addresses?.length > 0) {
						orderData.address = store.userInfo.addresses[0];
					}
					if (this.hasDiscount && this.discountScore != '--' && this.discountScore > 0) {
						orderData.scoreCost = this.discountScore;
					}
					if (this.isPurchase) {
						const millisNow = getMillisNow();
						orderData.timestamp = String(millisNow);
					}
					if (this.poid?.length > 0) {
						orderData.finalOrderId = this.order_no;
						db.collection('health-product-order').where({
							_id: this.poid
						}).update(orderData).then((res) => {
							console.log("ProductPay, 产品下单成功: ", res);
							product.poid = res.result.id;
							if (store.hasProducts()) {
								const products = store.userInfo.products;
								for (let i = 0; i < products.length; i++) {
									const item = products[i];
									if (item.poid == product.poid) {
										item.type = product.type;
										item.fee = product.fee;
										item.price = product.price;
										item.amount = product.amount;
										item.state = product.state;
										this.product = item;
										break;
									}
								}
							} else {
								store.userInfo.products = [];
								store.userInfo.products.push(product);
							}
							this.updatePayInfo(this.poid);
							this.updateMyProducts(this.poid);
							this.updateScoreRecord(this.poid);
						}).catch((err) => {
							console.log("ProductPay, 产品下单失败: ", err);
						});
					} else {
						orderData.orderId = this.order_no;
						db.collection('health-product-order').add(orderData).then((res) => {
							console.log("ProductPay, 产品下单成功: ", res);
							product.poid = res.result.id;
							if (!store.userInfo.products) {
								store.userInfo.products = [];
							}
							store.userInfo.products.push(product);
							store.orderCount += 1;
							this.updatePayInfo(product.poid);
							this.updateMyProducts(product.poid);
							this.updateScoreRecord(product.poid);
						}).catch((err) => {
							console.log("ProductPay, 产品下单失败: ", err);
						});
					}
				}
			},
			onCancel(res) {
				console.log('ProductPay, pay onCancel: ', res);
				uni.showToast({
					title: "支付取消",
					icon: "none"
				});
			},
			navigateBack: function() {
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pay-content {
		display: flex;
		flex-direction: column;
		overflow-y: scroll;
		padding-bottom: 60px;
	}

	input {
		border: 1px solid #f3f3f3;
		padding: 10rpx;
	}

	.pay-item-container {
		display: flex;
		flex-direction: column;
		padding: 10px 10px;
		margin: 10px 20px;
		margin-top: 0px;
		border: 1px #4C5382 solid;
		border-radius: 10px;
	}

	.pay-item-title {
		flex: 1;
		font-size: 14px;
		font-weight: bold;
		color: #4C5382;
		margin-bottom: 10px;
		margin-top: 3px;
	}

	.pay-item-content {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.pay-item-text {
		flex: 1;
		font-size: 14px;
		color: #4C5382;
		margin-left: 10px;
	}

	.pay-item-value {
		font-size: 14px;
		font-weight: bold;
		color: indianred;
		margin-left: 10px;
	}

	.pay-result-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px 10px;
		margin: 10px 20px;
		margin-top: 0px;
		border-radius: 10px;
	}

	.pay-result {
		font-size: 18px;
		font-weight: bold;
		color: #4C5382;
		flex: 1;
	}

	.pay-result-value {
		font-size: 18px;
		font-weight: bold;
		color: indianred;
		margin-left: 10px;
	}

	.tips {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #565656;
	}

	.pay-tips-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 10px 10px;
		margin: 10px 20px;
		margin-top: 0px;
		border-radius: 10px;
	}

	.pay-result-title {
		font-size: 16px;
		color: #4C5382;
		font-weight: bold;
		margin: 10px 0px 10px;
	}

	.pay-result-content {
		font-size: 12px;
		color: lightgray;
		margin: 0px 0px 0px 10px;
		line-height: 20px;
	}

	.pay-item-tips-title {
		font-size: 14px;
		color: lightgray;
		font-weight: bold;
		margin-bottom: 3px;
	}

	.pay-item-tips {
		font-size: 12px;
		color: lightgray;
		margin-top: 3px;
	}

	.pay-action {
		position: fixed;
		bottom: 0px;
		width: 100%;
		padding-top: 10px;
		padding-bottom: 20px;
		background-color: white;
	}

	.pay-action button {
		background-color: #4C5382;
		color: white;
		font-size: 14px;
		display: flex;
		height: 40px;
		width: 90%;
		margin-left: 5%;
		margin-top: 10px;
		align-items: center;
		justify-content: center;
	}

	.pay-action button:active {
		opacity: 0.8;
	}
</style>