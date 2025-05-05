<template>
	<view class="popup-image-container" :style="popupStyle">
		<view class="popup-image-title">
			<text class="popup-title-text">选择解读方式</text>
			<text class="popup-item-price-text"
				style="flex: 1; color: #A0A0A0; font-size: 12px;">{{isFreeTrial ? '' : ''}}</text>
			<view class="popup-close-btn" @click="closePopup">
				<uni-icons class="close-icon" type="closeempty" size="20" color="#808080" />
			</view>
		</view>
		<view class="popup-title-divider" />
		<view class="popup-item" @click="requestImgAiTips()">
			<view class="popup-item-left">
				<image class="popup-item-icon" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/record/singleimage.png" />
			</view>
			<view class="popup-item-column">
				<view class="popup-item-flex-row">
					<text class="popup-item-text">图片解读：</text>
				</view>
				<view v-if="isFreeTrial">
					<text class="popup-item-free-text">限时免费</text>
					<text class="popup-item-price-text"
						style="text-decoration-line: line-through; color: #A0A0A0;">￥2.9</text>
				</view>
				<view v-else>
					<text class="popup-item-price-text">￥2.9</text>
				</view>
				<text class="popup-item-subtitle">解读图片中的内容，完成后会在「分析结果」中给出。</text>
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
		name: "popupImage",
		mixins: [popup],
		emits: ['confirm', 'close', 'closePopup', 'request', 'pay'],
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
		computed: {
			isFreeTrial() {
				return true;
			},
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
			requestImgAiTips: function() {
				if (this.isFreeTrial) {
					this.$emit('request', this.record.fileUrl);
				} else {
					this.$emit('pay');
				}
				this.close();
			}
		}
	}
</script>

<style lang="scss">
	.popup-image-container {
		display: flex;
		flex-direction: column;
		bottom: 0px;
		padding: 10px 0px;
		background-color: white;
		border-radius: 10px;
		border-bottom-left-radius: 0px;
		border-bottom-right-radius: 0px;
		overflow: hidden;
	}

	.popup-image-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px 20px;
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
		padding: 15px 20px;
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

	.popup-item-free-text {
		font-size: 13px;
		color: #4C5382;
		font-weight: bold;
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