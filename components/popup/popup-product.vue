<template>
	<view class="popup-product" :style="popupStyle">
		<view class="device-product-config">
			<view class="device-product-info">
				<uni-icons class="action-icon" type="circle-filled" size="16" color="#4C5382" />
				<text class="device-product-text" style="flex: 1;">心肺+睡眠智能监测仪 ES 6</text>
				<text class="device-product-text" style="font-size: 13px; color: #4C5382;">{{productDesc}}</text>
			</view>
			<view class="device-service-type">
				<text class="device-tip-text" style="font-size: 12px;">可选服务：</text>
				<view class="flex-column" style="flex: 1;">
					<view class="device-row-container" style="flex: 1;" @click="serviceChanged(0)">
						<text class="device-tip-text" style="flex: 1; font-size: 12px;">智能健康管理 1年</text>
						<uni-icons style="margin: 0px 10px;" size="16"
							:type="`${serviceAI ? 'checkbox-filled' : 'checkbox'}`"
							:color="`${serviceAI ? '#4C5382' : '#A0A0A0'}`" />
					</view>
					<view style="display: flex; flex-direction: row; align-items: center;">
						<text class="device-tips">到期可选择续费：{{servicePriceFirstYear}}元&nbsp;</text>
						<text class="device-tips"
							style="text-decoration-line: line-through;">{{servicePriceYear}}元</text>
						<text class="device-tips">/年</text>
					</view>
					<view class="device-row-container" style="flex: 1; margin-top: 6px;" @click="serviceChanged(1)">
						<text class="device-tip-text" style="flex: 1; font-size: 12px;">专家健康管理 1月</text>
						<uni-icons style="margin: 0px 10px;" size="16"
							:type="`${serviceExpertMonth ? 'checkbox-filled' : 'checkbox'}`"
							:color="`${serviceExpertMonth ? '#4C5382' : '#A0A0A0'}`" />
					</view>
					<text class="device-tips">到期可选择续费：{{expertPriceMonth}}元/月</text>
					<!-- <view class="device-row-container" style="flex: 1; margin-top: 6px;" @click="serviceChanged(2)">
						<text class="device-tip-text" style="flex: 1; font-size: 12px;">专家健康管理 1年</text>
						<uni-icons style="margin: 0px 10px;" size="16"
							:type="`${serviceExpert ? 'checkbox-filled' : 'checkbox'}`"
							:color="`${serviceExpert ? '#4C5382' : '#A0A0A0'}`" />
					</view>
					<text class="device-tips">到期可选择续费：{{expertPriceYear}}元/年</text> -->
				</view>
			</view>
			<view class="device-product-bottom">
				<text class="device-tips" style="flex: 1;">{{deviceTips}}</text>
				<view class="device-product-amount">
					<image class="device-product-icon" mode="widthFix" @click="decrease"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/minus.png" />
					<text class="amount-text">{{productAmount}}</text>
					<image class="device-product-icon" mode="widthFix" @click="increase"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/plus.png" />
				</view>
			</view>
			<view class="device-text-row" style="margin-top: 10px;">
				<text class="device-label" style="width: 52px;">收件人</text>
				<text class="device-label" style="width: 21px;">：</text>
				<text class="device-text">{{username}}</text>
				<view class="device-btn-text" @click="chooseAddress">更换 >> </view>
			</view>
			<view class="device-text-row">
				<text class="device-label" style="width: 52px;">收件地址</text>
				<text class="device-label" style="width: 21px;">：</text>
				<text v-if="hasAddress" class="device-text">{{addressText}}</text>
				<text v-else class="device-text" style="color: #4C5382; font-weight: bold;" @click="chooseAddress">请填写地址
					>></text>
			</view>
			<view class="product-divider" />
			<view class="device-pay">
				<view class="device-pay-tips" @click="starChanged">
					<uni-icons v-if="star" type="star-filled" size="15" color="#4C5382" />
					<uni-icons v-else type="star" size="15" color="#A0A0A0" />
					<text class="device-tip-text" style="flex: 1; margin-left: 3px;">{{orderCountDesc}}</text>
				</view>
				<button class="device-pay-button" @click="purchase">{{productDesc}} 购买</button>
			</view>
		</view>
	</view>
</template>
<script>
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		payForProduct
	} from '@/common/js/device';
	import {
		EXPERT_PRICE_MONTH,
		EXPERT_PRICE_YEAR,
		PRODUCT_PRICE_AUTOTIP,
		PRODUCT_PRICE_NORMAL,
		PRODUCT_SLEEP_BELT,
		PRODUCT_TYPE_SLEEP_BELT,
		SERVICE_PRICE_FIRST_YEAR,
		SERVICE_PRICE_MONTH,
		SERVICE_PRICE_YEAR,
		getProductPrice,
		updateUserAddress
	} from '@/common/js/productorder';

	export default {
		name: "popupProduct",
		mixins: [popup],
		emits: ['confirm', 'close', 'closePopup', 'request', 'pay'],
		data() {
			return {
				popupStyle: {},
				productType: PRODUCT_TYPE_SLEEP_BELT,
				productName: PRODUCT_SLEEP_BELT,
				productPrice: PRODUCT_PRICE_NORMAL,
				productAmount: 1,
				serviceType: -1, // 健康管理服务类型
				star: false
			}
		},
		computed: {
			serviceAI: function() {
				return this.serviceType == 0;
			},
			serviceExpertMonth: function() {
				return this.serviceType == 1;
			},
			serviceExpert: function() {
				return this.serviceType == 2;
			},
			servicePriceMonth: function() {
				return SERVICE_PRICE_MONTH;
			},
			servicePriceFirstYear: function() {
				return SERVICE_PRICE_FIRST_YEAR;
			},
			servicePriceYear: function() {
				return SERVICE_PRICE_YEAR;
			},
			expertPriceMonth: function() {
				return EXPERT_PRICE_MONTH;
			},
			expertPriceYear: function() {
				return EXPERT_PRICE_YEAR;
			},
			productDesc: function() {
				return '￥' + this.productPrice * this.productAmount;
			},
			deviceTips: function() {
				return '预计锁单后1周内发货';
			},
			hasAddress: function() {
				return store.userInfo.addresses?.length > 0;
			},
			username: function() {
				return this.hasAddress ? store.userInfo.addresses[0].username : store.userInfo.nickname;
			},
			addressText: function() {
				const address = store.userInfo.addresses[0];
				return `${address.provinceName}${address.cityname}${address.countyName}${address.detailInfo}`;
			},
			orderCountDesc: function() {
				return `已有${store.orderCount}人预订`;
			}
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const screenWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.popupStyle.width = `${screenWidth}px`;
		},
		methods: {
			actionIntercept() {
				// 拦截事件，防止冲突
			},
			close() {
				this.popup.close();
			},
			closePopup() {
				this.$emit('closePopup')
			},
			serviceChanged: function(serviceType) {
				if (this.serviceType == serviceType) {
					this.serviceType = -1;
				} else {
					this.serviceType = serviceType;
				}
				this.productPrice = getProductPrice(this.serviceType);
			},
			decrease: function() {
				if (this.productAmount > 1) {
					this.productAmount -= 1;
				} else {
					uni.showToast({
						icon: 'none',
						title: '最少不低于1个产品',
						duration: 600
					});
				}
			},
			increase: function() {
				if (this.productAmount < 10) {
					this.productAmount += 1;
				} else {
					const that = this;
					uni.showModal({
						content: `您购买的数量超过10个，确定继续增加吗？`,
						confirmColor: '#4C5382',
						confirmText: "确定",
						showCancel: true,
						cancelText: "取消",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								that.productAmount += 1;
							}
						}
					});
				}
			},
			starChanged: function() {
				this.star = !this.star
			},
			chooseAddress: function() {
				updateUserAddress();
			},
			purchase: function() {
				const that = this;
				if (this.hasAddress) {
					uni.showModal({
						title: '购前须知：',
						content: `分享到朋友圈邀请好友注册，可获得积分优惠；每成功邀请一位获得 20 积分（抵扣 2 元)。`,
						confirmColor: '#4C5382',
						confirmText: "确定购买",
						showCancel: true,
						cancelText: "知道了",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								const fee = that.productPrice * that.productAmount;
								const desc = `${that.productName}${that.productAmount}件：购买`;
								payForProduct(that.productPrice, that.productAmount, fee, desc, 1, that
									.productType);
								that.close();
							}
						}
					});
				} else {
					uni.showModal({
						content: `请先填写收件地址`,
						confirmColor: '#4C5382',
						confirmText: "去填写",
						showCancel: true,
						cancelText: "取消",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								that.chooseAddress();
							}
						}
					});
				}
			}
		}
	}
</script>

<style lang="scss">
	.popup-product {
		display: flex;
		flex-direction: column;
	}

	.device-product-config {
		display: flex;
		flex-direction: column;
		margin: 20px 20px;
		padding: 20px 20px;
		border-radius: 10px;
		background-color: white;
	}

	.device-product-info {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 3px;
	}

	.device-product-text {
		font-size: 14px;
		color: #282828;
		vertical-align: middle;
	}

	.device-service-type {
		display: flex;
		flex-direction: row;
		margin-top: 12px;
		padding-left: 6px;
	}

	.device-tip-text {
		line-height: 20px;
		font-size: 11px;
		color: #A0A0A0;
		margin-top: 1px;
	}

	.action-icon {
		margin-right: 10px;
	}

	.trigger-item-button {
		font-size: 11px;
		line-height: 18px;
		padding: 0px 15px;
		margin-right: 6px;
		color: dimgray;
		text-align: center;
		border: solid 1px #A0A0A0;
		border-radius: 18px;
	}

	.trigger-item-button-selected {
		font-size: 11px;
		line-height: 18px;
		padding: 0px 15px;
		margin-right: 6px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border: solid 1px #4C5382;
		border-radius: 18px;
	}

	.device-tip-trigger {
		display: flex;
		flex-direction: row;
		font-size: 11px;
		border: solid 1px #A0A0A0;
		border-radius: 20px;
		margin-right: 6px;
	}

	.trigger-item-left {
		height: 18px;
		line-height: 18px;
		padding: 0px 15px 0px 18px;
		color: dimgray;
		text-align: center;
		background-color: white;
		border-top-left-radius: 18px;
		border-bottom-left-radius: 18px;
	}

	.trigger-item-selected-left {
		height: 18px;
		line-height: 18px;
		padding: 0px 15px 0px 18px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border-top-left-radius: 18px;
		border-bottom-left-radius: 18px;
	}

	.trigger-item-right {
		height: 18px;
		line-height: 18px;
		padding: 0px 18px 0px 15px;
		color: #A0A0A0;
		text-align: center;
		background-color: white;
		border-top-right-radius: 18px;
		border-bottom-right-radius: 18px;
	}

	.trigger-item-selected-right {
		height: 18px;
		line-height: 18px;
		padding: 0px 18px 0px 15px;
		color: white;
		text-align: center;
		background-color: #4C5382;
		border-top-right-radius: 18px;
		border-bottom-right-radius: 18px;
	}

	.device-product-bottom {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 12px;
	}

	.device-tips {
		color: #C0C0C0;
		font-size: 10px;
	}

	.device-product-amount {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.amount-text {
		flex: 1;
		text-align: center;
		min-width: 15px;
		font-size: 13px;
		color: #A0A0A0;
	}

	.device-product-icon {
		width: 18px;
		padding: 3px 3px;
	}

	.device-text-row {
		display: flex;
		flex-direction: row;
	}

	.device-label {
		font-size: 11px;
		color: #A0A0A0;
		line-height: 24px;
		vertical-align: middle;
	}

	.device-text {
		flex: 1;
		font-size: 11px;
		color: #A0A0A0;
		line-height: 24px;
		vertical-align: middle;
		white-space: pre-wrap;
	}

	.device-btn-text {
		font-size: 11px;
		color: #4C5382;
		line-height: 24px;
		font-weight: bold;
	}

	.device-btn-text:active {
		opacity: 0.8;
	}

	.product-divider {
		height: 1px;
		border-bottom: 1px dashed #F0F0F0;
		margin: 10px 10px 0px;
	}

	.device-pay {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 10px 0px 0px;
	}

	.device-pay-tips {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.device-pay-button {
		background-color: #4C5382;
		color: white;
		font-weight: bold;
		border-radius: 20px;
		font-size: 12px;
		padding: 0px 15px;
	}

	.device-pay-button:active {
		opacity: 0.8;
	}

	.device-row-container {
		display: flex;
		flex-direction: row;
	}
</style>