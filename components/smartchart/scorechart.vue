<template>
	<view class="monitor-container">
		<view class="monitor-chart-container shadow">
			<chart ref="chart" dataType="score" :dataPointShape="true" dataPointShapeType="solid" :yAxis="yAxis"
				:series="scoreSeries" chartType="line" color="#4C5382" :dataPointColor="dataPointColor" />
		</view>
	</view>
</template>

<script>
	import {
		getWeekCategories
	} from '@/common/utils/timestamp';
	import chart from '@/components/smartchart/chart.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				yAxis: {
					type: 'grid',
					gridType: 'dash',
					fontSize: 10,
					splitNumber: 11,
					data: [{
						min: 0,
						max: 110,
						formatter: function(val) {
							return val == 60 || val == 80 || val == 100 ? val : "";
						}
					}],
					drawGrid: function(index) {
						return index == 5 || index == 7 || index == 9;
					}
				},
				scoreSeries: [{
					color: '#4C5382',
					name: '健康分数',
					pointShape: 'circle',
					textOffset: -5,
					data: [],
					formatter: function(val) {
						return val >= 30 ? val : '';
					}
				}],
				categories: getWeekCategories(),
				today: undefined,
				average: undefined,
				pulse: undefined,
				dataPointColor: []
			}
		},
		components: {
			chart
		},
		props: {
			from: {
				type: String,
				default: ''
			},
			scoreObject: {
				type: Object
			}
		},
		mounted: function() {
			this.fetchData();
		},
		methods: {
			fetchData: function() {
				if (this.scoreObject) {
					this.scoreSeries[0].data = this.scoreObject.seriesData;
					if (this.scoreObject.lastSeries?.length > 0) {
						const series = {
							color: 'rgba(76, 83, 130, 0.2)',
							name: '上周分数',
							pointShape: 'circle',
							textOffset: -5,
							data: this.scoreObject.lastSeries,
							formatter: function(val) {
								return '';
							}
						};
						this.scoreSeries.push(series);
					}
					this.categories = this.scoreObject.categories;
					this.dataPointColor = this.scoreObject.dataPointColor;
				}
				this.$refs.chart.renderChart(this.categories, this.scoreSeries, this.dataPointColor);
			},
			getAverage: function() {
				const arr = this.scoreSeries[0].data;
				if (arr.length <= 0) {
					return 0;
				}
				if (!this.average) {
					// 计算数组的总和
					let sum = 0;
					let count = 0;
					for (let i = 0; i < arr.length; i++) {
						const val = arr[i];
						if (val > 0) {
							sum += val;
							count += 1;
						}
					}
					// 返回平均值
					this.average = Number(sum / count).toFixed(0);
				}
				return this.average;
			},
			getToday: function() {
				const arr = this.scoreSeries[0].data;
				if (arr.length <= 0) {
					return 0;
				}
				const val = this.scoreSeries[0].data[arr.length - 1];
				return val;
			},
			fetchPulse: function(val = this.getToday()) {
				if (val > 100) {
					return "过快";
				} else if (val > 75) {
					return "略快";
				} else if (val == 0) {
					return "--";
				} else if (val < 50) {
					return "略慢";
				} else if (val < 40) {
					return "过慢";
				} else {
					return "正常";
				}
			},
			fetchPulseLevel: function(val = this.getToday()) {
				return val < 90 ? val : 100;
			},
			matchColor: function(val) {
				if (val > 100) {
					return '#AA3311';
				} else if (val > 75) {
					return '#FFA500';
				} else if (val < 50) {
					return '#FFA500';
				} else if (val < 40) {
					return '#AA3311';
				} else {
					return '#5EC29C';
				}
			},
			fetchPulseColor: function(val = this.getToday()) {
				return this.matchColor(val);
			}
		}
	}
</script>

<style>
	.monitor-container {
		display: flex;
		flex-direction: column;
	}

	.monitor_title {
		font-size: 14px;
		color: white;
		margin: 15px 20px;
	}

	.monitor_arcbar_container {
		min-height: 90px;
		display: flex;
		flex-direction: row;
		z-index: 10;
		margin: 20px 20px;
		margin-top: 60px;
		border: 1px solid transparent;
		border-radius: 10px;
		background-color: #FFFFFF;
		align-items: center;
	}

	.monitor-data {}

	.monitor-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 14px;
		color: #5a5a5a;
		margin: 10px 10px;
	}

	.monitor-item-icon {
		margin-right: 10px;
	}

	.monitor-progress-container {
		flex: 1;
		margin: 10px 10px;
		margin-left: 0px;
		border-radius: 20px;
		overflow: hidden;
	}

	.monitor-progress {
		flex: 1;
	}

	.wx-progress-inner-bar {
		border-radius: 20px;
	}

	.monitor-chart-container {
		z-index: 10;
		margin: 20px 20px;
		margin-top: 0px;
		border: 1px solid transparent;
		border-radius: 10px;
		background-color: #FFFFFF;
	}

	.bottom-container {
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: center;
		margin: 40px 20px;
		margin-top: 150px;
	}

	.bottom-text {
		width: 40px;
		font-size: 15px;
		color: #7C4B75;
		font-weight: bold;
		padding: 5px 30px;
		border: 2px solid #7C4B75;
		border-radius: 20px;
	}
</style>