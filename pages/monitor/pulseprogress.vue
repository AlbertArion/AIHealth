<template>
	<view class="monitor-progress-container progress-bg">
		<view class="rem-progress" :style="`flex: ${remWidth}; height: ${progressHeight}px;`">
			<text class="progress-text">{{pulseData.pulse}} bpm</text>
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
				progressHeight: 15
			}
		},
		props: {
			size: {
				type: Number,
				default: 15
			},
			pulseData: {
				type: Object
			}
		},
		computed: {
			remWidth() {
				return Math.min(this.pulseData.pulse / 100, 1) * this.progressWidth;
			},
			emptyWidth() {
				return this.progressWidth - this.remWidth;
			}
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const screenWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.progressWidth = Math.max(screenWidth - 210, 150);
			this.progressHeight = this.size;
		},
		methods: {},
	}
</script>

<style>
	.progress-bg {
		display: flex;
		flex-direction: row;
		align-items: center;
		background-color: #EBEBEB;
	}

	.rem-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #AA3311;
	}

	.progress-text {
		color: white;
		line-height: 15px;
		font-size: 8px;
	}
</style>