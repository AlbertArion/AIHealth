<template>
	<view class="popup-container" :style="popupStyle">
		<view class="item-row" style="margin: 0px 15px;">
			<text class="item-row-text">硬件型号：ES 6</text>
			<view class="popup-close-btn" @click="closePopup">
				<uni-icons class="close-icon" type="closeempty" size="20" color="#808080" />
			</view>
		</view>
		<view class="item-row" style="margin: 0px 15px;">
			<view class="item-unit item-selected shadow">
				<view class="image-row">
					<view style="flex: 1;">
						<image class="product-image" mode="widthFix" :src="imageSrc" />
					</view>
					<view class="price-container">
						<text class="item-price">￥{{product.price}}</text>
					</view>
				</view>
				<text class="item-name">{{product.name}}</text>
				<text class="item-desc">白色全套配件：电源、智能监测盒、数据采集带</text>
			</view>
			<view class="item-unit" style="margin-left: 10px; visibility: hidden;" />
		</view>
		<view class="item-row" style="margin: 10px 15px 0px">
			<text class="item-row-text">默认服务：</text>
		</view>
		<view class="item-row" style="margin: 0px 15px;">
			<view class="item-section section-selected">
				<view class="item-row">
					<text class="item-section-text">数据监测通知</text>
					<uni-icons size="16" type="checkbox-filled" color="#4C5382" />
				</view>
				<text class="item-section-desc" style="text-align: center;">心率、睡眠、呼吸等数据</text>
			</view>
			<view class="item-section section-selected" style="margin-left: 10px;">
				<view class="item-row">
					<text class="item-section-text">健康可视化</text>
					<uni-icons size="16" type="checkbox-filled" color="#4C5382" />
				</view>
				<text class="item-section-desc" style="text-align: center;">心率散点图、趋势图等</text>
			</view>
		</view>
		<view class="item-row" style="margin: 10px 15px 0px;">
			<text class="item-row-text">可选服务：</text>
		</view>
		<view class="item-row" style="margin: 0px 15px;">
			<view class="item-section" :class="`${serviceAI ? 'section-selected' : 'section-default'}`"
				@click="onServiceSelected(0)">
				<view class="item-row">
					<text class="item-section-text">智能健康管理 1年</text>
					<uni-icons :style="`${serviceAI ? '' : 'visibility: hidden;'}`" size="16" type="checkbox-filled"
						color="#4C5382" />
				</view>
				<text class="item-section-desc">每日健康数据解读，精准建议</text>
				<text class="item-section-price"
					:style="`${serviceAI ? 'color: #4C5382' : ''}`">￥{{servicePriceFirstYear}}</text>
			</view>
			<view class="item-section" style="margin-left: 10px; visibility: hidden;" />
		</view>
		<view class="item-row" style="margin: 10px 15px 0px;">
			<view class="item-section" :class="`${serviceExpertMonth ? 'section-selected' : 'section-default'}`"
				@click="onServiceSelected(1)">
				<view class="item-row">
					<text class="item-section-text">专家健康管理 1月</text>
					<uni-icons :style="`${serviceExpertMonth ? '' : 'visibility: hidden;'}`" size="16"
						type="checkbox-filled" color="#4C5382" />
				</view>
				<text class="item-section-desc">每日健康数据解读，精准建议</text>
				<text class="item-section-price"
					:style="`${serviceExpertMonth ? 'color: #4C5382' : ''}`">￥{{expertPriceMonth}}</text>
			</view>
			<!-- <view class="item-section" :class="`${serviceExpert ? 'section-selected' : 'section-default'}`"
				style="margin-left: 10px;" @click="onServiceSelected(2)">
				<view class="item-row">
					<text class="item-section-text">专家健康管理 1年</text>
					<uni-icons :style="`${serviceExpert ? '' : 'visibility: hidden;'}`" size="16" type="checkbox-filled"
						color="#4C5382" />
				</view>
				<text class="item-section-desc">智能健康管理 + 专家风险评估与解决</text>
				<text class="item-section-price"
					:style="`${serviceExpert ? 'color: #4C5382' : ''}`">￥{{expertPriceYear}}</text>
			</view> -->
		</view>
	</view>
</template>
<script>
	import {
		EXPERT_PRICE_MONTH,
		EXPERT_PRICE_YEAR,
		SERVICE_PRICE_FIRST_YEAR,
		getServiceDuration
	} from '@/common/js/productorder';
	import {
		imageMap
	} from '@/common/js/device';
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';

	export default {
		name: "popupProductConfig",
		mixins: [popup],
		emits: ['close', 'closePopup', 'serviceChanged'],
		data() {
			return {
				popupStyle: {},
				serviceType: this.type
			}
		},
		props: {
			product: {
				type: Object
			},
			type: {
				type: Number
			}
		},
		computed: {
			imageSrc() {
				return imageMap[this.product.type];
			},
			servicePriceFirstYear: function() {
				return SERVICE_PRICE_FIRST_YEAR;
			},
			expertPriceMonth: function() {
				return EXPERT_PRICE_MONTH;
			},
			expertPriceYear: function() {
				return EXPERT_PRICE_YEAR;
			},
			serviceAI: function() {
				return this.serviceType == 0;
			},
			serviceExpertMonth: function() {
				return this.serviceType == 1;
			},
			serviceExpert: function() {
				return this.serviceType == 2;
			},
			isNotOrdered: function() {
				return this.product?.state == -1;
			}
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const windowWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.popupStyle.width = `${windowWidth}px`;
		},
		methods: {
			close: function() {
				this.popup.close();
			},
			closePopup: function() {
				this.$emit('closePopup');
			},
			onServiceSelected: function(serviceType) {
				if (!this.isNotOrdered) {
					// 已购买，不能切换服务类型
					return;
				}
				if (this.serviceType == serviceType) {
					this.serviceType = -1;
				} else {
					this.serviceType = serviceType;
				}
				this.$emit('serviceChanged', this.serviceType);
				setTimeout(this.closePopup, 300);
			}
		}
	}
</script>

<style>
	.popup-container {
		display: flex;
		flex-direction: column;
		bottom: 0px;
		padding: 10px 0px 15px 0px;
		background-color: white;
		border-radius: 10px;
		border-bottom-left-radius: 0px;
		border-bottom-right-radius: 0px;
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

	.item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.item-row-text {
		flex: 1;
		font-size: 13px;
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
		flex: 1;
		display: flex;
		flex-direction: column;
		background-color: white;
		border-radius: 10px;
		padding: 20px 20px;
		overflow: hidden;
	}

	.item-selected {
		background-color: rgba(76, 83, 130, 0.1);
	}

	.image-row {
		display: flex;
		flex-direction: row;
		margin-bottom: 10px;
	}

	.product-image {
		width: 40px;
		height: 40px;
		border-radius: 6px;
		overflow: hidden;
	}

	.price-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.item-price {
		font-size: 13px;
		color: #4C5382;
		margin-top: 3px;
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
</style>