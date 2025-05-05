<template>
	<view class="popup-manual-container" :style="popupStyle">
		<view class="popup-manual-title">
			<text class="popup-title-text">选择解读方式</text>
			<text class="popup-item-price-text" style="flex: 1; color: #A0A0A0; font-size: 12px;">{{''}}</text>
			<view class="popup-close-btn" @click="closePopup">
				<uni-icons class="close-icon" type="closeempty" size="20" color="#808080" />
			</view>
		</view>
		<view class="popup-title-divider" />
		<view class="popup-item" @click="toExchange">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/record/exchange.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">积分兑换：</text>
				</view>
				<view>
					<text class="popup-item-price-text"> - 199积分</text>
				</view>
				<text
					class="popup-item-subtitle">使用积分兑换，为此报告生成健康建议，将于12小时内完成，在微信小程序「心脉AI」的消息提醒中通知您；也可以在「我的」-「我的健康建议」中查看。</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="20" color="#A0A0A0" />
			</view>
		</view>
		<view class="popup-divider" />
		<view class="popup-item" @click="toPay">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/record/healthtip.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">健康解读：</text>
				</view>
				<view>
					<text class="popup-item-price-text">￥19.9</text>
				</view>
				<text
					class="popup-item-subtitle">为此报告生成健康建议，将于12小时内完成，在微信小程序「心脉AI」的消息提醒中通知您；也可以在「我的」-「我的健康建议」中查看。</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="20" color="#A0A0A0" />
			</view>
		</view>
		<view class="popup-divider" />
		<view class="popup-item" @click="toExpert">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/zhong_large.jpg" />
				<text class="popup-item-icon-text">钟医生</text>
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">专家建议：</text>
				</view>
				<view>
					<text class="popup-item-price-text">￥199</text>
				</view>
				<text
					class="popup-item-subtitle">北京和睦家医院心血管专家钟幼民博士为此报告评估，将于12小时内提供专家建议，在微信小程序「心脉AI」的消息提醒中通知您，也可以在「我的」-「我的健康建议」中查看。</text>
			</view>
			<view class="popup-item-right">
				<uni-icons class="close-icon" type="right" size="20" color="#A0A0A0" />
			</view>
		</view>
	</view>
</template>
<script>
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';

	export default {
		name: "popupManual",
		mixins: [popup],
		emits: ['confirm', 'close', 'closePopup', 'pay', 'exchange'],
		data() {
			return {
				popupStyle: {},
				page: 1,
				totalPages: 1,
				totalPrice: undefined
			}
		},
		props: {
			record: {
				type: Object
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
			toExchange: function() {
				this.$emit('exchange');
				this.close();
			},
			toPay: function() {
				this.$emit('pay', false);
				this.close();
			},
			toExpert: function() {
				this.$emit('pay', true);
				this.close();
			}
		}
	}
</script>

<style lang="scss">
	.popup-manual-container {
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

	.popup-manual-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 8px 20px;
	}

	.popup-title-text {
		font-size: 15px;
		font-weight: bold;
		color: #484848;
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
		margin: 8px 18px 0px 0px;
		align-items: center;
	}

	.popup-item-icon {
		width: 48px;
		border-radius: 10px;
	}

	.popup-item-icon-text {
		font-size: 12px;
		color: #4C5382;
		padding: 6px 3px;
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
		font-size: 15px;
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
		font-size: 13px;
		color: #4C5382;
		font-weight: bold;
		padding: 3px 3px;
	}

	.popup-item-section-text {
		font-size: 10px;
		font-weight: bold;
		color: #4C5382;
		padding: 3px 0px;
	}

	.popup-input {
		flex: 1;
		max-width: 21px;
		height: 15px;
		font-weight: bold;
		font-size: 11px;
		text-align: center;
		margin: 0px 3px;
		color: #4C5382;
		background-color: #F0F0F0;
		border-radius: 3px;
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