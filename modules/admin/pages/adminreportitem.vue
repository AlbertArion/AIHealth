<template>
	<view class="item-container shadow" @click="toDetail">
		<view class="item-row" style="margin: 10px 6px 0px 15px; font-weight: bold;">
			<image class="item-device-icon" mode="widthFix"
				src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/icon_health_p.png" />
			<text class="item-report-title" style="flex: 1;">{{data.username}}的健康数据：</text>
			<text class="item-report-title" style="font-size: 11px;">{{data.startTime}}</text>
			<view style="margin: 0px 6px;">
				<uni-icons type="right" size="16" color="#808080" />
			</view>
		</view>
		<view class="item-row" style="margin-left: 27px;">
			<text class="item-report-text" style="flex: 1; font-weight: bold;">平均心率：</text>
			<text class="item-report-text">{{heartRate}} 次/分钟</text>
		</view>
		<view class="item-row" style="margin-left: 27px;">
			<text class="item-report-text" style="flex: 1; font-weight: bold;">休息时长：</text>
			<text class="item-report-text">{{sleepTime}}</text>
		</view>
		<view class="item-row" style="margin-left: 27px; margin-bottom: 10px;">
			<text class="item-report-text" style="flex: 1; font-weight: bold;">呼吸频率：</text>
			<text class="item-report-text">{{breathingRate}} 次/分钟</text>
		</view>
	</view>
</template>

<script>
	import scatterChart from '@/components/smartchart/scatterchart.vue';
	import pulseTrend from '@/components/smartchart/pulsetrend.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import {
		averageRate
	} from '@/common/js/monitor';
	export default {
		data() {
			return {
				report: this.data?.businessData
			}
		},
		props: {
			id: {
				type: Number
			},
			data: {
				type: Object
			}
		},
		components: {
			scatterChart,
			pulseTrend
		},
		computed: {
			heartRate: function() {
				return averageRate(this.report);
			},
			breathingRate: function() {
				return Math.round(this.report.MedicineSleepQuality.BreathingRate);
			},
			sleepTime() {
				const seconds = this.report.MedicineSleepQuality.TotalSleepTime;
				const hours = Math.floor(seconds / 3600);
				const minutes = ((seconds - hours * 3600) / 60).toFixed(0);
				return `${hours > 0 ? hours + ' 小时 ':''}${minutes} 分钟`;
			}
		},
		methods: {
			toDetail: function() {
				store.userConfig.reportTemp = this.data;
				uni.navigateTo({
					url: `/modules/admin/pages/reportdetail`
				});
			}
		}
	}
</script>

<style>
	.item-container {
		display: flex;
		flex-direction: column;
		margin: 20px 20px 0px;
		border-radius: 10px;
		overflow: hidden;
		background-color: white;
	}

	.item-container:active {
		background-color: rgba(76, 83, 130, 0.1);
	}

	.item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 15px;
	}

	.item-device-icon {
		width: 14px;
		margin-right: 5px;
	}

	.item-report-title {
		font-size: 12px;
		color: #4C5382;
		line-height: 24px;
	}

	.item-report-text {
		font-size: 11px;
		color: #808080;
		line-height: 18px;
		margin-right: 10px;
	}

	.text-ellipsis {
		line-height: 18px;
		max-height: 200px;
		word-break: break-all;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 10;
	}
</style>