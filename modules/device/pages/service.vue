<template>
	<view>
		<!-- 服务Slider -->
		<swiper style="margin: 10px" :style="serviceStyle" next-margin="40px" :circular="true" :current="currentService"
			@change="onServiceChanged">
			<swiper-item v-for="index in [0,1,2]" :key="`service-swiper-${index}`" class="device-swiper-item">
				<service-item :index="index" @purchase="toOrder" />
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		payForProduct
	} from '@/common/js/device';
	import serviceItem from '@/components/health/service-item.vue';
	export default {
		data() {
			return {
				serviceStyle: {}, // 服务介绍滑动样式
				product: store.userInfo.products[store.userConfig.productIndex]
			}
		},
		components: {
			serviceItem
		},
		computed: {
			serviceAI: function() {
				return this.serviceType == 0;
			},
			serviceExpert: function() {
				return this.serviceType == 2;
			},
			productIntro: function() {
				return this.serviceExpert ? '旗舰版' : (this.serviceAI ? '专业版' : '标准版');
			},
		},
		onLoad() {
			const systemInfo = getApp().globalData.systemInfo;
			const windowWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.serviceStyle.height = `${Math.round(windowWidth * 1.3)}px`;
		},
		methods: {
			toOrder: function() {
				const totalPrice = this.product.price * this.product.amount;
				const fee = totalPrice;
				const desc = `心脏健康管理服务 | ${this.productIntro}：`;
				const state = 1;
				payForProduct(this.product.price, this.product.amount, fee, desc, state, this.product.type, this
					.product.poid);
			}
		}
	}
</script>

<style>
	.device-swiper-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
</style>