<template>
	<scroll-view class="chart-scroll" scroll-x="true" @scroll="scroll" scroll-left="120">
		<canvas class="chart-canvas" id="wave-chart" canvas-id="wave-chart" :style="canvasStyle"
			@click="onChartClick" />
	</scroll-view>
	<!-- <view class="scatter-tips" v-if="scatterTips" @click="toPulse">{{scatterTips}}</view> -->
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
		createDate,
		getDateToday,
		onlyTime,
		traversalTime
	} from '@/common/utils/timestamp';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		fetchAFWave,
		fetchECGWave
	} from '@/modules/data/ecgdata';

	const unitX = 128; // 1秒钟的x轴长度
	const maxX = 18000; // 最大x轴长度

	export default {
		data() {
			return {
				scrollLeft: 0,
				old: {
					scrollLeft: 0
				},
				canvasStyle: {
					width: '320px',
					height: '320px'
				},
				chartSize: 320,
				points: [],
				scatterImage: undefined,
				scatterTips: '健康评估中...',
				legendText: '心动波形图',
				report: {}
			}
		},
		props: {
			from: {
				type: String,
				default: ''
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
			},
			fromECG: function() {
				return this.from == "ecg";
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
				this.canvasStyle.width = maxX + 'px';
				this.canvasStyle.height = `${this.chartSize}px`;
			},
			scroll: function(e) {
				this.old.scrollLeft = e.detail.scrollLeft;
			},
			fetchData: function() {
				// 更新数据
				this.points = [];
				const points = this.points;
				const reports = store.getDeviceReports();
				this.report = reports[store.userConfig.reportIndex]
				this.fetchPoints(points);
			},
			fetchPoints: function(points) {
				const waveArray = this.fromECG ? fetchECGWave() : fetchAFWave();
				const length = waveArray.length;
				let start = 0;
				let end = length;
				// start = Math.round(length * 0 / 9);
				// end = Math.round(length * 9 / 9);
				console.log("WaveChart, fetchPoints, start: " + start + ", end: " + end);
				for (let i = start; i < end; i++) {
					const x = i * (this.fromECG ? unitX / 250 : unitX / 128);
					const y = waveArray[i];
					points.push([x, y]);
				}
			},
			drawChart: function() {
				const canvas = uni.createCanvasContext('wave-chart', this);
				this.drawAxis(canvas);
				this.drawLegend(canvas);
				this.drawPoints(canvas);
			},
			drawAxis: function(canvas) {
				const startX = 35;
				const endX = maxX - 20;
				const startY = 40;
				const endY = this.chartSize - 25;
				// 画Y轴刻度
				const yAxisPoints = [{
					y: startY,
					text: '2000'
				}, {
					y: (endY + startY) / 2,
					text: '1000'
				}, {
					y: endY,
					text: '0'
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
				canvas.setTextAlign('center');
				let timestamp = createDate(this.report.startTime).getTime();
				const xAxisMax = Math.ceil(this.points.length / (this.fromECG ? 250 : 128));
				for (let i = 0; i < xAxisMax; i++) {
					const x = startX + i * unitX;
					canvas.setLineDash(i == 0 ? [] : [4, 4]);
					canvas.fillText(onlyTime(timestamp), i == 0 ? x + 20 : x, endY + 15);
					canvas.beginPath();
					canvas.moveTo(x, startY);
					canvas.lineTo(x, endY);
					canvas.closePath();
					canvas.stroke();
					timestamp += 1000;
				}
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

				// 基准坐标
				const points = this.points;
				const offset = 35;
				const offsetY = this.fromECG ? 390 : 0;
				const scaleY = this.fromECG ? 2 : 10;

				// 初始化canvas
				canvas.setLineDash([]);
				canvas.setStrokeStyle('#4C5382');
				canvas.beginPath();
				const x = points[0][0] + offset;
				const y = offsetY + this.chartSize - 40 - points[0][1] / scaleY;
				canvas.moveTo(x, y);

				// 开启循环绘制
				for (let i = 0; i < points.length - 1; i++) {
					const point = points[i];
					const x = point[0] + offset;
					const y = offsetY + this.chartSize - 40 - point[1] / scaleY;
					const nextPoint = points[i + 1];
					const nextX = nextPoint[0] + offset;
					const nextY = offsetY + this.chartSize - 40 - nextPoint[1] / scaleY;
					// 计算控制点
					const controlX1 = x + 2;
					const controlY1 = y;
					const controlX2 = nextX - 2;
					const controlY2 = nextY;
					// canvas.lineTo(nextX, nextY);
					// canvas.quadraticCurveTo(controlX2, controlY2, nextX, nextY);
					canvas.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, nextX, nextY);
				}


				canvas.stroke();
				// canvas.fill();
				canvas.draw(false, res => {
					// this.saveToImage();
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
					canvasId: 'wave-chart',
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
			onChartClick: function() {
				// 图标点击事件
			}
		}
	}
</script>

<style>
	.chart-scroll {
		white-space: nowrap;
		width: 100%;
	}

	.chart-canvas {}

	.scatter-tips {
		line-height: 20px;
		font-size: 11px;
		color: #808080;
		margin: 6px 20px 15px;
	}
</style>