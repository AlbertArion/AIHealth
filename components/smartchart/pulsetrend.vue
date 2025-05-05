<template>
	<view class="monitor-container" @click="onChartClick">
		<view class="monitor-chart-container" :class="`${fromAdmin || fromPdf ? '' : 'shadow'}`"
			:style="`${fromAdmin ? 'margin: 20px 10px;' : 'background-color: #FFFFFF;'}`">
			<chart ref="chart" dataType="pulse" :dataLabel="false" :dataPointShape="true" :yAxis="yAxis"
				:chartWidth="chartWidth" :series="pulseSeries" chartType="line" color="#aa3311"
				:dataPointColor="dataPointColor" />
		</view>
	</view>
</template>

<script>
	import {
		createDate,
		getDateLastWeek,
		getDateToday
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
				xAxis: {
					type: 'grid',
					gridColor: 'transparent',
					gridType: 'dash',
					fontSize: 10,
					itemCount: 7,
					boundaryGap: false
				},
				pulseSeries: [{
					color: 'transparent',
					name: '心率趋势图',
					pointShape: 'point',
					data: [],
				}],
				categories: [],
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
			},
			extraStyle: function() {
				return this.fromAdmin ? {
					margin: '20px 10px'
				} : {};
			},
			chartWidth: function() {
				const info = getApp().globalData.systemInfo;
				return this.fromAdmin ? (info.windowWidth - 60) : (info.windowWidth - 40);
			}
		},
		mounted: function() {
			this.fetchData();
		},
		methods: {
			fetchData: function() {
				// 更新数据
				if (this.report) {
					this.fetchCategories(this.report);
				} else if (this.reportIndex > -1) {
					const reports = store.getDeviceReports();
					const report = reports[this.reportIndex];
					this.fetchCategories(report);
				} else {
					const reports = store.getDeviceReports();
					const today = getDateToday();
					let report = undefined;
					for (let i = 0; i < reports.length; i++) {
						const item = reports[i];
						if (item.endTime.slice(0, 10) != today) {
							break;
						}
						if (!report || item.businessData.MedicineSleepQuality.TotalSleepTime > report.businessData
							.MedicineSleepQuality.TotalSleepTime) {
							report = item;
						}
					}
					if (report) {
						this.fetchCategories(report);
					}
				}
			},
			fetchCategories: function(report) {
				const startTime = createDate(report.businessData.StartTime);
				const offset = startTime.getMinutes();
				const timeInMillis = startTime.getTime() - offset * 60 * 1000;
				const heartRates = new Array(offset).fill(0).concat(report.businessData.HeartRateVariability
					.HeartbeatRates);
				const end = heartRates.length - 1;
				for (let i = 0; i <= end; i++) {
					const c = heartRates[i];
					this.pulseSeries[0].data.push(c);
					const m = i % 60;
					const d = Math.floor(i / 60) % 2;
					if (m == 0 && d == 0 && (end - i > 60) || i == 0) {
						const mt = new Date(timeInMillis + i * 60 * 1000);
						const xt = mt.toTimeString().slice(0, 5);
						this.categories.push(xt);
					} else if (i == Math.floor(heartRates.length * 0.98)) {
						const mt = new Date(timeInMillis + (heartRates.length - 1) * 60 * 1000);
						const xt = mt.toTimeString().slice(0, 5);
						this.categories.push(xt);
					} else {
						this.categories.push('');
					}
					this.dataPointColor.push(this.matchColor(c));
				};
				if (this.fromAdmin) {
					this.pulseSeries[0].name = '';
				}
				this.xAxis.itemCount = this.categories.length;
				this.$refs.chart.renderChart(this.categories);
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
			onChartClick: function(item) {
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

	.monitor-chart-container {
		z-index: 10;
		margin: 20px 20px;
		margin-top: 0px;
		border: 1px solid transparent;
		border-radius: 10px;
	}
</style>