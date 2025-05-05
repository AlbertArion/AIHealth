<template>
	<view class="monitor-progress-container progress-bg">
		<view class="rem-progress" :style="`width: ${remWidth}px;`">
			<text class="progress-text">{{oxygenData.oxygen}} mL</text>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	let progressWidth = 114; // 最大摄氧量文字比其他长：114 = 150 - 36
	const minWidth = 40;
	export default {
		data() {
			return {}
		},
		props: {
			oxygenData: {
				type: Object
			}
		},
		computed: {
			remWidth() {
				const maxOxygen = (store.userInfo.gender == 2 ? 44 : 50) * 1.5;
				const width = Math.min(this.oxygenData.oxygen / maxOxygen, 1) * progressWidth;
				return Math.max(width, minWidth);
			}
		},
		mounted() {
			console.log('OxygenProgress, mounted: oxygenData = ', this.oxygenData);
			const systemInfo = getApp().globalData.systemInfo;
			const screenWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			progressWidth = Math.max(screenWidth - 246 /* 210 - 36 */ , 114);
		},
		methods: {},
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
		height: 15px;
		background-color: #00CED1;
	}

	.progress-text {
		color: white;
		line-height: 20px;
		font-size: 8px;
		margin-right: 10px;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>