<template>
	<view class="tool-item-flag">
		<view class="label-item" @click="$emit('item-click')">全面评估</view>
	</view>
</template>

<script>
</script>

<style>
	.tool-item-flag {
		display: flex;
		flex-direction: row;
		padding: 0px 10px 30px 45px;
		align-items: center;
	}

	.label-item {
		color: #4C5382;
		border-radius: 20px;
		font-weight: bold;
		border: solid 1px #4C5382;
		text-align: center;
		height: 20px;
		line-height: 20px;
		width: 60px;
		margin: 0px 6px;
		padding: 3px 14px;
		font-size: 12px;
	}

	.label-item:active {
		opacity: 0.8;
	}

	.bar-divider {
		height: 1px;
		margin: 0px 20px;
		border-top: #4C5382 1px dashed;
	}
</style>