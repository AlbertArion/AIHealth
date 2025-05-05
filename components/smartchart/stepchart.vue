<template>
	<view class="monitor-container" @click="toSteps">
		<view class="monitor-chart-container shadow">
			<chart ref="chart" dataType="steps" :dataPointShape="true" :yAxis="yAxis" :series="stepSeries"
				chartType="line" color="#0088BB" :dataPointColor="dataPointColor" />
		</view>
	</view>
</template>

<script>
	import {
		getDateToday,
		getWeekCategories
	} from '@/common/utils/timestamp';
	import chart from './chart.vue';
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
						max: 20000,
						formatter: function(val) {
							return val == 0 || val == 6000 || val == 10000 || val == 20000 ? val : "";
						}
					}],
					drawGrid: function(index) {
						return index == 2 || index == 4 || index == 9;
					}
				},
				stepSeries: [{
					color: 'transparent',
					name: '步数',
					pointShape: 'circle',
					textOffset: -5,
					data: [],
				}],
				categories: getWeekCategories(),
				average: undefined,
				steps: undefined,
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
			stepObject: {
				type: Object
			}
		},
		mounted: function() {
			this.fetchData();
		},
		methods: {
			fetchData: function() {
				if (this.stepObject) {
					this.stepSeries[0].data = this.stepObject.seriesData;
					this.categories = this.stepObject.categories;
					this.dataPointColor = this.stepObject.dataPointColor;
					this.yAxis.data = [{
						min: 0,
						max: this.stepObject.maxValue,
						formatter: function(val) {
							return val == 0 || val == 6000 || val == 10000 || val % 20000 == 0 ? val : "";
						}
					}];
				}
				this.$refs.chart.renderChart(this.categories, this.stepSeries, this.dataPointColor, this.yAxis);
			},
			getAverage: function() {
				const arr = this.stepSeries[0].data;
				if (arr.length <= 0) {
					return 0;
				}
				if (!this.average) {
					// 计算数组的总和
					const sum = arr.reduce((accumulator, currentValue) => currentValue += accumulator);
					// 返回平均值
					this.average = Number(sum / arr.length).toFixed(0);
				}
				return this.average;
			},
			getToday: function() {
				const arr = this.stepSeries[0].data;
				if (arr.length <= 0) {
					return 0;
				}
				const val = this.stepSeries[0].data[arr.length - 1];
				return val;
			},
			fetchStepLevel: function(val = this.getToday()) {
				return val < 10000 ? Number(val / 100).toFixed(0) : 100;
			},
			matchColor: function(val) {
				if (val <= 0) {
					return 'transparent';
				} else if (val <= 1000) {
					return '#DE6F6B';
				} else if (val <= 6000) {
					return '#F1C96A';
				} else if (val <= 10000) {
					return '#5EC29C';
				} else {
					return '#0088BB';
				}
			},
			fetchStepColor: function(val = this.getToday()) {
				return this.matchColor(val);
			},
			toLogin() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
				});
			},
			toSteps: function() {
				if (this.from != "healthMonitor") {
					// 不是来自首页，无需跳转
					return;
				}
				if (!store.hasLogin) {
					this.toLogin();
					return;
				}
				const sessionKey = uni.getStorageSync('sessionKey');
				const hasSessionKey = sessionKey && sessionKey != "";
				if (!hasSessionKey) {
					const that = this;
					uni.showModal({
						title: "登录提醒",
						content: `获取运动步数需要授权，请问您是否要重新登录呢？`,
						confirmColor: '#0088BB',
						confirmText: "去授权",
						showCancel: true,
						cancelText: "取消",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								that.toLogin();
							}
						}
					});
					return;
				}
				store.userConfig.monitorTemp = this.stepObject;
				uni.navigateTo({
					url: '/pages/monitor/stepmonitor'
				});
			},
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
		background-color: #FFFFFF;
	}
</style>