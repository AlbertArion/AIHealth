<template>
	<view style="display: flex; flex-direction: column;">
		<view class="monitor-gradient">
			<text class="monitor-title">今日心情：</text>
		</view>
		<view style="height: 40px;" />
		<view v-if="!feelingSaved" class="monitor-question">
			<view class="monitor-question-text">您今天感觉怎么样？</view>
			<view class="feedback-container">
				<button class="btn-margin" v-for="(item, index) in feedbackRange" :key="index"
					:style="`width: ${questionWidth}px;`" :class="feedbackClass(index)"
					@click="onMessageFeedback(index)">{{item.content}}</button>
			</view>
		</view>
		<view class="monitor-arcbar-container shadow">
			<image class="monitor-item-icon" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/feelings.png" />
			<text class="monitor-progress-desc">{{feelingsToday}}</text>
			<view class="monitor-progress-container">
				<progress class="monitor-progress" :percent="fetchFeelingPercent" stroke-width="21"
					activeColor="#F1C96A" active="true" duration="3" />
			</view>
			<text v-if="feelingsToday == '--'" class="monitor-action-text">暂无数据</text>
		</view>
		<feeling-chart :feelingObject="feelingObject" />
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import {
		getDateToday
	} from '@/common/utils/timestamp.js';
	import chart from '@/components/smartchart/chart.vue';
	import feelingChart from '@/components/smartchart/feelingchart.vue';
	import {
		getFeelingScore,
		monitorUpdate
	} from '@/common/js/monitor';
	export default {
		data() {
			return {
				color: '#F1C96A',
				feeling: undefined,
				feelingColor: undefined,
				feelingLevel: undefined,
				feelingObject: store.userConfig.monitorTemp,
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
			chart,
			feelingChart
		},
		onBackPress() {
			store.userConfig.monitorTemp = undefined;
		},
		computed: {
			questionWidth: function() {
				return (getApp().globalData.systemInfo.windowWidth - 40 - 3 * 5) / 3
			},
			feelingSaved: function() {
				const feelingData = store.userConfig.monitor[2];
				return getDateToday() == feelingData.date && feelingData.value;
			},
			feelingsToday() {
				return store.userConfig.monitor[2].text;
			},
			fetchFeelingPercent: function() {
				return getFeelingScore();
			},
		},
		methods: {
			fetchRecent: function(value, text, level, color) {
				this.feeling = text;
				this.feelingLevel = level;
				this.feelingColor = color;
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
				const type = 'feelings';
				const data = {
					feelings: el.status
				};
				store.userConfig.monitor[2].value = el.value;
				store.userConfig.monitor[2].text = el.content;
				store.userConfig.monitor[2].data = Number(el.value / 90).toFixed(2);
				store.userConfig.monitor[2].date = getDateToday();
				monitorUpdate(data);
				uni.$emit('monitorUpdate', type);
				if (el.value <= 30) {
					uni.showModal({
						content: '心情不好，跟Emohaa聊一下？',
						confirmColor: '#4C5382',
						confirmText: "好的",
						showCancel: true,
						cancelText: "不用",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/emochat/index'
								});
							}
						}
					});
				} else {
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
	}
</script>

<style>
	page {
		background-color: #f6f6f6;
	}

	.monitor-container {
		display: flex;
		flex-direction: column;
	}

	.monitor-gradient {
		display: flex;
		flex-direction: column;
		position: absolute;
		top: 0px;
		width: 100%;
		height: 400px;
		background: linear-gradient(180deg, #F1C96A 0%, #f6f6f6 100%);
	}

	.monitor-title {
		font-size: 16px;
		font-weight: bold;
		color: #3a3a3a;
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
		color: #3a3a3a;
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
		border: 1px solid #F1C96A;
		border-radius: 20px;
		width: 106px;
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		color: #3a3a3a;
		font-size: 12px;
	}

	.btn-feedback:active {
		opacity: 0.9;
	}

	.btn-feedback-selected {
		display: inline-block;
		background-color: #999922;
		width: 106px;
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		color: white;
		font-size: 12px;
		border-radius: 20px;
		border: 1px solid #999922;
		pointer-events: none;
	}

	.btn-feedback-unselected {
		display: inline-block;
		background-color: white;
		border: 1px solid #999922;
		width: 106px;
		height: 30px;
		line-height: 30px;
		margin-top: 5px;
		color: #3a3a3a;
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
		color: #F1C96A;
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