<template>
	<view class="pay-content">
		<view class="pay-item-container">
			<view class="pay-item-title">服务名称：</view>
			<view class="pay-item-content">
				<text class="pay-item-text">{{description}}</text>
				<text class="pay-item-value">{{total_score}}积分</text>
			</view>
		</view>
		<view class="pay-item-container">
			<view class="pay-item-title">我的积分：</view>
			<view class="pay-item-content">
				<text class="pay-item-text" style="color: darkgray;">剩余</text>
				<text class="pay-item-value" style="color: darkgray;">{{myScore}}积分</text>
			</view>
		</view>
		<view class="pay-result-container">
			<view class="pay-result">{{ isPaid ? '已支付' : '共需支付：' }}</view>
			<text class="pay-result-value">{{total_score}}积分</text>
		</view>
		<view v-if="isPaid" class="pay-tips-container">
			<text class="pay-item-tips" style="margin-bottom: 10px;"> - 健康建议将于12小时以内完成后，在微信小程序「心脉AI」的消息提醒中通知您；</text>
			<text class="pay-item-tips"> - 您也可以在「心脉AI」小程序内「我的」-「我的健康建议」中查看。</text>
		</view>
		<view v-else class="pay-tips-container">
			<view class="pay-item-tips-title">
				积分规则：
			</view>
			<view class="pay-item-tips">
				1. 本产品属于付费服务，会分析您上传的健康资料并生成建议；支持积分兑换，每199积分抵扣一次19.9元费用；
			</view>
			<view class="pay-item-tips">
				2. 积分可以通过分享小程序给好友获得，通过分享链接每成功注册1人, 您和对方都积累20积分；
			</view>
			<view class="pay-item-tips">
				3. 兑换后请前往「我的」->「我的健康建议」查看；
			</view>
			<view class="pay-item-tips">
				4. 兑换、使用过程中，如遇问题，请前往「我的」->「我的反馈」提交问题，我们会尽快处理；
			</view>
			<view class="pay-item-tips">
				5. 本产品属于内容服务，一经兑换，概不退换，敬请理解；
			</view>
			<view class="pay-item-tips">
				6. 本产品的最终解释权归和美健康，心脉AI所有。
			</view>
			<!-- <view class="pay-item-tips">
				x. 优惠试用期间, 其他所有功能均可免费使用；
			</view>
			<view class="pay-item-tips">
				x. 试用期结束后，智能问答9.9元/月；健康建议199元/次；188元/月VIP会员，所有功能免费。
			</view> -->
		</view>
		<view class="pay-action">
			<button v-if="isPaid" @click="navigateBack">返回上页</button>
			<button v-else @click="onPayClick">{{payActionText}}</button>
		</view>
	</view>
</template>

<script>
	import {
		noticeMap
	} from '@/common/js/record';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				myScore: 0,
				total_score: 199,
				description: "积分兑换健康建议",
				record: {},
			}
		},
		computed: {
			payActionText() {
				return "立即兑换";
			},
			isPaid() {
				return this.record.isPaid;
			}
		},
		onLoad(options = {}) {
			this.record = store.getHealthRecord(Number(options.index));
			this.total_score = Number(options.total_score);
			this.description = options.description;
			db.collection("uni-id-users")
				.where('"_id" == $env.uid')
				.field('score')
				.get()
				.then((res) => {
					const data = res.result.data[0];
					console.log("ScorePay, user score = ", data);
					this.myScore = data.score ? data.score : 0;
				});
		},
		methods: {
			updateRecord: function() {
				db.collection('health-records').where({
						_id: this.record._id
					})
					.update({
						isPaid: true,
					}).catch((err) => {
						console.log("ScorePay, 获取电子病历失败, err = ", err);
					}).finally(() => {
						this.record.isPaid = true;
					});
			},
			sendSms: function() {
				uniCloud.callFunction({
					name: 'tipsms',
					data: {
						data: {
							nickname: store.userInfo.nickname,
							rid: this.record?._id,
						}
					}
				}).then((res) => {
					console.log("ScorePay, sendSms success, res = ", res.result);
				});
			},
			onPayClick: function() {
				if (this.myScore < this.total_score) {
					uni.showToast({
						title: "积分不足",
						icon: "none",
						duration: 600
					});
				} else if (uni.subscribed) {
					this.payByScores();
				} else {
					uni.subscribed = true;
					uni.requestSubscribeMessage({
						tmplIds: [noticeMap["recordTips"].template_id], // 改成你的小程序订阅消息模板id
						complete: (data) => {
							console.log("ScorePay, subscribe success", data);
							this.payByScores();
						}
					});
				}
			},
			payByScores: function() {
				const uid = store.userInfo._id;
				const balance = this.myScore - this.total_score;
				console.log("ScorePay, balance = " + balance);
				db.collection('uni-id-scores').add({
					user_id: uid,
					balance: balance,
					score: this.total_score,
					type: 2,
					comment: '积分兑换病历的健康建议RID:' + this.record._id,
				});
				db.collection('uni-id-users').where({
					_id: uid,
				}).update({
					score: balance,
				}).then((res) => {
					store.userInfo.score = balance;
					uni.showToast({
						title: "兑换成功",
						icon: "none",
						duration: 1000
					});
					this.sendSms();
					this.updateRecord();
				});
			},
			navigateBack: function() {
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pay-content {
		display: flex;
		flex-direction: column;
		overflow-y: scroll;
		padding-bottom: 60px;
	}

	input {
		border: 1px solid #f3f3f3;
		padding: 10rpx;
	}

	.pay-item-container {
		display: flex;
		flex-direction: column;
		padding: 10px 10px;
		margin: 10px 20px;
		margin-top: 0px;
		border: 1px #4C5382 solid;
		border-radius: 10px;
	}

	.pay-item-title {
		font-size: 14px;
		font-weight: bold;
		color: #4C5382;
		flex: 1;
		margin-bottom: 10px;
		margin-top: 3px;
	}

	.pay-item-content {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.pay-item-text {
		flex: 1;
		font-size: 14px;
		color: #4C5382;
		margin-left: 10px;
	}

	.pay-item-value {
		font-size: 14px;
		font-weight: bold;
		color: indianred;
		margin-left: 10px;
	}

	.pay-result-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px 10px;
		margin: 10px 20px;
		margin-top: 0px;
		border-radius: 10px;
	}

	.pay-result {
		font-size: 18px;
		font-weight: bold;
		color: #4C5382;
		flex: 1;
	}

	.pay-result-value {
		font-size: 18px;
		font-weight: bold;
		color: indianred;
		margin-left: 10px;
	}

	.pay-tips-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 10px 10px;
		margin: 10px 20px;
		margin-top: 0px;
		border-radius: 10px;
	}

	.pay-result-title {
		font-size: 14px;
		color: #4C5382;
		font-weight: bold;
		margin: 10px 0px 10px;
	}

	.pay-result-content {
		font-size: 12px;
		color: lightgray;
		line-height: 24px;
		margin: 0px 0px 5px 10px;
	}

	.pay-item-tips-title {
		font-size: 14px;
		color: lightgray;
		font-weight: bold;
		margin-bottom: 3px;
	}

	.pay-item-tips {
		font-size: 12px;
		color: lightgray;
		margin-top: 3px;
	}

	.pay-action {
		position: fixed;
		bottom: 0px;
		width: 100%;
		padding-top: 10px;
		padding-bottom: 20px;
		background-color: white;
	}

	.pay-action button {
		background-color: #4C5382;
		color: white;
		font-size: 14px;
		display: flex;
		height: 40px;
		width: 90%;
		margin-left: 5%;
		margin-top: 10px;
		align-items: center;
		justify-content: center;
	}

	.pay-action button:active {
		opacity: 0.8;
	}
</style>