<template>
	<view class="item-container">
		<view class="item-title">
			<view class="item-time">{{timeFormat(tip.timestamp)}}</view>
			<view class="item-label">{{isExpert ? '专家建议' : '健康建议'}}</view>
			<view class="tip-icon-container">
				<uni-icons class="tip-icon" @click="removeTips" type="minus-filled" size="22" color="indianred" />
			</view>
		</view>
		<view class="item-content-container">
			<view class="item-content">
				<text class="content-text">{{tip.content}}</text>
			</view>
			<view class="item-right-actions">
				<view v-if="tip.fileUrl" class="item-image-container" @click="previewImage">
					<image class="item-image" :src="tip.fileUrl" mode="aspectFill" />
				</view>
			</view>
			<view class="item-icon-container">
				<uni-icons v-if="tip.accept" class="item-action" type="heart-filled" size="22" color="indianred"
					@click="accept" />
				<uni-icons v-else type="heart" class="item-action" size="22" color="#4C5382" @click="accept" />
			</view>
		</view>
	</view>

</template>

<script>
	import {
		formatTimestamp
	} from '@/common/utils/timestamp.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	const db = uniCloud.database();
	export default {
		data() {
			return {

			}
		},
		props: {
			id: {
				type: Number
			},
			isExpert: {
				type: Boolean,
				default: false
			},
			tip: {
				type: Object
			},
		},
		computed: {
			nickname() {
				return store.userInfo ? store.userInfo.nickname : "";
			},
			acceptText() {
				return this.tip.accept ? "取消" : "赞同";
			}
		},
		methods: {
			removeTipsFromDB: function() {
				db.collection('health-tips').where({
						_id: this.tip._id
					})
					.remove()
					.then((res) => {
						console.log("HealthTips, 健康建议删除成功");
						uni.showToast({
							icon: 'success',
							title: "删除成功",
							duration: 600
						});
						const index = this.id;
						if (index < store.healthTips.length) {
							store.healthTips.splice(index, 1);
						}
					}).catch((err) => {
						console.log("HealthTips, 健康建议删除失败, err = " + JSON.stringify(err));
						uni.showToast({
							icon: 'fail',
							title: "删除失败",
							content: err.errMsg,
							duration: 600
						});
					});
			},
			removeTips: function() {
				const that = this;
				uni.showModal({
					title: "删除健康建议",
					content: "确定要删除该健康建议吗？",
					confirmColor: '#4C5382',
					showCancel: true,
					success: function(res) {
						if (res.confirm) {
							that.removeTipsFromDB();
						}
					}
				});
			},
			previewImage: function() {
				uni.previewImage({
					urls: [this.tip.fileUrl]
				});
			},
			timeFormat: function(timestamp) {
				return formatTimestamp(timestamp);
			},
			accept: function() {
				this.tip.accept = this.tip.accept ? false : true;
				db.collection('health-tips').where({
					_id: this.tip._id,
				}).update({
					nickname: this.nickname,
					accept: this.tip.accept
				}).then((res) => {
					console.log("HealthTips 点赞成功");
					if (this.tip.accept) {
						uni.showToast({
							icon: 'none',
							title: "点赞成功~",
							duration: 600
						});
					}
				}).catch((err) => {
					console.log("HealthTips 点赞失败， err = " + JSON.stringify(err));
					uni.showToast({
						icon: 'fail',
						title: "点赞失败",
						content: err.errMsg,
						duration: 600
					});
				});
			},
		}
	}
</script>

<style>
	.item-container {
		display: flex;
		flex-direction: column;
		border: solid 1px aliceblue;
		border-top: 0px;
		margin: 0px 20px;
	}

	.item-title {
		display: flex;
		flex-direction: row;
		padding: 15px 0px;
		padding-bottom: 0px;
	}

	.item-time {
		color: dimgray;
		font-size: 12px;
		text-align: start;
		margin: 0px 10px;
	}

	.item-label {
		flex: 1;
		color: #4C5382;
		font-size: 12px;
		text-align: end;
		margin-right: 1px;
		font-weight: bold;
	}

	.tip-icon-container {
		margin-top: -4px;
	}

	.tip-icon {
		margin: 0px 10px;
	}

	.item-content-container {
		display: flex;
		flex-direction: row;
		padding-bottom: 10px;
		align-items: flex-end;
	}

	.item-content {
		display: flex;
		flex-direction: row;
		flex: 1;
		line-height: 20px;
		color: dimgray;
		font-size: 12px;
		margin-left: 10px;
		margin-right: 10px;
		margin-bottom: -2px;
	}

	.content-text {}

	.item-right-actions {
		display: flex;
		flex-direction: row;
		height: 30px;
		padding: 10px 0px;
	}

	.item-image-container {}

	.item-image {
		height: 40px;
		max-width: 50px;
	}

	.item-icon-container {
		height: 20px;
	}

	.item-action {
		margin: 0px 10px;
	}
</style>