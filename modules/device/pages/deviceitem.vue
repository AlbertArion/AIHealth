<template>
	<view class="item-row" :style="`${id == 0 ? '' : 'border-top: 1px #B0B0B0 solid;'}`">
		<text class="item-name">{{device.name}}</text>
		<text v-if="device.connected" class="item-state" style="color: #4C5382;">已连接</text>
		<text v-else class="item-state">未连接</text>
		<uni-icons type="info" size="14" color="#4C5382" />
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		props: {
			id: {
				type: Number
			},
			device: {
				type: Object
			}
		},
		methods: {

		},
	}
</script>

<style>
	.item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px 0px;
		margin: 0px 20px;
	}

	.item-name {
		flex: 1;
		font-size: 12px;
		font-weight: bold;
		color: #4C5382;
		margin-right: 10px;
	}

	.item-state {
		font-size: 12px;
		color: #808080;
		margin-right: 6px;
		margin-left: 10px;
	}
</style>