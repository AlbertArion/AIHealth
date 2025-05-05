<template>
	<view class="flex-row" style="align-items: center;">
		<view style="flex: 1" />
		<image class="bcg-monitor-icon" mode="widthFix"
			src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/bcg_monitor.gif" />
		<view style="flex: 1; margin: 0px 5px;" />
		<view class="monitor-text">
			<text>{{heartRate}}</text>
			<text class="monitor-unit"> bpm</text>
		</view>
		<view style="flex: 1" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				heartRate: 0,
				breathe: 0
			}
		},
		methods: {
			onBeating: function(beatInfo) {
				this.heartRate = beatInfo.heartRate;
				this.breathe = beatInfo.breathe;
			}
		}
	}
</script>

<style>
	.bcg-monitor-icon {
		width: 210px;
		margin-top: 8px;
	}

	.monitor-text {
		font-size: 32px;
		color: #4C5382;
		text-align: center;
		font-weight: bold;
	}

	.monitor-unit {
		font-size: 12px;
		color: #4C5382;
	}
</style>