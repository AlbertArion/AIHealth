<template>
	<view class="center">
		<uni-sign-in ref="signIn" />
		<view class="userInfo">
			<view class="userInfoBtn" @click="toUserInfo">
				<cloud-image width="150rpx" height="150rpx"
					v-if="hasLogin&&userInfo.avatar_file&&userInfo.avatar_file.url" :src="userInfo.avatar_file.url" />
				<view v-else class="defaultAvatarUrl">
					<uni-icons color="#ffffff" size="50" type="person-filled" />
				</view>
			</view>
			<view class="logo-title">
				<text class="user-name" :style="`${isDefaultStyle?'':'font-size: 24px;'}`"
					v-if="hasLogin">{{userInfo.nickname||userInfo.username||userInfo.mobile}}</text>
				<text class="user-name" :style="`${isDefaultStyle?'':'font-size: 24px;'}`"
					v-else>{{$t('mine.notLogged')}}</text>
			</view>
		</view>
		<uni-grid class="grid" :column="4" :showBorder="false" :square="true">
			<uni-grid-item class="item" v-for="(item,index) in gridList" @click.native="tapGrid(index)" :key="index">
				<uni-icons class="icon" color="#4C5382" :type="item.icon" size="26"></uni-icons>
				<text class="text">{{item.text}}</text>
			</uni-grid-item>
		</uni-grid>
		<view v-if="eSuperAdmin" class="block-area" />
		<uni-list v-if="eSuperAdmin" class="center-list">
			<uni-list-item v-for="(item,i) in esuperList" :title="item.title" link :rightText="item.rightText" :key="i"
				:clickable="true" :to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true"
				:extraIcon="{type:item.icon,color:'#4C5382',size:`${isDefaultStyle?'20':'26'}`}">
			</uni-list-item>
		</uni-list>
		<view v-if="isSuperAdmin || isOperator" class="block-area" />
		<uni-list v-if="isSuperAdmin" class="center-list">
			<uni-list-item v-for="(item,i) in superList" :title="item.title" link :rightText="item.rightText" :key="i"
				:clickable="true" :to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true"
				:extraIcon="{type:item.icon,color:'#4C5382',size:`${isDefaultStyle?'20':'26'}`}">
			</uni-list-item>
		</uni-list>
		<uni-list v-if="isSuperAdmin || isOperator" class="center-list">
			<uni-list-item v-for="(item,i) in operatingList" :title="item.title" link :rightText="item.rightText"
				:key="i" :clickable="true" :to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true"
				:extraIcon="{type:item.icon,color:'#4C5382',size:`${isDefaultStyle?'20':'26'}`}">
			</uni-list-item>
		</uni-list>
		<view class="block-area" />
		<uni-list class="center-list">
			<uni-list-item v-for="(item,i) in sessionList" :title="item.title" link :rightText="item.rightText" :key="i"
				:clickable="true" :to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true"
				:extraIcon="{type:item.icon,color:'#4C5382',size:`${isDefaultStyle?'20':'26'}`}">
			</uni-list-item>
		</uni-list>
		<uni-list v-for="(sublist, index) in ucenterList" class="center-list" :key="index">
			<uni-list-item v-for="(item,i) in sublist" :title="item.title" link :rightText="item.rightText" :key="i"
				:clickable="true" :to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true"
				:extraIcon="{type:item.icon,color:'#4C5382',size:`${isDefaultStyle?'20':'26'}`}">
				<template v-slot:footer>
					<view v-if="itemShowRight(item)" class="item-footer">
						<text v-if="item.rightText" :class="`${item.rightStyle}`"
							:style="`${isDefaultStyle?'':'font-size: 16px'}`">{{itemRightText(item)}}</text>
						<view v-if="item.showBadge" class="item-footer-badge"></view>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
		<uni-list class="center-list">
			<uni-list-item v-for="(item,i) in bottomList" :title="item.title" link :rightText="item.rightText" :key="i"
				:clickable="true" :to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true"
				:extraIcon="{type:item.icon,color:'#4C5382',size:`${isDefaultStyle?'20':'26'}`}">
			</uni-list-item>
		</uni-list>
		<uni-popup ref="popupIntro" type="dialog">
			<popup-intro mode="base" @closePopup="closePopup" />
		</uni-popup>
	</view>
</template>

<script>
	import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update';
	import callCheckVersion from '@/uni_modules/uni-upgrade-center-app/utils/call-check-version';
	// #ifdef APP
	import UniShare from '@/uni_modules/uni-share/js_sdk/uni-share.js';
	const uniShare = new UniShare();
	// #endif
	const db = uniCloud.database();
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	import popupIntro from '@/components/popup/popup-intro.vue';
	import {
		eAdmin,
		oAdmin,
		sAdmin
	} from '@/common/js/admin';
	import {
		getWeChatSteps,
		monitorUpdate
	} from '@/common/js/monitor';
	export default {
		// #ifdef APP
		onBackPress({
			from
		}) {
			if (from == 'backbutton') {
				this.$nextTick(function() {
					uniShare.hide()
				})
				return uniShare.isShow;
			}
		},
		// #endif
		data() {
			return {
				gridList: [
					// {
					// 	"text": this.$t('mine.showText'),
					// 	"icon": "chat"
					// },
				],
				esuperList: [ // 企业管理
					{
						"title": "企业账户",
						"icon": "wallet-filled",
						"event": 'toECenter',
					}
				],
				superList: [ // 心脉管理
					{
						"title": "查看监测报告",
						"icon": "eye-filled",
						"event": 'toDeviceReport'
					}, {
						"title": "输入健康建议",
						"icon": "staff-filled",
						"event": 'toHealthComment'
					}, {
						"title": "AI解读的报告",
						"icon": "navigate-filled",
						"event": 'toHealthCommentAi'
					}
				],
				operatingList: [ // 运营权限
					{
						"title": "产品订单列表",
						"icon": "cart-filled",
						"event": 'toProductOrder',
					}
				],
				sessionList: [ // 用户权限
					{
						"title": "我的订单",
						"icon": "list",
						"event": 'toOrders',
					},
					// {
					// 	"title": "我的步数",
					// 	"icon": "loop",
					// 	"event": 'toSteps',
					// }, {
					// 	"title": "我的饮食",
					// 	"icon": "shop",
					// 	"event": 'toEat',
					// }, {
					// 	"title": "我的心情",
					// 	"icon": "color",
					// 	"event": 'toFeelings',
					// }, {
					// 	"title": "我的睡眠",
					// 	"icon": "eye",
					// 	"event": 'toSleep',
					// }, {
					// 	"title": "我的心率",
					// 	"icon": "heart",
					// 	"event": 'toPulse',
					// },
					{
						"title": "智能随访",
						"icon": "phone",
						"event": 'toFollowUp',
					},
					{
						"title": "Emohaa",
						"icon": "star",
						"event": 'toEmohaa',
					},
					// {
					// 	"title": "智能入组",
					// 	"icon": "calendar",
					// 	"event": 'toCheckIn',
					// }
				],
				ucenterList: [
					[ // 用户权限
						{
							"title": this.$t('mine.myScore'),
							"to": "",
							"event": "getScore",
							"icon": "paperplane",
							// "rightText": "200积分",
							// "rightAction": "getFreeScore",
							"rightStyle": "item-footer-text-red"
						},
						{
							"title": "我的反馈",
							"icon": "compose",
							"event": 'toFeedBack',
						},
						{
							"title": "我的字体",
							"icon": "font",
							"event": 'changeFontStyle',
							"rightText": '默认',
							"rightStyle": "item-footer-text-normal"
						},
						{
							"title": "我的健康建议",
							"icon": "flag",
							"event": 'toHealthTips',
						}
					],
					// [
					// // #ifdef APP-PLUS
					// {
					// 	"title": this.$t('mine.signInByAd'),
					// 	"event": 'signInByAd',
					// 	"icon": "compose"
					// },
					// // #endif
					// {
					// 	"title": this.$t('mine.signIn'),
					// 	"event": 'signIn',
					// 	"icon": "compose"
					// },
					// // #ifdef APP-PLUS
					// {
					// 	"title": this.$t('mine.toEvaluate'),
					// 	"event": 'gotoMarket',
					// 	"icon": "star"
					// },
					// //#endif
					// {
					// 	"title":this.$t('mine.readArticles'),
					// 	"to": '/pages/ucenter/read-news-log/read-news-log',
					// 	"icon": "flag"
					// }
					// // #ifdef APP-PLUS
					// , {
					// 	"title": this.$t('mine.invite'),
					// 	"event": 'share',
					// 	"icon": "redo"
					// }
					// // #endif
					// ],
					// [{
					// 	"title": this.$t('mine.feedback'),
					// 	"to": '/uni_modules/uni-feedback/pages/opendb-feedback/opendb-feedback',
					// 	"icon": "help"
					// }, {
					// 	"title": this.$t('mine.settings'),
					// 	"to": '/pages/ucenter/settings/settings',
					// 	"icon": "gear"
					// }],
					// // #ifdef APP-PLUS
					// [{
					// 	"title": this.$t('mine.about'),
					// 	"to": '/pages/ucenter/about/about',
					// 	"icon": "info"
					// }]
					// // #endif
				],
				bottomList: [{
					"title": "关于「心脉AI」",
					"icon": "help",
					"event": 'showPopup',
				}, ],
				listStyles: {
					"height": "150rpx", // 边框高度
					"width": "150rpx", // 边框宽度
					"border": { // 如果为 Boolean 值，可以控制边框显示与否
						"color": "#eee", // 边框颜色
						"width": "1px", // 边框宽度
						"style": "solid", // 边框样式
						"radius": "100%" // 边框圆角，支持百分比
					}
				}
			}
		},
		components: {
			popupIntro
		},
		computed: {
			hasSessionKey() {
				return store.sessionKey?.length > 0;
			},
			userInfo() {
				return store.userInfo;
			},
			hasLogin() {
				return store.hasLogin;
			},
			eSuperAdmin() {
				return eAdmin();
			},
			isSuperAdmin() {
				return sAdmin();
			},
			isOperator() {
				return oAdmin();
			},
			// #ifdef APP-PLUS
			appVersion() {
				return getApp().appVersion
			},
			// #endif
			appConfig() {
				return getApp().globalData.config
			},
			isDefaultStyle() {
				return store.userConfig.fontStyle == 'normal';
			}
		},
		onLoad() {
			console.log("UCenter, onLoad, userinfo: ", store.userInfo);
			//#ifdef APP-PLUS
			this.ucenterList[this.ucenterList.length - 1].unshift({
				title: this.$t('mine.checkUpdate'),
				rightText: this.appVersion.version + '-' + this.appVersion.versionCode,
				event: 'checkVersion',
				icon: 'loop',
				showBadge: this.appVersion.hasNew
			})
			//#endif
			if (!this.hasLogin) {
				this.toLogin();
			}
		},
		methods: {
			itemShowRight: function(item) {
				if (item.rightAction == 'getFreeScore') {
					item.rightText = store.userInfo.freescoretaken == false ? '200积分' : '';
				}
				return item.showBadge || item.rightText;
			},
			itemRightText: function(item) {
				if (item.title == '我的字体') {
					return this.isDefaultStyle ? '默认' : '大字体';
				} else {
					return item.rightText;
				}
			},
			onStepsUpdated() {
				uni.$emit('monitorUpdate', 'steps');
			},
			getSteps() {
				if (this.hasSessionKey) {
					getWeChatSteps(this.onStepsUpdated);
				}
			},
			toLogin() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
				});
			},
			toSettings() {
				uni.navigateTo({
					url: "/pages/ucenter/settings/settings"
				});
			},
			signIn() { //普通签到
				this.$refs.signIn.open();
			},
			signInByAd() { //看激励视频广告签到
				this.$refs.signIn.showRewardedVideoAd();
			},
			/**
			 * 个人中心项目列表点击事件
			 */
			ucenterListClick(item) {
				if (!this.hasLogin) {
					this.toLogin();
					return;
				}
				if (item.rightText && item.rightAction) {
					this[item.rightAction](item);
				} else if (item.to) {
					uni.navigateTo({
						url: item.to
					});
				} else if (item.event) {
					this[item.event](item);
				}
			},
			getFreeScore: function(item) {
				if (store.userInfo.freescoretaken) {
					return;
				}
				uni.showModal({
					title: "领取积分",
					content: "您可以领取200积分，兑换一次健康建议的体验权益。领取后，在「报告解读」中上传PDF文件或者照片，点击「生成健康建议」->「积分兑换」即可体验。",
					confirmColor: '#4C5382',
					confirmText: "领取体验",
					cancelText: "取消",
					cancelColor: '#C0C0C0',
					showCancel: true,
					success: (res) => {
						if (res.confirm) {
							store.userInfo.score = store.userInfo.score ? store.userInfo.score : 0;
							this.takeFreeScore(item, store.userInfo.score + 200);
						}
					}
				});
			},
			takeFreeScore: async function(item, targetScore) {
				await db.collection('uni-id-users')
					.where("'_id' == $env.uid")
					.update({
						score: targetScore,
						freescoretaken: true
					}).then((res) => {
						console.log("UCenter, takeFreeScore, res = " + JSON.stringify(res));
						item.rightText = "";
						item.rightAction = "";
						store.userInfo.freescoretaken = true;
						store.userInfo.score = targetScore;
						uni.switchTab({
							url: '/pages/records/records'
						});
					});
			},
			checkVersion: async function() {
				let res = await callCheckVersion()
				if (res.result.code > 0) {
					checkUpdate()
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					});
				}
			},
			toUserInfo() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
				});
			},
			tapGrid(index) {
				uni.showToast({
					// title: '你点击了，第' + (index + 1) + '个',
					title: this.$t('mine.clicked') + " " + (index + 1),
					icon: 'none'
				});
			},
			/**
			 * 去应用市场评分
			 */
			gotoMarket() {
				// #ifdef APP-PLUS
				const platform = getApp().globalData.platform;
				if (platform == "ios") {
					// 这里填写appstore应用id
					let appstoreid = this.appConfig.marketId.ios; // 'id1417078253';
					plus.runtime.openURL("itms-apps://" + 'itunes.apple.com/cn/app/wechat/' + appstoreid + '?mt=8',
						err => {
							console.log('UCenter, gotoMarket, plus.runtime.openURL err:', err);
						});
				} else if (platform == "android") {
					var Uri = plus.android.importClass("android.net.Uri");
					var uri = Uri.parse("market://details?id=" + this.appConfig.marketId.android);
					var Intent = plus.android.importClass('android.content.Intent');
					var intent = new Intent(Intent.ACTION_VIEW, uri);
					var main = plus.android.runtimeMainActivity();
					main.startActivity(intent);
				}
				// #endif
			},
			freeScore() {
				uni.showToast({
					title: this.$t('mine.freeScore'),
					icon: 'none'
				});
			},
			/**
			 * 获取积分信息
			 */
			getScore(item) {
				if (this.userInfo) {
					uni.showModal({
						content: `"${this.userInfo.nickname || '您'}" 共获得 ${store.userInfo.score || 0} 积分`,
						confirmColor: '#4C5382',
						confirmText: "知道了",
						showCancel: false
					});
				} else {
					uni.showToast({
						title: this.$t('mine.checkScore'),
						icon: 'none'
					});
				}
			},
			async share() {
				let {
					result
				} = await db.collection('uni-id-users').where("'_id' == $cloudEnv_uid").field('my_invite_code').get()
				let myInviteCode = result.data[0].my_invite_code
				if (!myInviteCode) {
					return uni.showToast({
						title: '请检查uni-config-center中uni-id配置，是否已启用 autoSetInviteCode',
						icon: 'none'
					});
				}
				let {
					appName,
					logo,
					company,
					slogan
				} = this.appConfig.about
				// #ifdef APP-PLUS
				uniShare.show({
					content: { //公共的分享类型（type）、链接（herf）、标题（title）、summary（描述）、imageUrl（缩略图）
						type: 0,
						href: this.appConfig.h5.url +
							`/#/pages/ucenter/invite/invite?code=uniInvitationCode:${myInviteCode}`,
						title: appName,
						summary: slogan,
						imageUrl: logo +
							'?x-oss-process=image/resize,m_fill,h_100,w_100' //压缩图片解决，在ios端分享图过大导致的图片失效问题
					},
					menus: [{
							"img": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/sharemenu/wechatfriend.png",
							"text": this.$t('common.wechatFriends'),
							"share": {
								"provider": "weixin",
								"scene": "WXSceneSession"
							}
						},
						{
							"img": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/sharemenu/wechatmoments.png",
							"text": this.$t('common.wechatBbs'),
							"share": {
								"provider": "weixin",
								"scene": "WXSceneTimeline"
							}
						},
						{
							"img": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/sharemenu/weibo.png",
							"text": this.$t('common.weibo'),
							"share": {
								"provider": "sinaweibo"
							}
						},
						{
							"img": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/sharemenu/qq.png",
							"text": "QQ",
							"share": {
								"provider": "qq"
							}
						},
						{
							"img": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/sharemenu/copyurl.png",
							"text": this.$t('common.copy'),
							"share": "copyurl"
						},
						{
							"img": "https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/sharemenu/more.png",
							"text": this.$t('common.more'),
							"share": "shareSystem"
						}
					],
					cancelText: this.$t('common.cancelShare'),
				}, e => {
					//callback
				})
				// #endif
			},
			async beforeGetphonenumber() {
				return await new Promise((resolve, reject) => {
					uni.showLoading({
						mask: true
					})
					wx.checkSession({
						success() {
							resolve()
							uni.hideLoading()
						},
						fail() {
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
										console.log("UCenter, loginByWeixin 失败：", e);
										reject()
									}).finally(e => {
										uni.hideLoading();
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
				if (e.detail.errMsg == "getPhoneNumber:ok") {
					store.loginSuccess(e);
					console.info("loginByWeixin, success");
				} else {
					//检查登录信息是否过期，否则通过重新登录刷新sessionKey
					await this.beforeGetphonenumber();
					uniCloud.importObject("uni-id-co").bindMobileByMpWeixin(e.detail)
						.then(e => {})
						.finally(e => {
							console.info("bindMobileByMpWeixin, success");
						})
				}
			},
			changeFontStyle: function(item) {
				const isDefaultStyle = this.isDefaultStyle;
				const content = isDefaultStyle ? '目前是默认字体，需要切换成大字体吗？' : '目前是大字体，需要切换成默认字体吗？';
				const confirmText = isDefaultStyle ? '大字体' : '默认';
				const cancelText = isDefaultStyle ? '默认' : '大字体';
				uni.showModal({
					title: '字体设置',
					content: content,
					showCancel: true,
					confirmColor: '#4C5382',
					confirmText: confirmText,
					cancelColor: '#C0C0C0',
					cancelText: cancelText,
					success: (res) => {
						if (res.confirm) {
							store.getDeviceReports();
							store.userConfig.fontStyle = isDefaultStyle ? 'large' : 'normal';
							store.refreshFont();
							item.rightText = confirmText;
						}
					}
				});
			},
			toFeedBack: function(item) {
				uni.navigateTo({
					url: '/modules/feedback/pages/feedback'
				});
			},
			toFollowUp: function(item) {
				uni.navigateTo({
					url: '/modules/followup/pages/index'
				});
			},
			toEmohaa: function() {
				uni.navigateTo({
					url: '/modules/emochat/pages/index'
				});
			},
			toCheckIn: function(item) {
				uni.navigateTo({
					url: '/modules/followup/pages/checkin'
				});
			},
			toOrders: function(item) {
				uni.navigateTo({
					url: '/modules/device/pages/myproducts'
				});
			},
			toHealthTips: function(item) {
				uni.navigateTo({
					url: '/modules/records/pages/healthtips'
				});
			},
			toHealthComment: function(item) {
				uni.navigateTo({
					url: '/modules/admin/pages/healthcomment'
				});
			},
			toHealthCommentAi: function(item) {
				uni.navigateTo({
					url: '/modules/admin/pages/healthcommentai'
				});
			},
			toDeviceReport: function(item) {
				uni.navigateTo({
					url: '/modules/admin/pages/adminhealthreport'
				});
			},
			toProductOrder: function(item) {
				uni.navigateTo({
					url: '/modules/device/pages/productorder'
				});
			},
			toECenter: function(item) {
				uni.navigateTo({
					url: '/modules/ecenter/pages/ecenter'
				});
			},
			toSteps: function(item) {
				if (!this.hasLogin) {
					this.toLogin();
					return;
				}
				if (!this.hasSessionKey) {
					const that = this;
					uni.showModal({
						title: "登录提醒",
						content: `获取运动步数需要授权，请问您是否要重新登录呢？`,
						confirmColor: '#4C5382',
						confirmText: "去授权",
						showCancel: true,
						cancelText: "取消",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								that.toLogin();
							}
						}
					});
					return;
				}
				uni.navigateTo({
					url: '/pages/monitor/stepmonitor'
				});
			},
			toEat: function(item) {
				uni.navigateTo({
					url: '/pages/monitor/eatmonitor'
				});
			},
			toFeelings: function(item) {
				uni.navigateTo({
					url: '/pages/monitor/feelingmonitor'
				});
			},
			toSleep: function(item) {
				uni.navigateTo({
					url: '/pages/monitor/sleepmonitor'
				});
			},
			toPulse: function(item) {
				uni.navigateTo({
					url: '/pages/monitor/pulsemonitor'
				});
			},
			closePopup: function() {
				this.$refs.popupIntro.close();
			},
			showPopup: function(item) {
				this.$refs.popupIntro.open();
			},
			toBeContinued: function() {
				uni.showToast({
					icon: 'none',
					title: this.$t('common.toBeContinued'),
					duration: 600
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	page {
		background-color: #f8f8f8;
	}

	/* #endif*/

	.center {
		flex: 1;
		flex-direction: column;
		background-color: #f8f8f8;
	}

	.userInfo {
		// padding: 20rpx;
		padding-top: 60px;
		background-image: url(https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/headers.png);
		flex-direction: column;
		align-items: center;
	}

	.userInfoBtn {
		background-color: transparent;
		border-radius: 6px;
		overflow: hidden;
	}

	.userInfoBtn::after {
		border: none;
	}

	.defaultAvatarUrl {
		width: 150rpx;
		height: 150rpx;
		background-color: #4C5382;
		border-radius: 100%;
		justify-content: center;
		align-items: center;
	}

	.logo-title {
		flex: 1;
		align-items: center;
		justify-content: space-between;
		flex-direction: row;
	}

	.user-name {
		height: 100rpx;
		line-height: 100rpx;
		font-size: 38rpx;
		color: #FFFFFF;
	}

	.center-list {
		background-color: white;
	}

	/*修改边线粗细示例*/
	/* #ifndef APP-NVUE */
	.center-list ::v-deep .uni-list--border:after {
		-webkit-transform: scaleY(0.2);
		transform: scaleY(0.2);
		margin-left: 80rpx;
	}

	.center-list ::v-deep .uni-list--border-top,
	.center-list ::v-deep .uni-list--border-bottom {
		display: none;
	}

	/* #endif */

	.grid {
		background-color: white;
	}

	.uni-grid .text {
		font-size: 14px;
		height: 20px;
		line-height: 20px;
		color: #3b4144;
	}

	.uni-grid .item ::v-deep .uni-grid-item__box {
		justify-content: center;
		align-items: center;
	}

	.item-footer {
		display: flex;
		height: 100%;
		flex-direction: row;
		align-items: center;
	}

	.item-footer-text-red {
		color: white;
		font-weight: bold;
		font-size: 12px;
		padding: 3px 12px;
		background-color: #AA3311;
		border-radius: 20px;
	}

	.item-footer-text-normal {
		color: #4C5382;
		font-weight: bold;
		font-size: 12px;
		padding: 3px 12px;
	}

	@keyframes fade-in-frames {
		from {
			opacity: 0.7;
		}

		to {
			opacity: 1;
		}
	}


	@keyframes fade-out-frames {
		from {
			opacity: 1;
		}

		to {
			opacity: 0.7;
		}
	}

	@keyframes shrink {
		from {
			transform: scale(1);
		}

		to {
			transform: scale(0.95);
		}
	}

	@keyframes expand {
		from {
			transform: scale(0.95);
		}

		to {
			transform: scale(1);
		}
	}

	.anim-fade-in {
		animation: fade-in-frames 0.7s ease-in forwards;
	}

	.anim-fade-out {
		animation: fade-out-frames 0.7s ease-in forwards;
	}

	.item-footer-badge {
		width: 20rpx;
		height: 20rpx;
		/* #ifndef APP-NVUE */
		border-radius: 50%;
		/* #endif */
		/* #ifdef APP-NVUE */
		border-radius: 10rpx;
		/* #endif */
		background-color: #DD524D;
	}

	.block-area {
		display: flex;
		flex-direction: column;
		height: 10px;
	}

	.item-divider {
		height: 1px;
		margin: 0px 20px;
		border-top: lightgray 1px dashed;
	}
</style>