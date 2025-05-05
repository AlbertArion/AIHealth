<template>
	<view class="popup-image-container" :style="popupStyle" @click="toDevice">
		<image class="popup-image" mode="widthFix" :src="randomUrl" :style="popupStyle" />
	</view>
</template>
<script>
	import popup from '@/uni_modules/uni-popup/components/uni-popup/popup.js';

	export default {
		name: "popupPoster",
		mixins: [popup],
		emits: ['confirm', 'close', 'closePopup', 'request', 'pay'],
		data() {
			return {
				popupStyle: {}
			}
		},
		computed: {
			randomUrl() {
				const urls = [
					'https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/xinmai_poster_h_c.jpg',
					'https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/xinmai_poster_h_r.jpg',
					'https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/xinmai_poster_s_c.jpg',
					'https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/intro/xinmai_poster_s_c.jpg'
				];
				return urls[Math.floor(Math.random() * urls.length)];
			}
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			const screenWidth = systemInfo.windowWidth; // 注意：这里可能是窗口宽度，如果需要全屏宽度请使用 screenWidth
			this.popupStyle.width = `${screenWidth * 0.8}px`;
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
			toDevice() {
				this.close();
				uni.switchTab({
					url: '/pages/device/device'
				});
			}
		}
	}
</script>

<style lang="scss">
	.popup-image-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: 10px;
		overflow: hidden;
		margin-top: 36px;
	}

	.popup-image {}
</style>