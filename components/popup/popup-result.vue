<template>
	<view class="result-container" :style="popupStyle">
		<view class="result-title">
			<image style="width: 24px; margin-right: 6px;" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/oxygen_b.png" />
			<text>您的心肺耐力为：</text>
		</view>
		<view class="flex-row" style="align-items: center;">
			<view class="result-unit" style="width: 24px;"></view>
			<view class="result-text">{{vo2max}}</view>
			<view class="result-unit">ml/kg/min</view>
		</view>
		<view class="result-desc">心脏年龄约为
			<text style="color: #00CED1; font-weight: bold; font-size: 18px;"> {{heartAge}}</text>，{{state}}
		</view>
		<view class="popup-divider-row" />
		<view class="flex-row" style="align-items: center; width: 100%;">
			<view class="popup-button" @click="closePopup">知道了</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';

	export default {
		props: {
			oxygenData: {
				type: Object
			}
		},
		data: function() {
			return {
				popupStyle: {},
				vo2max: '--',
				heartAge: '--',
				state: ''
			}
		},
		mounted: function() {
			const systemInfo = getApp().globalData.systemInfo;
			const screenWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.popupStyle.width = `${screenWidth * 0.7}px`;
		},
		methods: {
			update: function(vo2max, heartAge, desc) {
				this.vo2max = vo2max;
				this.heartAge = heartAge;
				if (heartAge < store.userInfo.age) {
					this.state = `比实际年龄小 ${store.userInfo.age - heartAge} 岁！`;
				} else if (heartAge - store.userInfo.age > 1) {
					this.state = `可以适当加强锻炼 ~ `;
				} else {
					this.state = `与实际年龄相仿，非常健康！`;
				}
			},
			closePopup: function() {
				this.$emit('closePopup');
			}
		}
	}
</script>

<style>
	.result-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 90px;
		border-radius: 20px;
		background: linear-gradient(180deg, #F8F9FD 0%, #E8EEFB 100%);
	}

	.result-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 18px;
		color: #202020;
		text-align: center;
		margin: 30px 30px 15px 18px;
	}

	.result-text {
		font-size: 60px;
		color: #00CED1;
		text-align: center;
		font-weight: bolder;
	}

	.result-unit {
		font-size: 12px;
		color: #00CED1;
		margin: 30px 6px 0px;
	}

	.result-desc {
		font-size: 14px;
		color: rgba(32, 32, 32, 0.8);
		text-align: center;
		margin: 15px 30px 20px;
	}

	.popup-divider-row {
		width: 100%;
		height: 1px;
		border-top: lightgray 1px solid;
	}

	.popup-button {
		flex: 1;
		font-size: 15px;
		color: white;
		text-align: center;
		font-weight: bold;
		padding: 10px 20px;
		margin: 12px 20px 14px;
		background-color: #00CED1;
		border-radius: 20px;
	}
</style>