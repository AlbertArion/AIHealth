<template>
	<view class="pay-content">
		<view v-if="false" class="pay-expert-container">
			<view class="expert-avatar-container">
				<image class="expert-avatar" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/popup_ceo_cover.png">
				</image>
			</view>
			<view class="expert-info-container">
				<view class="expert-info-row">
					<text class="expert-name">钟幼民：</text>
					<text class="expert-position">北京和睦家医院心血管专家、北大医学博士</text>
				</view>
				<view class="expert-info-row">
					<text class="expert-field">心血管外科、心血管内科、心脏康复、运动健康</text>
				</view>
			</view>
			<view class="expert-price-container">
				<text class="expert-price">￥199</text>
			</view>
		</view>
		<view v-else class="pay-item-container">
			<view class="pay-item-title">服务名称：</view>
			<view class="pay-item-content">
				<text class="pay-item-text">{{description}}</text>
				<text class="pay-item-value">¥ {{total_fee}}</text>
			</view>
		</view>
		<view class="pay-item-container">
			<view class="pay-item-title">支付单号：</view>
			<text class="pay-item-text" style="color: darkgray;">{{out_trade_no}}</text>
		</view>
		<view class="pay-result-container">
			<view class="pay-result">{{ isPaid ? '已支付' : '共需支付：' }}</view>
			<text class="pay-result-value">¥ {{total_fee}}</text>
		</view>
		<view v-if="isPaid" class="pay-tips-container">
			<text class="pay-item-tips" style="margin-bottom: 10px;"> - 健康建议将于12小时以内完成后，在微信小程序「心脉AI」的消息提醒中通知您；</text>
			<text class="pay-item-tips"> - 您也可以在「心脉AI」小程序内「我的」-「我的健康建议」中查看。</text>
		</view>
		<view v-else class="pay-tips-container">
			<view class="pay-item-tips-title">
				支付须知：
			</view>
			<view class="pay-item-tips">
				1. 本产品属于付费服务，会分析您上传的健康资料并生成建议，定价{{total_fee}}元；
			</view>
			<view class="pay-item-tips">
				2. 支付成功后，请前往「我的」->「我的健康建议」查看；
			</view>
			<view class="pay-item-tips">
				3. 支付、使用过程中，如遇问题，请前往「我的」->「我的反馈」提交问题，我们会尽快处理；
			</view>
			<view class="pay-item-tips">
				4. 本产品属于内容服务，一经购买，概不退款，敬请理解；
			</view>
			<view class="pay-item-tips">
				5. 本产品的最终解释权归和美健康，心脉AI所有。
			</view>
			<!-- <view class="pay-item-tips">
				x. 优惠试用期间, 其他所有功能均可免费使用；
			</view>
			<view class="pay-item-tips">
				x. 试用期结束后，智能问答9.9元/月；健康建议199元/次；188元/月VIP会员，所有功能免费。
			</view> -->
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
			- return-url="/pages/pay/moneypay?res=success"可以增加查看订单页
		-->
		<uni-pay ref="pay" @success="onSuccess" @create="onCreate" @cancel="onCancel" main-color="#4C5382"
			logo="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/xinmai_logo_288.png" />
	</view>
</template>

<script>
	import {
		noticeMap
	} from '@/common/js/record';
	import {
		getMillisNow
	} from '@/common/utils/timestamp';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		data() {
			return {
				record: {},
				total_fee: 0, // 支付金额，单位: 元(1 = 1元)
				total_fee_value: 0, // 支付金额，单位: 分(100 = 1元)
				description: "生成健康建议",
				order_no: "", // 业务系统订单号（即你自己业务系统的订单表的订单号）
				out_trade_no: "", // 插件支付单号
				type: "goods", // 支付回调类型 如 recharge 代表余额充值 goods 代表商品订单（可自定义，任意英文单词都可以，只要你在 uni-pay-co/notify/目录下创建对应的 xxx.js文件进行编写对应的回调逻辑即可）
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
		props: {
			index: {
				type: Number,
				default: -1
			},
		},
		computed: {
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
			console.log("MoneyPay, onLoad, options = ", options);
			this.record = store.getHealthRecord(Number(options.index));
			if (options.orderId && options.description && options.out_trade_no && options.total_fee && options.type) {
				this.order_no = options.orderId;
				this.description = options.description;
				this.out_trade_no = options.out_trade_no;
				this.total_fee = Number(options.total_fee);
				this.total_fee_value = Number(options.total_fee_value);
				this.type = options.type;
			} else {
				uni.showToast({
					title: '参数错误',
					icon: 'none'
				});
				setTimeout(() => {
					this.navigateBack();
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
					out_trade_no: this.out_trade_no, // 插件支付单号
					description: this.description, // 支付描述
					type: this.type, // 支付回调类型
					qr_code: this.qr_code, // 是否强制使用扫码支付
					openid: this.openid, // 微信公众号需要
					custom: this
						.custom, // 自定义数据（此参数不推荐使用，因为是前端传的，此参数可能会被伪造，建议通过order_no查询自己业务订单表来获取自定义业务数据）
				});
			},
			onPayClick: function(provider) {
				if (uni.subscribed) {
					this.createOrder(provider);
				} else {
					uni.subscribed = true;
					uni.requestSubscribeMessage({
						tmplIds: [noticeMap["recordTips"].template_id],
						complete: (data) => {
							console.log("MoneyPay, subscribe success", data);
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
					out_trade_no: this.out_trade_no, // 插件支付单号
					description: this.description, // 支付描述
					type: this.type, // 支付回调类型
					qr_code: this.qr_code, // 是否强制使用扫码支付
					openid: this.openid, // 微信公众号需要
					custom: this
						.custom, // 自定义数据（此参数不推荐使用，因为是前端传的，此参数可能会被伪造，建议通过order_no查询自己业务订单表来获取自定义业务数据）
				}).then((res) => {
					console.log("MoneyPay, createOrder, res = ", res);
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
					out_trade_no: this.out_trade_no, // 插件支付单号
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
					out_trade_no: this.out_trade_no, // 插件支付单号
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
							this.navigateBack();
						} else if (res.status == 0) {

						}
					});
				}
			},
			// 发起退款
			async refund() {
				let res = await this.$refs.pay.refund({
					out_trade_no: this.out_trade_no, // 插件支付单号
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
					out_trade_no: this.out_trade_no, // 插件支付单号
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
					out_trade_no: this.out_trade_no, // 插件支付单号
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
				console.log('MoneyPay, pay onCreate: ', res);
				// 如果只是想生成支付二维码，不需要组件自带的弹窗，则在这里可以获取到支付二维码 qr_code_image
			},
			sendSms: function() {
				uniCloud.callFunction({
					name: 'tipsms',
					data: {
						data: {
							nickname: store.userInfo.nickname,
							rid: this.record?._id,
						}
					}
				}).then((res) => {
					console.log("MoneyPay, sendSms success");
				});
			},
			updateOrder: function() {
				if (this.order_no?.length > 0) {
					uniCloud.database().collection('health-record-pay-info').where({
						orderId: this.order_no
					}).update({
						status: 1
					});
				}
			},
			// 监听事件 - 支付成功
			onSuccess(res) {
				console.log('MoneyPay, pay onSuccess: ', res);
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
						this.record.isPaid = true;
						this.record.paymentTime = getMillisNow().toString();
					}
					this.backToastTitle = obj[res.status] || res.errMsg;
					this.payActionText = obj[res.status] || this.payActionText;
					this.record.isExpert = this.total_fee == 199;
					uniCloud.database().collection('health-records').where({
							_id: this.record._id
						})
						.update({
							isPaid: true,
							isExpert: this.record.isExpert,
							paymentTime: this.record.paymentTime
						}).then((res) => {
							console.log("MoneyPay, 报告解读支付成功");
							this.sendSms();
							this.updateOrder();
							uni.$emit('moneyPaid', this.index);
						}).catch((err) => {
							console.log("MoneyPay, 报告解读支付失败: ", err);
						}).finally(() => {});
				}
				// if (res.user_order_success) {
				// 	// 代表用户已付款，且你自己写的回调成功并正确执行了
				// this.navgateBack();
				// } else {
				// 	// 代表用户已付款，但你自己写的回调执行成功（通常是因为你的回调代码有问题）

				// }
			},
			onCancel(res) {
				console.log('MoneyPay, pay onCancel: ', res);
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

	.pay-expert-container {
		display: flex;
		flex-direction: row;
		padding: 10px 10px;
		margin: 10px 20px;
		margin-top: 0px;
		border: 1px #4C5382 solid;
		border-radius: 10px;
	}

	.expert-avatar-container {
		margin-right: 10px;
	}

	.expert-avatar {
		width: 45px;
		border-radius: 5px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.expert-info-container {
		display: flex;
		flex-direction: column;
	}

	.expert-info-row {
		justify-content: center;
		align-content: center;
	}

	.expert-name {
		font-size: 12px;
		font-weight: bold;
		color: #4C5382;
		margin-right: 5px;
	}

	.expert-position {
		font-size: 11px;
		color: #808080;
		margin-right: 5px;
	}

	.expert-experience {
		font-size: 11px;
		color: #808080;
		margin-right: 5px;
	}

	.expert-field {
		font-size: 11px;
		color: #808080;
		margin-right: 5px;
	}

	.expert-price-container {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.expert-price {
		font-size: 14px;
		color: indianred;
		font-weight: bold;
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
		font-size: 14px;
		font-weight: bold;
		color: #4C5382;
		flex: 1;
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
		font-size: 14px;
		color: lightgray;
		font-weight: bold;
		margin: 10px 0px 10px;
	}

	.pay-result-content {
		font-size: 12px;
		color: lightgray;
		line-height: 24px;
		margin: 0px 0px 5px 10px;
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