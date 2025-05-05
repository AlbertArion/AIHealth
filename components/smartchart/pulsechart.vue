<template>
	<view class="monitor-container" @click="toPulse">
		<view class="monitor-chart-container shadow">
			<chart ref="chart" dataType="pulse" :dataLabel="false" :dataPointShape="true" :yAxis="yAxis"
				:series="pulseSeries" chartType="line" color="#aa3311" :dataPointColor="dataPointColor" />
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
					splitNumber: 16,
					data: [{
						min: 30,
						max: 110,
						formatter: function(val) {
							return val == 40 || val == 50 || val == 75 || val == 100 ? val : "";
						}
					}],
					drawGrid: function(index) {
						return index == 1 || index == 3 || index == 8 || index == 13;
					}
				},
				pulseSeries: [{
					color: 'transparent',
					name: '心率',
					pointShape: 'circle',
					data: [],
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
			pulseObject: {
				type: Object
			}
		},
		mounted: function() {
			if (store.isDeviceBound()) {
				this.pulseSeries[0].name = '夜间心率';
			}
			this.fetchData();
		},
		methods: {
			fetchData: function() {
				if (this.pulseObject) {
					this.pulseSeries[0].data = this.pulseObject.seriesData;
					this.categories = this.pulseObject.categories;
					this.dataPointColor = this.pulseObject.dataPointColor;
				}
				this.$refs.chart.renderChart(this.categories, this.pulseSeries, this.dataPointColor);
			},
			toPulse: function(item) {
				if (this.from == "healthMonitor") {
					store.userConfig.monitorTemp = this.pulseObject;
					uni.navigateTo({
						url: '/pages/monitor/pulsemonitor'
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
		color: #7C4B75;
		font-weight: bold;
		padding: 5px 30px;
		border: 2px solid #7C4B75;
		border-radius: 20px;
	}
</style>