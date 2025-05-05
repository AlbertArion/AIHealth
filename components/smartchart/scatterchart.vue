<template>
	<view>
		<canvas class="chart-canvas" id="scatter-chart" canvas-id="scatter-chart" :style="canvasStyle"
			@click="onChartClick" />
		<!-- <view class="scatter-tips" v-if="scatterTips" @click="toPulse">{{scatterTips}}</view> -->
	</view>
</template>

<script>
	import {
		promptScatter
	} from '@/modules/data/deviceInput';
	import {
		localImgAiTips,
		tipContent
	} from '@/common/js/record';
	import {
		getDateToday
	} from '@/common/utils/timestamp';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		fetchAFRRIs
	} from '@/modules/data/ecgdata';
	export default {
		data() {
			return {
				points: [],
				canvasStyle: {
					width: '320px',
					height: '320px'
				},
				chartSize: 320,
				scatterImage: undefined,
				scatterTips: '健康评估中...',
				legendText: '心率散点图',
				showAF: false
			}
		},
		props: {
			from: {
				type: String,
				default: ''
			},
			report: {
				type: Object
			},
			reportIndex: {
				type: Number,
				default: -1
			}
		},
		computed: {
			fromAdmin: function() {
				return this.from == "admin";
			},
			fromPdf: function() {
				return this.from == "smartPdf";
			},
			fromMonitor: function() {
				return this.from == "healthMonitor"
			}
		},
		mounted() {
			this.initStyle();
			this.fetchData();
			this.drawChart();
		},
		methods: {
			initStyle: function() {
				// 初始化样式
				const systemInfo = getApp().globalData.systemInfo;
				this.chartSize = systemInfo.screenWidth - 40;
				this.canvasStyle.width = `${this.chartSize}px`;
				this.canvasStyle.height = `${this.chartSize}px`;
			},
			fetchData: function() {
				// 更新数据
				this.points = [];
				const points = this.points;
				const reports = store.getDeviceReports();
				if (this.report) {
					this.fetchPoints(this.report, points);
				} else if (this.reportIndex > -1) {
					const item = reports[this.reportIndex];
					this.fetchPoints(item, points);
				} else {
					const today = getDateToday();
					for (let i = 0; i < reports.length; i++) {
						const item = reports[i];
						if (item.endTime.slice(0, 10) != today) {
							break;
						}
						this.fetchPoints(item, points);
					}
				}
			},
			fetchPoints: function(item, points) {
				const itemRRIs = this.showAF ? fetchAFRRIs() : item.businessData.RRIs;
				if (itemRRIs) {
					for (let i = 0; i < itemRRIs.length - 1; i++) {
						const c = itemRRIs[i];
						const n = itemRRIs[i + 1];
						points.push({
							value: [c, n]
						});
					}
				} else {
					const itemHRVs = item.businessData.HeartRateVariability;
					const heartRates = itemHRVs.ScatterRates ? itemHRVs.ScatterRates : itemHRVs.HeartbeatRates;
					for (let i = 0; i < heartRates.length - 1; i++) {
						const c = heartRates[i];
						const n = heartRates[i + 1];
						if (c != 0 && n != 0) {
							const x = Math.round(60000 / c);
							const y = Math.round(60000 / n);
							points.push({
								value: [x, y]
							});
						}
					}
				}
			},
			drawChart: function() {
				const canvas = uni.createCanvasContext('scatter-chart', this);
				this.drawAxis(canvas);
				this.drawLegend(canvas);
				this.drawPoints(canvas);
			},
			drawAxis: function(canvas) {
				const startX = 45;
				const endX = this.chartSize - 20;
				const startY = 40;
				const endY = this.chartSize - 25;
				// 画Y轴刻度
				const yAxisPoints = [{
					y: startY,
					text: '1600'
				}, {
					y: (endY + startY) / 2,
					text: '800'
				}, {
					y: endY,
					text: 'RRn+1'
				}];
				canvas.setLineWidth(1);
				canvas.setLineCap('butt');
				canvas.setFontSize(10);
				canvas.setTextAlign('right');
				canvas.setFillStyle('#666666');
				canvas.setStrokeStyle('#cccccc');
				yAxisPoints.forEach((item, index) => {
					if (index == yAxisPoints.length - 1) {
						canvas.setLineDash([]);
						canvas.fillText(item.text, startX - 5, item.y - 3);
					} else {
						canvas.setLineDash([4, 4]);
						canvas.fillText(item.text, startX - 5, item.y + 2);
					}
					canvas.beginPath();
					canvas.moveTo(startX, item.y);
					canvas.lineTo(endX, item.y);
					canvas.closePath();
					canvas.stroke();
				});
				//画X轴刻度
				const xAxisPoints = [{
					x: startX,
					text: 'RRn(ms)'
				}, {
					x: (endX + startX) / 2,
					text: '800'
				}, {
					x: endX,
					text: '1600'
				}];
				canvas.setTextAlign('center');
				xAxisPoints.forEach((item, index) => {
					if (index == 0) {
						canvas.setLineDash([]);
						canvas.fillText(item.text, item.x + 20, endY + 15);
					} else {
						canvas.setLineDash([4, 4]);
						canvas.fillText(item.text, item.x, endY + 15);
					}
					canvas.beginPath();
					canvas.moveTo(item.x, startY);
					canvas.lineTo(item.x, endY);
					canvas.closePath();
					canvas.stroke();
				});
			},
			drawLegend: function(canvas) {
				// 绘制图例
				if (this.fromAdmin) {
					// 全部报告管理员页不绘制legendText
				} else {
					canvas.setFontSize(10);
					canvas.setTextAlign('right');
					canvas.setFillStyle('#666666');
					canvas.fillText(this.legendText, this.chartSize - 10, 30);
				}
			},
			drawPoints: function(canvas) {
				// 绘制散点图
				const points = this.points;
				const scale = this.showAF ? 25 : (1600 / this.chartSize);
				const offset = 100 - (this.chartSize - 320) * 2;
				canvas.setFillStyle('#4C5382');
				if (this.showAF || !this.fromAdmin) {
					for (let i = 0; i < points.length; i++) {
						const point = points[i];
						canvas.beginPath();
						const x = this.showAF ? (150 + (point.value[0] - offset) / scale) : (20 + (point.value[0] -
							offset) / scale);
						const y = this.showAF ? (-130 + this.chartSize - (point.value[1] - offset) / scale) : (10 +
							this.chartSize - (point.value[1] - offset) / scale);
						canvas.arc(x, y, 1, 0, 2 * Math.PI);
						canvas.closePath();
						canvas.fill();
					}
				} else {
					for (let i = 0; i < points.length; i++) {
						const point = points[i];
						canvas.beginPath();
						const x = (point.value[0] + offset + 5) / scale;
						const y = this.chartSize - point.value[1] / scale;
						canvas.arc(x, y, 1, 0, 2 * Math.PI);
						canvas.closePath();
						canvas.fill();
					}
				}
				canvas.draw(false, res => {
					// this.saveToImage();
				});
			},
			saveFile: function(filePath) {
				uni.saveFile({
					tempFilePath: filePath,
					success: res => {
						this.scatterImage = res.savedFilePath;
						console.log("ScatterChart, saveFile success: ", res);
						if (store.userConfig.dailyReport.scatterTips) {
							this.scatterTips = store.userConfig.dailyReport.scatterTips;
						} else {
							const cloudPath = '/upload/health/scatterChart/' + Date.now() + '.jpg';
							const prompt = promptScatter;
							localImgAiTips(this.scatterImage, cloudPath, prompt, res => {
								if (res.data.data) {
									this.scatterTips = tipContent(res.data.data, '健康状况：');
									store.userConfig.dailyReport.scatterTips = this.scatterTips;
								} else {
									console.log("ScatterChart, localImgAiTips failed: ", res);
								}
							});
						}
					}
				});
			},
			saveToImage: function() {
				const that = this;
				uni.canvasToTempFilePath({
					x: 0,
					y: 0,
					width: this.canvasStyle.width,
					height: this.canvasStyle.height,
					quality: 1,
					canvasId: 'scatter-chart',
					success: res => {
						// 在H5平台下，tempFilePath 为 base64
						const src = res.tempFilePath;
						that.saveFile(src);
						console.log("ScatterChart, canvasToTempFilePath success: ", res);
					},
					fail: err => {
						console.error("ScatterChart, canvasToTempFilePath failed: ", err);
					}
				}, this);
			},
			onChartClick: function() {
				if (this.fromAdmin) {
					this.$emit('onChartClick');
				} else if (this.scatterImage) {
					uni.previewImage({
						urls: [this.scatterImage]
					});
				} else if (this.fromMonitor) {
					this.toPulse();
				}
			},
			toPulse: function() {
				if (this.from == "healthMonitor") {
					uni.navigateTo({
						url: '/pages/monitor/pulsemonitor'
					});
				}
			}
		}
	}
</script>

<style>
	.chart-canvas {}

	.scatter-tips {
		line-height: 20px;
		font-size: 11px;
		color: #808080;
		margin: 6px 20px 15px;
	}
</style>