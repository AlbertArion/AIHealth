<template>
	<view class="monitor-container" :style="`${fromAdmin ? '' : 'background-color: #FFFFFF;'}`" @click="onChartClick">
		<chart ref="chart" dataType="pulsedist" :dataPointShape="true" :yAxis="yAxis" :series="pulseSeries"
			:extraColumn="extraColumn" chartType="column" color="#aa3311" :dataPointColor="dataPointColor" />
	</view>
</template>

<script>
	import {
		getDateLastWeek
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
					splitNumber: 10,
					data: [{
						min: 0,
						max: 100,
						formatter: function(val) {
							return (val == 20 || val == 60 || val == 100) ? `${val}%` : "";
						}
					}],
					drawGrid: function(index) {
						return index == 1 || index == 5 || index == 9;
					}
				},
				pulseSeries: [{
					color: 'transparent',
					name: '心率分布图',
					shape: 'circle',
					color: '#4C5382',
					data: [],
					formatter: function(val) {
						return `${val}%`;
					}
				}],
				extraColumn: {
					width: 20
				},
				categories: ['<40', '40~49', '50~59', '60~69', '70~79', '80~89', '90~99', '>100'],
				dataPointColor: []
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
		components: {
			chart
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
		mounted: function() {
			this.fetchData();
		},
		methods: {
			fetchData: function() {
				// 更新数据
				if (this.report) {
					this.fetchSeries(this.report);
				} else if (this.reportIndex > -1) {
					const reports = store.getDeviceReports();
					const report = reports[this.reportIndex];
					this.fetchSeries(report);
				} else {
					const reports = store.getDeviceReports();
					const report = reports[store.userConfig.reportIndex];
					this.fetchSeries(report);
				}
			},
			fetchSeries: function(report) {
				const sum = report.businessData.HeartRateVariability?.ValidLength;
				const dist = report.businessData.HeartRateVariability?.HeartbeatDist || [];
				this.pulseSeries[0].data = new Array(dist.length).fill(0);
				const seriesData = this.pulseSeries[0].data;
				for (let i = 0; i < dist.length; i++) {
					seriesData[i] = Math.round(100 * dist[i] / sum);
				};
				if (this.fromAdmin) {
					this.pulseSeries[0].name = '';
				}
				this.$refs.chart.renderChart(this.categories);
			},
			onChartClick: function() {
				if (this.fromAdmin) {
					this.$emit('onChartClick');
				} else if (this.fromMonitor) {
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