<template>
	<view class="popup-service-container" :style="popupStyle">
		<view class="popup-service-title">
			<text class="popup-title-text">心脉AI服务续费</text>
			<text style="flex: 1; margin-left: 6px;  color: #C0C0C0; font-size: 10px;">{{serviceText}}</text>
			<view class="popup-close-btn" @click="closePopup">
				<uni-icons class="close-icon" type="closeempty" size="20" color="#808080" />
			</view>
		</view>
		<view class="popup-title-divider" />
		<view class="popup-item" @click="toPay(servicePriceMonth)">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/protect_b.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">AI健康管理：1月</text>
				</view>
				<view>
					<text class="popup-item-price-text" style="color: #4C5382;">￥{{servicePriceMonth}}</text>
				</view>
				<text class="popup-item-subtitle">{{serviceExtendMonth}}</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="16" color="#C0C0C0" />
			</view>
		</view>
		<view class="popup-divider" />
		<view class="popup-item" @click="toPay(servicePriceYear)">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/takecare_r.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">AI健康管理：1年</text>
				</view>
				<view>
					<text class="popup-item-price-text" style="color: #4C5382;">￥{{servicePriceYear}}</text>
					<text class="popup-item-price-gray">（低至 20.75 </text>
					<text class="popup-item-price-gray" style="text-decoration-line: line-through;">34</text>
					<text class="popup-item-price-gray">元/月）</text>
				</view>
				<text class="popup-item-subtitle">{{serviceExtendYear}}</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="16" color="#C0C0C0" />
			</view>
		</view>
		<view class="popup-divider" />
		<view class="popup-item" @click="toPay(expertPriceMonth)">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/zhong_rect.jpg" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">专家健康管理：1月</text>
				</view>
				<view>
					<text class="popup-item-price-text">￥{{expertPriceMonth}}</text>
				</view>
				<text class="popup-item-subtitle">{{serviceExtendMonth}}</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="16" color="#C0C0C0" />
			</view>
		</view>
		<!-- <view class="popup-divider" />
		<view class="popup-item" @click="toPay(expertPriceYear)">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/zhong_rect.jpg" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">专家健康管理：1年</text>
				</view>
				<view>
					<text class="popup-item-price-text">￥{{expertPriceYear}}</text>
				</view>
				<text class="popup-item-subtitle">{{serviceExtendYear}}</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="16" color="#C0C0C0" />
			</view>
		</view> -->
	</view>
</template>
<script>
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		getDateFrom,
		getMillisNow,
		monthInMillis,
		yearInMillis
	} from '@/common/utils/timestamp';
	import {
		payForProductService
	} from '@/common/js/device';
	import {
		EXPERT_PRICE_MONTH,
		EXPERT_PRICE_YEAR,
		SERVICE_PRICE_MONTH,
		SERVICE_PRICE_YEAR
	} from '@/common/js/productorder';

	export default {
		name: "popupService",
		mixins: [popup],
		emits: ['confirm', 'close', 'closePopup', 'pay'],
		data() {
			return {
				product: {},
				popupStyle: {},
				millisNow: getMillisNow()
			}
		},
		computed: {
			servicePriceMonth: function() {
				return SERVICE_PRICE_MONTH;
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
			hasService: function() {
				return this.product?.serviceEnd;
			},
			ended: function() {
				return !this.hasService || (this.millisNow > Number(this.product.serviceEnd));
			},
			serviceText: function() {
				let text = '';
				if (this.hasService) {
					const date = getDateFrom(Number(this.product.serviceEnd));
					text = `服务${this.ended ? '已' : '将'}于 ${date} 到期`;
				} else {
					text = '您还没有购买服务';
				}
				return text;
			},
			serviceExtendMonth: function() {
				return this.serviceExtend(monthInMillis());
			},
			serviceExtendYear: function() {
				return this.serviceExtend(yearInMillis());
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
			update(product) {
				this.product = product;
			},
			close() {
				this.popup.close();
			},
			closePopup() {
				this.$emit('closePopup');
			},

			serviceExtend: function(durationInMillis) {
				const dateExtend = (this.ended ? this.millisNow : (Number(this.product.serviceEnd)) +
					durationInMillis);
				return `服务将延长至 ${getDateFrom(dateExtend)}`;
			},
			toPay: function(price) {
				payForProductService(this.product.poid, price);
				this.close();
			}
		}
	}
</script>

<style lang="scss">
	.popup-service-container {
		display: flex;
		flex-direction: column;
		bottom: 0px;
		padding: 8px 0px 0px;
		background-color: white;
		border-radius: 10px;
		border-bottom-left-radius: 0px;
		border-bottom-right-radius: 0px;
		overflow: hidden;
	}

	.popup-service-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 8px 20px;
	}

	.popup-title-text {
		color: #484848;
		font-size: 14px;
		font-weight: bold;
		text-align: left;
		vertical-align: middle;
	}

	.popup-close-btn {
		display: flex;
		flex-direction: row;
		width: 30px;
		height: 30px;
		align-items: center;
		justify-content: center;
	}

	.popup-close-btn:active {
		opacity: 0.8;
	}

	.close-icon {}

	.close-icon:active {
		opacity: 0.8;
	}

	.popup-item {
		display: flex;
		flex-direction: row;
		padding: 8px 20px;
	}

	.popup-item-left {
		display: flex;
		flex-direction: column;
		width: 36px;
		height: 36px;
		margin-top: 6px;
		margin-right: 10px;
		align-items: center;
		justify-content: center;
	}

	.popup-item-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
	}

	.popup-item-column {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 5px 0px;
	}

	.popup-item-flex-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.popup-item-text {
		font-size: 14px;
		font-weight: bold;
		color: #484848;
	}

	.popup-action-button {
		height: 20px;
		min-width: 45px;
		line-height: 20px;
		background-color: #4C5382;
		color: white;
		border-radius: 20px;
		font-size: 9px;
		margin-left: 5px;
		text-align: center;
		vertical-align: middle;
	}

	.popup-action-button:active {
		opacity: 0.8;
	}

	.popup-item-section {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.popup-item-price-text {
		font-size: 12px;
		color: #4C5382;
		font-weight: bold;
		padding: 3px 3px;
	}

	.popup-item-price-gray {
		font-size: 11px;
		color: #A0A0A0;
	}

	.popup-item-subtitle {
		font-size: 10px;
		color: #A0A0A0;
		padding: 3px 0px;
	}

	.popup-item-right {
		width: 36px;
		display: flex;
		flex-direction: column;
		padding-right: 4px;
		margin-left: 10px;
		align-items: flex-end;
		justify-content: center;
	}

	.popup-title-divider {
		height: 1px;
		margin: 0px 20px;
		border-top: lightgray 1px solid;
	}

	.popup-divider {
		height: 1px;
		margin: 0px 20px;
		border-top: lightgray 1px dashed;
	}
</style>