<template>
	<view class="report-pdf">
		<view class="report-header">
			<view class="report-header-line">
				<view class="report-from">心脉AI</view>
				<view class="report-title">健康解读</view>
				<view class="report-title-en">HEALTH RECOMMENDATIONS</view>
				<view class="report-username">{{username}}</view>
				<view class="report-record-id">报告ID</view>
				<view class="report-record-id-text">{{baseId}}</view>
			</view>
			<view class="report-divider" />
		</view>
		<view class="report-content">
			<text class="report-content-title">健 康 解 读</text>
			<text class="report-content-title-en">HEALTH RECOMMENDATIONS</text>
			<view v-if="fileUrl" class="report-content-image-container" @click="previewImage">
				<image class="report-content-image" :src="fileUrl" mode="heightFix" />
			</view>
			<view v-else-if="isHealthReport" style="display: flex; flex-direction: column;">
				<pulse-trend style="margin: 10px -30px -20px" :reportIndex="reportIndex" from="smartPdf" />
				<pulse-dist style="margin: 0px 20px 0px -10px" :reportIndex="reportIndex" from="smartPdf" />
				<view style="margin: -10px 0px 30px -10px;">
					<scatter-chart class="scatter-container" ref="scatterchart" :report-index="reportIndex"
						from="smartPdf" />
				</view>
			</view>
			<view v-else style="height: 60px;" />
			<view class="report-content-userinfo">
				<view class="report-content-username">{{username}}</view>
				<view class="report-content-rid">项目号：{{baseId.substr(0, 10)}}</view>
			</view>
			<view class="report-divider" />
			<view class="report-content-item">
				<view class="report-content-item-left">
					<text class="report-content-item-label">联系电话：</text>
					<text class="report-content-item-text">{{mobile}}</text>
				</view>
				<view class="report-content-item-right">
					<text class="report-content-item-label">项目简称：</text>
					<text class="report-content-item-text">心脉AI</text>
				</view>
			</view>
			<view class="report-content-item">
				<view class="report-content-item-left">
					<text class="report-content-item-label">身份证号：</text>
					<text class="report-content-item-text"></text>
				</view>
			</view>
			<view class="report-divider-dotted" />
			<view class="report-content-item">
				<view class="report-content-item-left">
					<text class="report-content-item-label">递送地址：</text>
				</view>
			</view>
			<view class="report-content-item">
				<view class="report-content-item-left">
					<text class="report-content-item-label">递送方式：</text>
					<text class="report-content-item-text">电子报告</text>
				</view>
				<view class="report-content-item-right">
					<text class="report-content-item-label">编号：</text>
					<text class="report-content-item-text">{{baseId.substr(10, 14)}}</text>
				</view>
			</view>
			<view class="report-divider-dotted" />
			<view v-if="report" class="report-item-column">
				<view class="report-item-row">
					<text class="report-item-label">监测日期：</text>
					<text class="report-item-text">{{report.StartTime}}</text>
				</view>
				<view class="report-item-row" style="align-items: baseline;">
					<text class="report-item-label">休息时间：</text>
					<text class="report-item-text">{{report.MedicineSleepQuality.AsleepTime}}
						至 {{report.MedicineSleepQuality.WakeTime}}</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">平均心率：</text>
					<text class="report-item-text">{{heartRate}} 次/分钟</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">最小心率：</text>
					<text class="report-item-text">{{minRate}} 次/分钟</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">最大心率：</text>
					<text class="report-item-text">{{maxRate}} 次/分钟</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">睡眠时长：</text>
					<text class="report-item-text">{{sleepTime}}</text>
				</view>
				<view v-if="awakeningTimes" class="report-item-row">
					<text class="report-item-text" style="color: white;">醒来次数：</text>
					<text class="report-item-text" style="color: white;">{{awakeningTimes}} 次</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">深度睡眠：</text>
					<text class="report-item-text">{{deepSleep}}</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">浅度睡眠：</text>
					<text class="report-item-text">{{lightSleep}}</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">核心睡眠：</text>
					<text class="report-item-text">{{remSleep}}</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">呼吸频率：</text>
					<text class="report-item-text">{{Math.round(report.MedicineSleepQuality.BreathingRate)}} 次/分钟</text>
				</view>
				<view class="report-item-row">
					<text class="report-item-label">呼吸事件：</text>
					<text class="report-item-text">{{report.OSAHS.SBDNumbersPerHour}} 次/小时</text>
				</view>
				<view class="report-divider-dotted" />
			</view>
			<view class="report-content-text">
				<uaMarkDown :source="tipText" :outerStyle="`font-size: 13px; color: #484848; line-height: 20px;`"
					:showLine="false" />
			</view>
		</view>
		<view class="report-footer">
			<view class="report-divider" />
			<view class="report-content-bottom-text">
				<view class="report-content-bottom-text-left">北京和美健康科技有限责任公司「心脉AI」</view>
				<view class="report-content-bottom-text-right">生成日期：{{reportDate}}</view>
			</view>
			<view class="report-footer-bottom">
				<view class="report-footer-logo-container">
					<image class="report-footer-logo" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/chat_nav_logo.png" />
				</view>
				<view class="report-footer-text-content">
					心脉AI是您的家庭心血管健康助手，提供了基于私域大模型的智能问答服务，能够实时与AI医生对话并生成总结，提供针对个人健康资料的健康风险提醒与预警，和个体定制的健康可视化服务，随时呵护您和家人的心血管健康。
				</view>
				<view class="report-footer-qrcode-container">
					<image class="report-footer-qrcode" mode="heightFix"
						src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/static/chat/xinmai_qrcode.png" />
					<view class="report-footer-qrcode-text">微信扫一扫</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		tipContent
	} from '@/common/js/record';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import uaMarkDown from '@/components/ua-markdown/ua-markdown.vue';
	import pulseTrend from '@/components/smartchart/pulsetrend.vue';
	import pulseDist from '@/components/smartchart/pulsedist.vue';
	import scatterChart from '@/components/smartchart/scatterchart.vue';
	import {
		averageRate,
		fetchMaxRate,
		fetchMinRate
	} from '@/common/js/monitor';
	import {
		getDateToday
	} from '@/common/utils/timestamp';
	// import wxml2canvas from 'wxml2canvas';
	export default {
		data() {
			return {
				report: undefined,
				reportImg: ''
			}
		},
		props: {
			baseId: {
				type: String,
				default: ''
			},
			fileUrl: {
				type: String
			},
			reportIndex: {
				type: Number
			},
			reportTips: {
				type: String,
				default: ''
			},
			isExpert: {
				type: Boolean,
				default: false
			},
			reportTime: {
				type: String
			},
			from: {
				type: String,
				default: ''
			}
		},
		components: {
			pulseTrend,
			pulseDist,
			scatterChart,
			uaMarkDown
		},
		computed: {
			isHealthReport() {
				return this.from == 'healthReport';
			},
			username() {
				return store.userInfo.nickname;
			},
			mobile() {
				return store.userInfo.mobile;
			},
			reportDate() {
				return this.reportTime ? this.reportTime : getDateToday();
			},
			heartRate() {
				return averageRate(this.report);
			},
			maxRate() {
				return fetchMaxRate(this.report);
			},
			minRate() {
				return fetchMinRate(this.report);
			},
			sleepTime() {
				const seconds = this.report.MedicineSleepQuality.TotalSleepTime;
				const hours = Math.floor(seconds / 3600);
				const minutes = ((seconds - hours * 3600) / 60).toFixed(0);
				return `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟`;
			},
			awakeningTimes() {
				const times = this.report.MedicineSleepQuality.AwakeningTimes;
				return times;
			},
			deepSleep() {
				const quality = this.report.MedicineSleepQuality;
				const deepSeconds = quality.DeepSleepRate * quality.TotalSleepTime;
				const hours = Math.floor(deepSeconds / 3600);
				const minutes = ((deepSeconds - hours * 3600) / 60).toFixed(0);
				const score = Math.min(20, Math.max(0, 10 + (quality.DeepSleepRate - 0.3) * 100));
				const scoreText = score > 10 ? '不错' : (score > 5 ? '一般' : '较差');
				return `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟(${scoreText})`;
			},
			lightSleep() {
				const quality = this.report.MedicineSleepQuality;
				const lightSeconds = quality.LightSleepRate * quality.TotalSleepTime;
				const hours = Math.floor(lightSeconds / 3600);
				const minutes = ((lightSeconds - hours * 3600) / 60).toFixed(0);
				return `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟`;
			},
			remSleep() {
				const quality = this.report.MedicineSleepQuality;
				const remSeconds = quality.REMRate * quality.TotalSleepTime;
				const hours = Math.floor(remSeconds / 3600);
				const minutes = ((remSeconds - hours * 3600) / 60).toFixed(0);
				return `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟`;
			},
			tipText() {
				return tipContent(this.reportTips);
			}
		},
		mounted: function() {
			this.initReport();
		},
		methods: {
			initReport() {
				if (this.report || !this.isHealthReport) {
					// 报告初始化完成
					return;
				}
				const index = this.reportIndex ? this.reportIndex : store.userConfig.reportIndex;
				const reports = store.getDeviceReports();
				this.report = reports[index].businessData;
			},
			previewImage: function() {
				uni.previewImage({
					urls: [this.fileUrl]
				});
			},
			drawCanvas: function(width, height) {
				// const wxmlToCanvas = new wxml2canvas({
				// 	width: width,
				// 	height: height,
				// 	element: 'report-canvas',
				// 	process(percent) {
				// 		console.log("Report, wxml2canvas processing, percent: ", percent);
				// 	},
				// 	finish(url) {
				// 		console.log("Report, finish, url: ", url);
				// 		this.reportImg = url;

				// 		const canvas = uni.createSelectorQuery().in(this).select('.report-canvas');
				// 		console.log("Report, canvas = ", canvas);
				// 		const base64String = canvas.toDataURL('image/png');
				// 		uniCloud.callFunction({
				// 			name: 'reportpdf',
				// 			data: {
				// 				data: {
				// 					base64String: base64String,
				// 					baseId: this.baseId
				// 				}
				// 			},
				// 			success(res) {
				// 				console.log("Report, upload pdf success, res: ", res);
				// 			},
				// 			error(err) {
				// 				console.log("Report, upload pdf error, err: ", err);
				// 			}
				// 		});
				// 	},
				// 	error(err) {
				// 		console.log("Report, wxml2canvas error, err: ", err);
				// 	}
				// });
				// wxmlToCanvas.draw({
				// 	list: [{
				// 		type: 'wxml',
				// 		x: 0,
				// 		y: 0
				// 	}]
				// });
			},
			generatePDF() {
				const node = uni.createSelectorQuery().in(this).select('.report-pdf');
				node.boundingClientRect().exec((rect) => {
					const {
						width,
						height
					} = rect[0];
					this.canvasWidth = width;
					this.canvasHeight = height;
					this.drawCanvas(width, height);
				});
				// const element = this.$refs.reportpdf;
				// // 使用html2canvas将DOM元素转换为canvas
				// const canvas = await html2canvas(element);
				// // 将canvas转换为图片，并添加到pdf中
				// const imgData = canvas.toDataURL('image/png');
				// console.log("Report, imgData: ", imgData);
				// // 新建一个jspdf实例，设置方向和单位
				// const pdf = new jsPDF('p', 'mm', 'a4');
				// const imgProps = pdf.getImageProperties(imgData);
				// const pdfWidth = pdf.internal.pageSize.getWidth();
				// const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
				// pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
				// // 保存生成的PDF
				// pdf.save('download.pdf');
			}
		}
	}
</script>

<style>
	.report-pdf {
		display: flex;
		flex-direction: column;
	}

	.report-header {
		display: flex;
		flex-direction: column;
	}

	.report-header-line {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 30px;
	}

	.report-from {
		font-size: 7px;
		font-weight: bold;
		color: #4C5382;
		margin-right: 10px;
	}

	.report-title {
		font-size: 6px;
		color: #2B2D33;
		margin-right: 3px;
	}

	.report-title-en {
		font-size: 5px;
		color: #8A8E99;
		margin-right: 5px;
	}

	.report-username {
		font-size: 6px;
		color: #2B2D33;
		margin: 0px 5px;
	}

	.report-record-id {
		font-size: 6px;
		color: #2B2D33;
		margin-left: 5px;
		margin-right: 3px;
	}

	.report-record-id-text {
		flex: 1;
		font-size: 5px;
		color: #8A8E99;
		text-align: right;
	}

	.report-divider-text {
		font-size: 5px;
		color: #BEBEBE;
	}

	.report-content {
		display: flex;
		flex-direction: column;
		margin: 20px 20px;
		margin-bottom: 80px;
	}

	.report-content-title {
		position: relative;
		align-self: center;
		font-size: 28px;
		font-weight: bold;
		color: #2B2D33;
		margin: 10px 0px;
	}

	.report-content-title-en {
		position: relative;
		align-self: center;
		font-size: 10px;
		color: #8A8E99;
	}

	.report-content-image-container {
		margin: 20px 30px 15px 30px;
	}

	.report-content-image {
		height: 180px;
	}

	.report-content-userinfo {
		display: flex;
		flex-direction: row;
		justify-content: start;
		align-items: center;
		margin: 0px 30px 0px 30px;
	}

	.report-content-username {
		font-size: 13px;
		font-weight: bold;
		color: #2B2D33;
	}

	.report-content-rid {
		flex: 1;
		position: relative;
		font-size: 10px;
		text-align: right;
		color: #8A8E99;
	}

	.report-content-text {
		display: flex;
		flex-direction: column;
		margin: 10px 30px;
		padding: 20px 0px 30px;
		white-space: pre-wrap;
	}

	.report-item-column {
		display: flex;
		flex-direction: column;
	}

	.report-item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 30px;
	}

	.report-item-label {
		flex: 1;
		font-size: 10px;
		color: #8A8E99;
		text-align: start;
		line-height: 24px;
	}

	.report-item-text {
		flex: 1;
		font-size: 11px;
		color: #2B2D33;
		text-align: end;
		line-height: 24px;
	}

	.report-content-text-result {
		font-size: 13px;
		color: #484848;
		line-height: 20px;
		/* text-indent: 15px; */
		margin: 20px 0px 30px;
	}

	.report-divider {
		background-color: #B8BDCC;
		height: 1px;
		margin: 5px 30px;
	}

	.report-divider-dotted {
		border-top: 1px dashed #B8BDCC;
		margin: 5px 30px;
	}

	.report-content-item {
		display: flex;
		flex-direction: row;
		margin: 0px 30px;
	}

	.report-content-item-left {
		flex: 1;
		display: flex;
		flex-direction: row;
		height: 20px;
		align-items: center;
	}

	.report-content-item-right {
		flex: 1;
		display: flex;
		flex-direction: row;
		height: 20px;
		align-items: center;
	}

	.report-content-item-label {
		font-size: 10px;
		color: #8A8E99;
		text-align: center;
	}

	.report-content-item-text {
		font-size: 11px;
		color: #2B2D33;
		text-align: center;
	}

	.report-content-bottom-text {
		display: flex;
		flex-direction: row;
		justify-content: start;
		margin: 0px 30px;
	}

	.report-content-bottom-text-left {
		font-size: 8px;
		color: #8A8E99;
	}

	.report-content-bottom-text-right {
		flex: 1;
		position: relative;
		font-size: 8px;
		text-align: right;
		color: #8A8E99;
	}

	.report-footer {
		display: flex;
		flex-direction: column;
		position: fixed;
		padding-top: 10px;
		padding-bottom: 20px;
		bottom: 0px;
		background-color: white;
	}

	.report-footer-bottom {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 2px 30px 0px;
	}

	.report-footer-logo-container {
		height: 30px;
	}

	.report-footer-logo {
		height: 30px;
	}

	.report-footer-text-content {
		height: 30px;
		max-height: 30px;
		overflow: hidden;
		font-size: 5px;
		color: #8A8E99;
		margin: 0px 5px 0px 10px;
	}

	.report-footer-qrcode-container {
		display: flex;
		flex-direction: column;
	}

	.report-footer-qrcode {
		height: 27px;
	}

	.report-footer-qrcode-text {
		font-size: 5px;
		color: #8A8E99;
	}
</style>