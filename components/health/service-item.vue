<template>
	<view class="service-config shadow" :style="serviceStyle">
		<view class="device-product-info" :class="`gradient-effect-${index}`" @click="onPurchase">
			<uni-icons class="action-icon" type="circle-filled" size="16" color="#FFFFFF" />
			<text class="device-product-text">{{servicePackage.title}}</text>
			<uni-icons style="margin-left: 3px;" type="right" size="13" color="#FFFFFF" />
		</view>
		<view v-for="(service,si) in servicePackage.services" :key="`service-${si}`" class="device-auto-tips"
			@click="showPopupConfig">
			<text class="service-name-text">{{service.name}}</text>
			<view v-for="(desc,di) in service.descs" :key="`service-desc-${di}`" class="service-desc-text">
				<uni-icons type="checkmarkempty" size="13" color="#4C5382" style="margin: 1px 5px 0px" />
				<text>{{desc}}</text>
			</view>
		</view>
		<view class="device-product-bottom">
			<view :class="`${servicePurchased ? 'device-pay-button-disable' :'device-pay-button'}`" @click="onPurchase">
				{{buttonText}}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		serviceVersions
	} from '@/common/js/device';
	import {
		PRODUCT_PRICE_AUTOTIP,
		PRODUCT_SLEEP_BELT,
		SERVICE_TYPE_CARDIO_CARE
	} from '../../common/js/productorder';
	export default {
		data() {
			return {
				serviceStyle: {}
			}
		},
		props: {
			index: Number
		},
		computed: {
			servicePackage: function() {
				return serviceVersions[this.index];
			},
			servicePurchased: function() {
				return store.hasProducts() && store.userInfo.products[store.userConfig.productIndex].price == this
					.servicePackage.price;
			},
			buttonText: function() {
				let text = '';
				if (store.hasProducts()) {
					const product = store.userInfo.products[store.userConfig.productIndex];
					console.log("ButtonText, price = " + product.price + ", servicePackage = " + this.servicePackage
						.price);
					text = product.price == this.servicePackage.price ? '已订阅' : '升级套餐';
				} else {
					text = '立即订阅';
				}
				return text;
			}
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const windowWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.serviceStyle.height = `${Math.round(windowWidth * 1.3) - 30}px`;
		},
		methods: {
			onPurchase: function() {
				store.hasProducts() && store.userInfo.products[store.userConfig.productIndex].price == this
					.servicePackage.price;
				if (store.hasProducts()) {
					if (store.userInfo.products[store.userConfig.productIndex].price != this.servicePackage.price) {
						const product = {
							type: SERVICE_TYPE_CARDIO_CARE,
							name: PRODUCT_SLEEP_BELT,
							price: this.servicePackage.price,
							amount: 1,
							state: 3,
							intro: this.servicePackage.intro
						};
						this.$emit('upgrade', product)
					}
				} else {
					this.$emit('purchase')
				}
			}
		}
	}
</script>

<style>
	.service-config {
		display: flex;
		flex-direction: column;
		margin: 10px;
		border-radius: 10px;
		background-color: white;
		overflow: hidden;
	}

	.service-config:active {
		opacity: 0.9;
	}

	.device-product-info {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 12px 15px;
		margin-bottom: 20px;
	}

	.gradient-effect-0 {
		background: linear-gradient(135deg, rgba(0, 136, 187, 1) 0%, rgba(95, 158, 160, 1) 85%);
	}

	.gradient-effect-1 {
		background: linear-gradient(135deg, rgba(76, 83, 130, 1) 0%, rgba(95, 158, 160, 1) 85%);
	}

	.gradient-effect-2 {
		background: linear-gradient(135deg, rgba(219, 84, 92, 1) 0%, rgba(76, 83, 130, 1) 85%);
	}

	.device-product-text {
		flex: 1;
		font-size: 15px;
		font-weight: bold;
		color: #FFFFFF;
		vertical-align: middle;
	}

	.device-auto-tips {
		display: flex;
		flex-direction: column;
		margin: 5px 20px;
	}

	.service-name-text {
		font-size: 13px;
		font-weight: bold;
		color: #484848;
		margin: 3px 0px;
	}

	.service-desc-text {
		display: flex;
		flex-direction: row;
		font-size: 12px;
		color: #A0A0A0;
		line-height: 19px;
	}

	.device-product-bottom {
		position: fixed;
		bottom: 20px;
		right: 30px;
		display: flex;
		flex-direction: row;
	}
</style>