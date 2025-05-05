<template>
	<view style="display: flex; flex-direction: column;">
		<view class="monitor-gradient">
			<text class="monitor_title">今日步数：</text>
			<view class="monitor_content">
				<text>您今日行走</text>
				<text>&nbsp;{{stepsToday}}&nbsp;</text>
				<text>步，消耗了</text>
				<text>&nbsp;{{calorie}}&nbsp;</text>
				<text>卡路里！</text>
			</view>
		</view>
		<view class="monitor_arcbar_container shadow">
			<image class="monitor-item-icon" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/monitor/steps.png" />
			<view class="monitor-progress-desc">
				<text style="font-size: 16px; font-weight: bold;">{{stepsToday}}</text>
				<text style="color: #C0C0C0;">/10000步</text>
			</view>
			<view class="monitor-progress-container">
				<progress class="monitor-progress" :percent="fetchStepPercent" stroke-width="21" activeColor="#0088BB"
					active="true" duration="3" />
			</view>
			<text v-if="stepsToday == 0" class="monitor-action-text">暂未同步</text>
		</view>
		<step-chart :stepObject="stepObject" />
	</view>
</template>

<script>
	import {
		getStepScore
	} from '@/common/js/monitor';
	import chart from '@/components/smartchart/chart.vue';
	import stepChart from '@/components/smartchart/stepchart.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		data() {
			return {
				steps: undefined,
				stepColor: undefined,
				stepLevel: undefined,
				stepObject: store.userConfig.monitorTemp
			}
		},
		components: {
			chart,
			stepChart
		},
		onBackPress() {
			store.userConfig.monitorTemp = undefined;
		},
		computed: {
			stepsToday() {
				return store.userConfig.monitor[0].value || 0;
			},
			calorie: function() {
				return (this.stepsToday * 0.04).toFixed(0);
			},
			fetchStepPercent: function() {
				return getStepScore();
			},
		},
		methods: {
			fetchRecent: function(value, text, level, color) {
				this.steps = value;
				this.stepLevel = level;
				this.stepColor = color;
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
		background: linear-gradient(180deg, #0088BB 0%, #f6f6f6 100%);
	}

	.monitor_title {
		font-size: 16px;
		font-weight: bold;
		color: white;
		margin: 15px 20px 10px;
	}

	.monitor_content {
		font-size: 12px;
		color: white;
		margin-left: 40px;
		margin-right: 10px;
	}

	.monitor_arcbar_container {
		min-height: 90px;
		display: flex;
		flex-direction: row;
		z-index: 10;
		margin: 20px 20px;
		margin-top: 90px;
		border: 1px solid transparent;
		border-radius: 10px;
		background-color: #FFFFFF;
		align-items: center;
		padding-right: 12px;
	}

	.monitor-data {}

	.monitor-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 12px;
		color: #5a5a5a;
		margin: 10px 10px;
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
		font-size: 12px;
		color: #0088BB;
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