<template>
	<view class="guidance-root">
		<view class="guidance-title">
			<text class="guidance-h1">「心肺+睡眠监测仪」使用说明</text>
		</view>
		<view class="guidance-row">
			<view class="guidance-p1">
				<text class="guidance-h2">1. 硬件使用</text>
			</view>
			<view class="guidance-column" style="align-items: center;" @click="previewImage(guidanceUrl)">
				<image style="width: 90px; margin-top: 3px;" mode="widthFix" :src="guidanceUrl" />
				<view>
					<text class="guidance-tips">安装示意图</text>
				</view>
			</view>
		</view>
		<view class="guidance-column guidance-column-border" style="border-bottom: 1px dashed cadetblue;">
			<text class="guidance-text">① 将设备主机盒（白色盒子）通电；</text>
			<text class="guidance-text">② 可通过微信搜索「心脉AI」小程序对设备进行WIFI连接（配置成功后设备灯为蓝色）；</text>
			<text class="guidance-text">③ 将长条传感器连接到主机盒上，然后将传感器铺到褥子下方，正对人躺床上时的心脏位置（注意传感器上的“此面朝上”）。</text>
		</view>
		<view class="guidance-row">
			<view class="guidance-p1">
				<text class="guidance-h2">2. 设备绑定</text>
			</view>
			<view class="guidance-column" style="align-items: center;" @click="previewImage(qrCodeUrl)">
				<image style="width: 90px;" mode="widthFix" :src="qrCodeUrl" />
				<view>
					<text class="guidance-tips">心脉AI二维码</text>
				</view>
			</view>
		</view>
		<view class="guidance-column guidance-column-border" style="border-bottom: 1px dashed cadetblue;">
			<text class="guidance-text">① 微信中搜索「心脉AI」小程序，第一次需要授权小程序获取手机号；</text>
			<text class="guidance-text">② 打开手机蓝牙，在小程序“智能设备-绑定设备”里会自动搜索附近的设备；</text>
			<text class="guidance-text">③ 连接设备后会自动找到当前手机连接的WIFI，输入密码后自动配置智能监测仪连接WIFI；</text>
			<text class="guidance-text">④ 耐心等待，等设备指示灯橙黄色变为蓝色时，表明WIFI配置成功；</text>
			<text class="guidance-text">⑤ 在小程序的“健康”页面，点击同步数据，会将智能监测仪的数据与小程序联通，点击查看每日的健康数据与AI报告解读。</text>
		</view>
		<view class="guidance-row">
			<view class="guidance-p1">
				<text class="guidance-h2">3. 用户手册</text>
			</view>
		</view>
		<view class="guidance-column guidance-column-border" style="border-bottom: 1px dashed cadetblue;">
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_1.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_2.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_3.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_4.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_5.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_6.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_7.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_8.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/manual_page_9.png" />
		</view>
		<view class="guidance-row">
			<view class="guidance-p1">
				<text class="guidance-h2">4. 售后服务</text>
			</view>
		</view>
		<view class="guidance-column guidance-column-border guidance-bottom-border">
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/directions_page_1.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/directions_page_2.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/directions_page_3.png" />
			<image :style="imageStyle" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/directions_page_4.png" />
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imageStyle: {}
			}
		},
		computed: {
			guidanceUrl() {
				return 'https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/gudiance.jpg';
			},
			qrCodeUrl() {
				return 'https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/xinmai_qrcode.png';
			}
		},
		mounted() {
			const systemInfo = getApp().globalData.systemInfo;
			console.log("Guidance, systemInfo: ", systemInfo);
			this.imageStyle.width = `${systemInfo.windowWidth - 62}px`;
		},
		methods: {
			previewImage: function(url) {
				uni.previewImage({
					urls: [url]
				});
			}
		}
	}
</script>

<style>
	.guidance-root {
		display: flex;
		flex-direction: column;
	}

	.guidance-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 15px 20px;
		margin: 10px 20px 0px;
		background: linear-gradient(135deg, #4C5382 0%, cadetblue 100%);
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
	}

	.guidance-h1 {
		font-size: 16px;
		color: white;
	}

	.guidance-p1 {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.guidance-h2 {
		font-size: 14px;
		color: #4C5382;
	}

	.guidance-row {
		display: flex;
		flex-direction: row;
		padding: 20px 10px 10px;
		margin: 0px 20px;
		border-left: 1px solid cadetblue;
		border-right: 1px solid cadetblue;
	}

	.guidance-column {
		display: flex;
		flex-direction: column;
	}

	.guidance-column-border {
		margin: 0px 20px;
		padding: 0px 10px 20px;
		border-left: 1px solid cadetblue;
		border-right: 1px solid cadetblue;
	}

	.guidance-bottom-border {
		border-bottom: 1px solid cadetblue;
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		margin-bottom: 20px;
	}

	.guidance-tips {
		font-size: 11px;
		color: #A0A0A0;
		line-height: 24px;
	}

	.guidance-text {
		font-size: 13px;
		color: #808080;
		line-height: 24px;
		margin-left: 12px;
	}

	.solid-divider {
		height: 1px;
		border-top: #F0F0F0 1px solid;
	}
</style>