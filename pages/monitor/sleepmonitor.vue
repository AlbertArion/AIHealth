<template>
	<view style="display: flex; flex-direction: column;">
		<view class="monitor-gradient">
			<text class="monitor-title">今日睡眠质量：</text>
		</view>
		<view style="height: 40px;" />
		<view v-if="!isDeviceBound && !sleepSaved" class="monitor-question">
			<view class="monitor-question-text">您昨天睡得怎么样？</view>
			<view class="feedback-container">
				<button class="btn-margin" v-for="(item, index) in feedbackRange" :key="index"
					:style="`width: ${questionWidth}px;`" :class="feedbackClass(index)"
					@click="onMessageFeedback(index)">{{item.content}}</button>
			</view>
		</view>
		<view class="monitor-arcbar-container shadow">
			<image class="monitor-item-icon" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/sleep.png" />
			<text class="monitor-progress-desc">{{sleepToday}}</text>
			<sleep-progress v-if="hasSleepQuality" style="flex: 1" :size="21" :sleepQuality="sleepQuality" />
			<view v-else class="monitor-progress-container">
				<progress class="monitor-progress" :percent="fetchSleepPercent" stroke-width="21" activeColor="#7C4B75"
					active="true" duration="3" />
			</view>
			<text v-if="sleepToday == '--'" class="monitor-action-text">{{isDeviceBound ? '暂未同步' : '暂无数据'}}</text>
		</view>
		<sleep-chart :sleepObject="sleepObject" />
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		getDateToday
	} from '@/common/utils/timestamp.js';
	import sleepProgress from './sleepprogress.vue';
	import chart from '@/components/smartchart/chart.vue';
	import sleepChart from '@/components/smartchart/sleepchart.vue';
	import {
		getSleepScore,
		monitorUpdate
	} from '@/common/js/monitor';
	export default {
		data() {
			return {
				color: '#7C4B75',
				sleep: undefined,
				sleepColor: undefined,
				sleepLevel: undefined,
				sleepObject: store.userConfig.monitorTemp,
				message: {
					answered: false,
				},
				feedbackRange: [{
					content: "不错",
					status: "good",
					value: 90,
				}, {
					content: "一般",
					status: "normal",
					value: 60,
				}, {
					content: "较差",
					status: "bad",
					value: 30,
				}],
			}
		},
		components: {
			sleepProgress,
			chart,
			sleepChart
		},
		onBackPress() {
			store.userConfig.monitorTemp = undefined;
		},
		computed: {
			questionWidth: function() {
				return (getApp().globalData.systemInfo.windowWidth - 40 - 3 * 5) / 3
			},
			sleepSaved: function() {
				const sleepData = store.userConfig.monitor[3];
				return getDateToday() == sleepData.date && sleepData.value;
			},
			isDeviceBound: function() {
				return store.isDeviceBound();
			},
			hasSleepQuality: function() {
				const sleepData = store.userConfig.monitor[3];
				return sleepData?.date == getDateToday() && sleepData.quality?.effectiveTime > 0;
			},
			sleepQuality: function() {
				return store.userConfig.monitor[3].quality;
			},
			fetchSleepPercent: function() {
				return getSleepScore();
			},
			sleepToday() {
				return store.userConfig.monitor[3].text;
			}
		},
		methods: {
			fetchRecent: function(value, text, level, color) {
				this.sleep = text;
				this.sleepLevel = level;
				this.sleepColor = color;
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
				const type = 'sleep';
				const data = {
					sleep: el.status
				};
				store.userConfig.monitor[3].value = el.value;
				store.userConfig.monitor[3].text = el.content;
				store.userConfig.monitor[3].data = Number(el.value / 90).toFixed(2);
				store.userConfig.monitor[3].date = getDateToday();
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
		background: linear-gradient(180deg, #7C4B75 0%, #f6f6f6 100%);
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
		border: 1px solid #7C4B75;
		border-radius: 20px;
		width: 106px;
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		color: #7C4B75;
		font-size: 12px;
	}

	.btn-feedback:active {
		opacity: 0.9;
	}

	.btn-feedback-selected {
		display: inline-block;
		background-color: #7C4B75;
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
		border: 1px solid #594B75;
		width: 106px;
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		color: #594B75;
		font-size: 12px;
		border-radius: 20px;
		pointer-events: none;
		opacity: 0.9;
	}

	.monitor-arcbar-container {
		min-height: 90px;
		display: flex;
		flex-direction: row;
		z-index: 10;
		margin: 20px 20px;
		border: 1px solid transparent;
		border-radius: 10px;
		background-color: #FFFFFF;
		align-items: center;
		padding-right: 12px;
	}

	.monitor-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 12px;
		color: #5a5a5a;
		margin: 10px 10px;
	}

	.monitor-item-icon {
		width: 21px;
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
		color: #594B75;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-right: 3px;
	}

	.monitor-action-text {
		font-size: 12px;
		color: #A0A0A0;
	}
</style>