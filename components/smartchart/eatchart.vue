<template>
	<view class="monitor-container" @click="toEat">
		<view class="monitor-chart-container shadow">
			<chart ref="chart" dataType="eat" :dataLabel="false" :dataPointShape="true" :yAxis="yAxis"
				:series="eatSeries" chartType="line" color="#5EC29C" :dataPointColor="dataPointColor" />
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
					splitNumber: 3,
					splitType: 'range',
					data: [{
						min: 15,
						max: 105,
						formatter: function(val) {
							if (val < 30) {
								return "";
							} else if (val <= 60) {
								return "较差";
							} else if (val <= 90) {
								return "一般";
							} else if (val <= 120) {
								return "不错";
							}
						}
					}],
				},
				eatSeries: [{
					color: 'transparent',
					name: '饮食',
					shape: 'circle',
					data: [],
				}],
				categories: getWeekCategories(),
				today: undefined,
				average: undefined,
				eat: undefined,
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
			eatObject: {
				type: Object
			}
		},
		mounted: function() {
			this.fetchData();
		},
		methods: {
			fetchData: function() {
				if (this.eatObject) {
					this.eatSeries[0].data = this.eatObject.seriesData;
					this.categories = this.eatObject.categories;
					this.dataPointColor = this.eatObject.dataPointColor;
				}
				this.$refs.chart.renderChart(this.categories, this.eatSeries, this.dataPointColor);
			},
			getAverage: function() {
				const arr = this.eatSeries[0].data;
				if (arr.length <= 0) {
					return 0;
				}
				if (!this.average) {
					// 计算数组的总和
					const sum = arr.reduce((accumulator, currentValue) => currentValue += accumulator);
					// 返回平均值
					this.average = Number(sum / arr.length).toFixed(2);
				}
				return this.average;
			},
			getToday: function() {
				const arr = this.eatSeries[0].data;
				if (arr.length <= 0) {
					return 0;
				}
				this.today = this.eatSeries[0].data[arr.length - 1];
				return this.today;
			},
			fetchEat: function(val = this.getToday()) {
				if (val <= 0) {
					return "--";
				} else if (val <= 30) {
					return "较差";
				} else if (val <= 60) {
					return "一般";
				} else {
					return "不错";
				}
			},
			fetchEatLevel: function(val = this.getToday()) {
				return val < 90 ? val : 100;
			},
			matchColor: function(val) {
				if (val <= 0) {
					return 'transparent';
				} else if (val <= 30) {
					return '#DE6F6B';
				} else if (val <= 60) {
					return '#F1C96A';
				} else {
					return '#5EC29C';
				}
			},
			fetchEatColor: function(val = this.getToday()) {
				return this.matchColor(val);
			},
			toEat: function(item) {
				if (this.from == "healthMonitor") {
					store.userConfig.monitorTemp = this.eatObject;
					uni.navigateTo({
						url: '/pages/monitor/eatmonitor'
					});
				}
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
		color: #5EC29C;
		font-weight: bold;
		padding: 5px 30px;
		border: 2px solid #5EC29C;
		border-radius: 20px;
	}
</style>