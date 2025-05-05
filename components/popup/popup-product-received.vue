<template>
	<view class="popup-container" :style="popupStyle">
		<view class="item-row" style="margin: 0px 15px 10px;">
			<text class="item-row-text">{{popupTitle}}</text>
			<view class="popup-close-btn" @click="closePopup">
				<uni-icons class="close-icon" type="closeempty" size="20" color="#808080" />
			</view>
		</view>
		<view class="item-column" style="margin: 0px 15px;">
			<view class="item-unit item-selected shadow">
				<view class="item-row" style="margin-bottom: 20px;">
					<view style="flex: 1;">
						<image class="product-image" mode="widthFix" :src="popupImage" />
					</view>
					<view class="item-column" style="margin-top: 6px;">
						<image class="router-icon-on" mode="heightFix"
							src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/router_white.png" />
						<text class="item-desc" style="font-size: 9px;">WI-FI连接</text>
					</view>
				</view>
				<text class="item-name">{{product.name}}</text>
				<text class="item-desc">{{productDesc}}</text>
			</view>
		</view>
		<view class="device-address">
			<view class="device-text-row">
				<text class="device-label" style="width: 52px;">收件人</text>
				<text class="device-label" style="width: 21px;">：</text>
				<text class="device-text">{{username}}</text>
			</view>
			<view v-if="hasAddress" class="device-text-row">
				<text class="device-label" style="width: 52px;">收件地址</text>
				<text class="device-label" style="width: 21px;">：</text>
				<text class="device-text">{{addressText}}</text>
			</view>
		</view>
		<view class="flex-row" style="margin: 24px 24px 0px;">
			<button class="device-action-button" @click="onAction">{{popupButton}}</button>
			<button v-if="fromPurchase" class="device-action-button" style="margin-left: 20px;"
				@click="onContinue">继续订阅</button>
		</view>
	</view>
</template>
<script>
	import {
		EXPERT_PRICE_MONTH,
		EXPERT_PRICE_YEAR,
		SERVICE_PRICE_FIRST_YEAR,
		SERVICE_PRICE_MONTH,
		SERVICE_PRICE_YEAR,
		getServiceDuration

	} from '@/common/js/productorder';
	import {
		closeProductShare,
		imageMap,
		updateUserInfo
	} from '@/common/js/device';
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';

	export default {
		name: "popupProductConfig",
		mixins: [popup],
		emits: ['close', 'closePopup', 'onProduct'],
		data() {
			return {
				from: 'share',
				product: {},
				popupStyle: {}
			}
		},
		props: {
			type: {
				type: Number
			}
		},
		computed: {
			fromPurchase() {
				return this.from == 'purchase';
			},
			popupTitle() {
				return this.fromPurchase ? '请您配置设备的收货地址：' : '收到一台共享设备：';
			},
			popupImage() {
				return imageMap[this.product.type];
			},
			productDesc: function() {
				return this.fromPurchase ? 'ES 6 | 心肺+睡眠监测仪' :
					'ES 6 | 智能健康管理 ' + getServiceDuration(this.product.price);
			},
			popupButton() {
				return this.fromPurchase ? (this.hasAddress ? '更新地址' : '添加收货地址') : '添加设备';
			},
			hasAddress: function() {
				return store.hasAddress();
			},
			username: function() {
				return store.username();
			},
			addressText: function() {
				return store.addressText();
			},
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const windowWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.popupStyle.width = `${windowWidth * 0.8}px`;
		},
		methods: {
			close: function() {
				this.popup.close();
			},
			closePopup: function() {
				this.$emit('closePopup')
			},
			update: function(from, product) {
				this.from = from;
				this.product = product;
			},
			onAction: function() {
				if (this.fromPurchase) {
					this.$emit('onAddress');
				} else {
					this.bindDevice();
				}
			},
			bindDevice: function() {
				// 更新用户产品信息
				if (!store.userInfo.products) {
					store.userInfo.products = [];
				}
				store.userInfo.products.unshift(this.product);
				closeProductShare(this.product);
				updateUserInfo(store.userInfo._id, {
					products: store.userInfo.products
				}, res => {
					this.$emit('onProduct', this.product);
					uni.showToast({
						icon: 'none',
						title: '添加成功',
						duration: 1000
					});
					this.closePopup();
				});
			},
			onContinue: function() {
				this.$emit('onContinue');
				this.closePopup();
			}
		}
	}
</script>

<style>
	.popup-container {
		display: flex;
		flex-direction: column;
		bottom: 0px;
		padding: 20px 0px 24px;
		background-color: white;
		border-radius: 10px;
		overflow: hidden;
	}

	.popup-close-btn {
		width: 24px;
		height: 24px;
	}

	.close-icon {}

	.close-icon:active {
		opacity: 0.8;
	}

	.item-column {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.item-row-text {
		flex: 1;
		font-size: 14px;
		font-weight: bold;
		color: #484848;
		margin: 6px 8px;
	}

	.item-section {
		display: flex;
		flex-direction: column;
		max-width: 120px;
		padding: 6px 6px;
		border-radius: 10px;
		overflow: hidden;
	}

	.section-default {
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.section-selected {
		border: 1px solid rgba(76, 83, 130, 1);
	}

	.item-section-text {
		flex: 1;
		color: #606060;
		font-size: 11px;
		font-weight: bold;
		margin: 3px 6px 1px;
	}

	.item-section-desc {
		font-size: 9px;
		margin: 1px 6px 3px;
		color: #C0C0C0;
	}

	.item-section-price {
		font-size: 9px;
		margin: 0px 6px 3px;
		color: #A0A0A0;
	}

	.item-unit {
		display: flex;
		flex-direction: column;
		width: 150px;
		height: 150px;
		padding: 20px 20px;
		background-color: white;
		border-radius: 10px;
		overflow: hidden;
	}

	.item-selected {
		background-color: rgba(76, 83, 130, 0.1);
	}

	.product-image {
		width: 90px;
		height: 90px;
		overflow: hidden;
	}

	.router-icon-on {
		width: 17px;
		height: 17px;
		padding: 5px;
		border-radius: 50%;
		overflow: hidden;
		background-color: #4C5382;
	}

	.item-name {
		font-size: 13px;
		color: #606060;
		font-weight: bold;
		margin-bottom: 3px;
	}

	.item-desc {
		font-size: 10px;
		color: #A0A0A0;
		margin-top: 2px;
	}

	.device-action-button {
		flex: 1;
		background-color: #4C5382;
		color: white;
		font-weight: bold;
		border-radius: 20px;
		font-size: 12px;
	}

	.device-action-button:active {
		opacity: 0.8;
	}
</style>