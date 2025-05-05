<template>
	<view class="monitor-progress-container progress-bg">
		<view class="rem-progress" :style="`flex: ${remWidth}; height: ${progressHeight}px;`">
			<text class="progress-text">Rem</text>
		</view>
		<view class="deep-progress" :style="`flex: ${deepWidth}; height: ${progressHeight}px;`">
			<text class="progress-text">Deep</text>
		</view>
		<view class="light-progress" :style="`flex: ${lightWidth}; height: ${progressHeight}px;`">
			<text class="progress-text">Light</text>
		</view>
		<view :style="`flex: ${emptyWidth};`" />
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	export default {
		data() {
			return {
				progressWidth: 150,
				progressHeight: 15,
				effectiveWidth: 150,
				restWidth: 0,
				minWidth: 24
			}
		},
		props: {
			size: {
				type: Number,
				default: 15
			},
			sleepQuality: {
				type: Object
			}
		},
		computed: {
			remDuration() {
				return this.duration(this.sleepQuality.remRate);
			},
			deepDuration() {
				return this.duration(this.sleepQuality.deepSleepRate);
			},
			lightDuration() {
				return this.duration(this.sleepQuality.lightSleepRate);
			},
			remWidth() {
				return Math.max(this.sleepQuality.remRate * this.effectiveWidth, this.minWidth);
			},
			deepWidth() {
				return Math.max(this.sleepQuality.deepSleepRate * this.effectiveWidth, this.minWidth);
			},
			lightWidth() {
				return Math.max(this.sleepQuality.lightSleepRate * this.effectiveWidth, this.minWidth);
			},
			emptyWidth() {
				return this.sleepQuality.awakeningRate * this.effectiveWidth + this.restWidth;
			}
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const screenWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.progressWidth = Math.max(screenWidth - 210, 150);
			this.progressHeight = this.size;
			this.effectiveWidth = this.progressWidth * Math.min(this.sleepQuality.effectiveTime / 28800, 1);
			this.restWidth = this.progressWidth - this.effectiveWidth;
		},
		methods: {
			duration: function(rate) {
				const seconds = rate * this.sleepQuality.effectiveTime;
				const hours = Math.floor(seconds / 3600);
				const minutes = ((seconds - hours * 3600) / 60).toFixed(0);
				return `${hours > 0 ? hours + 'h ' : minutes + 'min'}`;
			}
		}
	}
</script>

<style>
	.progress-bg {
		display: flex;
		flex-direction: row;
		background-color: #EBEBEB;
	}

	.rem-progress {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		background-color: rgba(89, 75, 117, 1);
	}

	.deep-progress {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		background-color: rgba(89, 75, 117, 0.7);
	}

	.light-progress {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		background-color: rgba(89, 75, 117, 0.4);
	}

	.progress-text {
		color: white;
		font-size: 8px;
		margin-right: 3px;
	}

	.duration-container {
		margin: 10px 10px;
	}

	.duration-text {
		color: #5A5A5A;
		line-height: 20px;
		font-size: 8px;
		margin-right: 3px;
	}
</style>