<template>
	<view class="charts-box" :style="`${chartType == 'arcbar' ? 'height: 180px;' : ''}`">
		<canvas class="ucharts-canvas" canvas-id="line-chart" />
	</view>
</template>

<script>
	import uCharts from './uchart.js';
	export default {
		name: "chart",
		data() {
			return {
				lineChart: null,
				opt: {},
			}
		},
		props: {
			renderOnMounted: {
				type: Boolean,
				default: false
			},
			chartType: {
				type: String,
				default: 'area'
			},
			dataType: {
				type: String,
				default: 'health'
			},
			color: {
				type: String
			},
			categories: {
				type: Array,
				default: () => ['03-27', '03-28', '03-29', '03-30', '03-31', '04-01', '04-02']
			},
			dataLabel: {
				type: Boolean,
				default: true
			},
			dataPointColor: {
				type: Array
			},
			dataPointShape: {
				type: Boolean,
				default: false
			},
			dataPointShapeType: {
				type: String,
				default: 'hollow'
			},
			xAxis: {
				type: Object,
				default: () => ({
					type: 'grid',
					gridColor: 'transparent',
					gridType: 'dash',
					fontSize: 10,
					itemCount: 7,
				})
			},
			yAxis: {
				type: Object,
				default: () => ({
					type: 'grid',
					gridType: 'dash',
					fontSize: 10,
					splitNumber: 4
				})
			},
			series: {
				type: Array,
				default: () => [{
					color: '#4C5382',
					name: '步数',
					data: [1024, 400, 2004, 5099, 1424, 100],
				}]
			},
			chartWidth: {
				type: Number
			},
			extraColumn: {
				type: Object
			}
		},

		mounted() {
			if (this.renderOnMounted) {
				this.renderChart();
			}
		},
		methods: {
			updateChart(categories = this.categories, series = this.series, dataPointColor = this.dataPointColor) {
				this.opt.categories = categories;
				this.opt.series = series;
				this.lineChart.updateData(this.opt);
			},
			renderChart(categories = this.categories, series = this.series, dataPointColor = this.dataPointColor,
				yAxis = this.yAxis) {
				this.xAxis.itemCount = categories.length;
				this.opt = {
					dataType: this.dataType,
					background: 'transparent',
					color: this.color,
					context: uni.createCanvasContext('line-chart', this),
					canvasId: 'line-chart',
					type: this.chartType,
					legend: {
						show: true,
						position: 'top',
						float: 'right'
					},
					fontSize: 10,
					pixelRatio: 1,
					animation: false,
					categories: categories,
					xAxis: this.xAxis,
					yAxis: yAxis,
					series: series,
					width: this.getChartWidth(),
					height: this.getChartHeight(),
					dataLabel: this.dataLabel,
					dataPointShape: this.dataPointShape,
					dataPointShapeType: this.dataPointShapeType,
					dataPointColor: dataPointColor,
					extra: {
						area: {
							type: 'curve',
							gradient: true,
							addLine: true,
						},
						line: {
							type: 'straight',
						},
						bar: {
							seriesGap: 10,
						},
						ring: {
							labelWidth: 15,
						}
					}
				};
				if (this.extraColumn) {
					this.opt.extra.column = this.extraColumn;
				}
				this.lineChart = new uCharts(this.opt);
				// this.lineChart.draw(ctx)
			},
			getChartHeight() {
				return 240;
			},
			getChartWidth() {
				const info = getApp().globalData.systemInfo;
				return this.chartWidth ? this.chartWidth : (this.chartType == "arcbar" ? 150 : info.windowWidth - 40);
			}
		}
	}
</script>

<style>
	.charts-box {
		width: 100%;
		height: 240px;
	}

	.ucharts-canvas {
		width: 100%;
		height: 100%;
	}
</style>