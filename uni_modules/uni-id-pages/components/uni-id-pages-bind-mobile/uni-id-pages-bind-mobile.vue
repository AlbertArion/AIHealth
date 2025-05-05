<template>
	<uni-popup class="popup" ref="popup" type="center">
		<view class="box">
			<text class="headBox">绑定资料</text>
			<text class="tip">将一键获取你的手机号码绑定你的个人资料。</text>
			<view class="btnBox">
				<button class="close" @click="closeMe">关闭</button>
				<button class="agree" open-type="getPhoneNumber" @getphonenumber="bindMobileByMpWeixin">获取</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	const db = uniCloud.database();
	const usersTable = db.collection('uni-id-users')
	const uniIdCo = uniCloud.importObject("uni-id-co")
	export default {
		emits: ['success'],
		computed: {},
		data() {
			return {}
		},
		methods: {
			async beforeGetphonenumber() {
				return await new Promise((resolve, reject) => {
					uni.showLoading({
						mask: true
					})
					wx.checkSession({
						success() {
							// console.log('session_key 未过期');
							resolve()
							uni.hideLoading()
						},
						fail() {
							// console.log('session_key 已经失效，正在执行更新');
							wx.login({
								success({
									code
								}) {
									uniCloud.importObject("uni-id-co", {
										customUI: true
									}).loginByWeixin({
										code
									}).then(e => {
										resolve()
									}).catch(e => {
										console.log(e);
										reject()
									}).finally(e => {
										uni.hideLoading()
									})
								},
								fail: (err) => {
									console.error(err);
									reject()
								}
							})
						}
					})
				})
			},
			async bindMobileByMpWeixin(e) {
				console.log(e, 'e');

				if (e.detail.errMsg == "getPhoneNumber:ok") {
					//检查登录信息是否过期，否则通过重新登录刷新session_key
					await this.beforeGetphonenumber()
					uniIdCo.bindMobileByMpWeixin(e.detail).then(e => {
						this.$emit('success')
					}).finally(e => {
						this.closeMe()
					})
				} else {
					this.closeMe()
				}
			},
			async open() {
				this.$refs.popup.open()
			},
			closeMe(e) {
				this.$refs.popup.close()
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	view {
		display: flex;
	}

	.popup {}

	.box {
		background-color: white;
		flex-direction: column;
		margin: 0px 20px;
		border-radius: 20px;
	}

	.headBox {
		padding: 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-weight: bold;
		text-align: left;
		font-size: 16px;
		color: #555555;
		margin-left: 15rpx;
	}

	.tip {
		color: #888888;
		text-align: left;
		justify-content: left;
		margin: 10px 10px;
		padding: 0px 10px;
		font-size: 12px;
	}

	.btnBox {
		display: flex;
		margin-top: 20px;
		margin-bottom: 15px;
		justify-content: center;
		flex-direction: row;
		align-items: center;
	}

	.agree {
		text-align: center;
		color: white;
		background-color: #4C5382;
		height: 36px;
		line-height: 36px;
		margin: 0px 15px;
		padding: 0px 40px;
		font-size: 14px;
	}

	.close {
		text-align: center;
		color: #999999;
		background-color: #FFFFFF;
		height: 36px;
		line-height: 36px;
		margin: 0px 15px;
		padding: 0px 40px;
		font-size: 14px;
	}

	.close:active {
		color: #989898;
		background-color: #E2E2E2;
	}

	.agree:active {
		background-color: #007799;
	}
</style>