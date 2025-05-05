<template>
	<view style="display: flex; flex-direction: column;">
		<view class="monitor-gradient">
			<text class="monitor-title">今日心率指标：</text>
		</view>
		<view style="height: 40px;" />
		<view v-if="!isDeviceBound && !pulseSaved" class="monitor-question">
			<view class="monitor-question-text">您今天早上醒来后的心率是多少？</view>
			<view class="feedback-container">
				<button class="btn-margin" v-for="(item, index) in feedbackRange" :key="index"
					:style="`width: ${questionWidth}px;`" :class="feedbackClass(index)"
					@click="onMessageFeedback(index)">{{item.content}}</button>
			</view>
		</view>
		<view class="monitor-arcbar-container shadow">
			<image class="monitor-item-icon" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/pulse.png" />
			<text class="monitor-progress-desc">{{pulseToday}}</text>
			<pulse-progress v-if="hasDevicePulse" style="flex: 1" :size="21" :pulseData="fetchPulseData" />
			<view v-else class="monitor-progress-container">
				<progress class="monitor-progress" :percent="fetchPulsePercent" stroke-width="21" activeColor="#AA3311"
					active="true" duration="3" />
			</view>
			<text v-if="pulseToday == '--'" class="monitor-action-text">{{isDeviceBound ? '暂未同步' : '暂无数据'}}</text>
		</view>
		<pulse-chart :pulseObject="pulseObject" />
		<pulse-trend v-if="hasDevicePulse" />
		<pulse-dist v-if="hasDevicePulse" class="chart-container shadow" style="margin: 0px 20px 20px;" />
		<scatter-chart v-if="hasDevicePulse" class="chart-container shadow" style="margin: 0px 20px 40px;" />
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		getDateToday
	} from '@/common/utils/timestamp.js';
	import pulseProgress from './pulseprogress.vue';
	import chart from '@/components/smartchart/chart.vue';
	import pulseChart from '@/components/smartchart/pulsechart.vue';
	import pulseTrend from '@/components/smartchart/pulsetrend.vue';
	import pulseDist from '@/components/smartchart/pulsedist.vue';
	import scatterChart from '@/components/smartchart/scatterchart.vue';
	import {
		getPulseScore,
		monitorUpdate
	} from '@/common/js/monitor';
	export default {
		data() {
			return {
				color: '#AA3311',
				pulse: undefined,
				pulseColor: undefined,
				pulseLevel: undefined,
				pulseObject: store.userConfig.monitorTemp,
				message: {
					answered: false,
				},
				feedbackRange: [{
					content: "<40次/分",
					status: "过慢",
					value: 35,
				}, {
					content: "40~49次/分",
					status: "略慢",
					value: 45,
				}, {
					content: "50~75次/分",
					status: "正常",
					value: 65,
				}, {
					content: "76~100次/分",
					status: "略快",
					value: 85,
				}, {
					content: ">100次/分",
					status: "过快",
					value: 120,
				}],
			}
		},
		components: {
			pulseProgress,
			chart,
			pulseChart,
			pulseTrend,
			pulseDist,
			scatterChart
		},
		onBackPress() {
			store.userConfig.monitorTemp = undefined;
		},
		computed: {
			questionWidth: function() {
				return (getApp().globalData.systemInfo.windowWidth - 40 - 3 * 5) / 3
			},
			pulseSaved: function() {
				const pulseData = store.userConfig.monitor[4];
				return getDateToday() == pulseData.date && pulseData.value;
			},
			isDeviceBound: function() {
				return store.isDeviceBound();
			},
			hasDevicePulse: function() {
				const isToday = store.userConfig.monitor[4].date == getDateToday();
				return isToday && this.isDeviceBound;
			},
			pulseToday() {
				return store.userConfig.monitor[4].text;
			},
			fetchPulseData: function() {
				const pulse = store.userConfig.monitor[4].value;
				const rate = store.userConfig.monitor[4].data || 0;
				return {
					pulse: pulse,
					rate: rate
				};
			},
			fetchPulsePercent: function() {
				return getPulseScore();
			},
		},
		methods: {
			fetchRecent: function(value, text, level, color) {
				this.pulse = text;
				this.pulseLevel = level;
				this.pulseColor = color;
			},
			feedbackClass: function(statusIndex) {
				const content = this.feedbackRange[statusIndex].content;
				if (!this.message.answered) {
					return 'btn-feedback';
				} else if (this.message.answered == content) {
					return 'btn-feedback-selected';
				} else {
					return 'btn-feedback-unselected';
				}
			},
			onMessageFeedback: function(index) {
				const el = this.feedbackRange[index];
				this.message.answered = el.content;
				const data = {
					pulse: el.value
				};
				const type = 'pulse';
				const tzoffset = (new Date()).getTimezoneOffset() * 60000;
				const today = new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
				store.userConfig.monitor[4].value = el.value;
				store.userConfig.monitor[4].text = el.status;
				let score = 0;
				if (el.value == 0) {
					score = 0;
				} else if (el.value > 100 || el.value < 50) {
					score = 30;
				} else if (el.value > 90) {
					score = 60;
				} else {
					score = 100;
				}
				store.userConfig.monitor[4].data = Number(score / 100).toFixed(2);
				store.userConfig.monitor[4].date = today;
				monitorUpdate(data);
				uni.$emit('monitorUpdate', type);
				uni.showToast({
					title: '更新成功~',
					icon: 'none',
					duration: 600
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			}
		}
	}
</script>

<style>
	page {
		background-color: #f6f6f6;
	}

	.monitor-gradient {
		display: flex;
		flex-direction: column;
		position: absolute;
		top: 0px;
		width: 100%;
		height: 400px;
		background: linear-gradient(180deg, #AA3311 0%, #f6f6f6 100%);
	}

	.monitor-title {
		font-size: 16px;
		font-weight: bold;
		color: white;
		margin: 15px 20px;
	}

	.monitor-question {
		display: flex;
		flex-direction: column;
		z-index: 10;
		margin: 20px 20px 0px;
	}

	.monitor-question-text {
		font-size: 14px;
		font-weight: bold;
		color: white;
		opacity: 0.9;
		margin: 0px 5px 5px;
	}

	.feedback-container {
		opacity: 0.8;
	}

	.btn-margin {
		margin-right: 5px;
	}

	.btn-feedback {
		display: inline-block;
		background-color: white;
		border: 1px solid #AA3311;
		border-radius: 20px;
		width: 106px;
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		color: #AA3311;
		font-size: 12px;
	}

	.btn-feedback:active {
		opacity: 0.9;
	}

	.btn-feedback-selected {
		display: inline-block;
		background-color: #AA3311;
		width: 106px;
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		color: white;
		font-size: 12px;
		border-radius: 20px;
		pointer-events: none;
	}

	.btn-feedback-unselected {
		display: inline-block;
		background-color: white;
		border: 1px solid #773311;
		width: 106px;
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		color: #773311;
		font-size: 12px;
		border-radius: 20px;
		pointer-events: none;
		opacity: 0.9;
	}

	.monitor-arcbar-container {
		z-index: 10;
		display: flex;
		flex-direction: row;
		align-items: center;
		min-height: 90px;
		margin: 20px 20px;
		padding-right: 12px;
		border: 1px solid transparent;
		border-radius: 10px;
		background-color: #FFFFFF;
	}

	.monitor-item-icon {
		width: 19px;
		margin: 0px 10px;
	}

	.monitor-progress-container {
		flex: 1;
		margin: 10px 10px;
		border-radius: 20px;
		overflow: hidden;
	}

	.monitor-progress {
		flex: 1;
	}

	.wx-progress-inner-bar {
		border-radius: 20px;
	}

	.monitor-progress-desc {
		font-size: 16px;
		font-weight: bold;
		color: #AA3311;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-right: 3px;
	}

	.monitor-action-text {
		font-size: 12px;
		color: #A0A0A0;
	}

	.chart-container {
		z-index: 10;
		background-color: white;
		border-radius: 10px;
		overflow: hidden;
	}
</style>