<template>
	<view class="item-container">
		<view class="item-row">
			<text class="item-title-text">
				{{item.service}}
			</text>
			<text class="item-time">
				{{item.timestamp}}
			</text>
		</view>
		<view class="item-row">
			<text class="item-info-text">
				{{item.uname}} ({{item.phone}})
			</text>
		</view>
		<view class="item-row">
			<text class="item-amount-text">
				￥{{item.amount}}
			</text>
		</view>
	</view>
</template>

<script>
	import {
		formatTimestamp
	} from '@/common/utils/timestamp';
	export default {
		data() {
			return {

			}
		},
		props: {
			item: {
				type: Object
			}
		},
		components: {

		},
		methods: {
			timeFormat: function(timestamp) {
				return formatTimestamp(timestamp);
			}
		}
	}
</script>

<style>
	.item-container {
		display: flex;
		flex-direction: column;
		padding: 10px 10px;
		border-bottom: #F0F0F0 1px solid;
	}

	.item-row {
		display: flex;
		flex-direction: row;
	}

	.item-title-text {
		font-size: 14px;
		font-weight: bold;
		color: #808080;
	}

	.item-time {
		flex: 1;
		font-size: 10px;
		color: #808080;
		text-align: right;
	}

	.item-info-text {
		font-size: 12px;
		color: #808080;
		padding: 3px 0px;
	}

	.item-amount-text {
		font-size: 12px;
		color: indianred;
	}
</style>