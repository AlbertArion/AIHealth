<template>
	<view style="display: flex; flex-direction: column;">
		<!-- <scroll-view scroll-y="true" :refresher-enabled="true" :refresher-triggered="pulling"
		@refresherrefresh="pullRefresh"> -->
		<view class="records-actions">
			<button v-if="hasLogin" class="records-action-btn" @click="insert">+</button>
			<button v-else class="records-action-btn" open-type="getPhoneNumber" @getphonenumber="quickLogin">+</button>
		</view>
		<record-item v-if="records.length > 0" v-for="(record,index) in records" :key="index" v-bind:record="record"
			:id="index" :ref="setRef" />
		<view v-if="records.length > 0" style="height: 10px;" />
		<view v-else-if="isInQuery" class="loading-view" style="padding-top: 10px;">
			<uni-icons class="rotate-animation" type="spinner-cycle" size="24" color="#A0A0A0" />
		</view>
		<view v-else class="records-empty">您还没有报告，点击下方 "+" 按钮上传后，获得心脉AI和专家的健康解读。</view>
		<!-- 固定定位的快捷登录按钮 -->
		<uni-id-pages-fab-login style="display: none;" ref="uniFabLogin" />
		<!-- </scroll-view> -->
	</view>
</template>

<script>
	import recordItem from '@/components/records/recorditem';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';

	const db = uniCloud.database();

	export default {
		data() {
			return {
				pulling: false,
				isInQuery: false,
				isFirstLoad: true,
				recordItems: []
			}
		},
		computed: {
			hasLogin() {
				return store.hasLogin;
			},
			records() {
				return store.healthRecords;
			},
			isDefaultStyle() {
				return store.userConfig.fontStyle == 'normal';
			},
		},
		components: {
			recordItem,
		},
		onLoad: function() {
			console.log("HealthRecords, onLoad");
			this.fetchRecords();
			uni.$on('loginSuccess', this.loginSuccess);
			uni.$on('moneyPaid', (index) => {
				console.log("HealthRecords, 报告解读付款成功");
				this.recordItems[index]?.updateProgress();
			});
			uni.$on('aiPaid', (index) => {
				console.log("HealthRecords, AI报告解读付款成功");
				this.recordItems[index]?.requestAiPaidTips();
			});
		},
		onUnload: function() {
			console.log("HealthRecords, onUnload");
			uni.$off('loginSuccess');
			uni.$off('moneyPaid');
			uni.$off('aiPaid');
		},
		onTabItemTap: function() {
			console.log("HealthRecords, onTabItemTap");
			if (!store.userInfo._id) {
				console.log("HealthRecords, store.userInfo._id is empty");
				return;
			} else if (this.isFirstLoad) {
				this.isFirstLoad = false;
				console.log("HealthRecords, already fetched in onLoad function");
				return;
			}
			this.recordItems.forEach((item, index) => {
				item?.fetchTips();
			});
		},
		onShareTimeline: function() {
			let query = "";
			if (store.hasInviteCode()) {
				query = `uniInvitationCode=${store.userInfo.inviteCode}`;
			}
			console.log("Records, onShareTimeline, query = " + query);
			return {
				title: "心脉AI：持续守护您和家人的心血管健康",
				query: query
			};
		},
		onShareAppMessage: async function() {
			let path = 'pages/records/records';
			if (store.hasInviteCode()) {
				path += `?uniInvitationCode=${store.userInfo.inviteCode}`;
			}
			console.log("Records, onShareAppMessage, path = " + path);
			return {
				title: "心脉AI：持续守护您和家人的心血管健康",
				path: path
			};
		},
		methods: {
			pullRefresh: function() {
				if (!this.pulling) {
					this.pulling = true;
					setTimeout(() => {
						this.fetchRecords();
					}, 600);
				}
			},
			pullRestore: function() {
				if (this.pulling) {
					this.pulling = false;
				}
				this.isInQuery = false;
			},
			loginSuccess: function() {
				console.log("HealthRecords, loginSuccess");
				this.fetchRecords();
			},
			fetchRecords: function() {
				if (store.isHealthRecordsEmpty() && store.userInfo._id) {
					this.isInQuery = true;
					this.isFirstLoad = true;
					this.requestRecords();
				} else {
					this.pullRestore();
				}
			},
			requestRecords() {
				db.collection('health-records').where({
					uid: store.userInfo._id
				}).orderBy("timestamp", "desc").get().then((res) => {
					const recordList = res.result?.data;
					if (recordList?.length > 0) {
						store.clearHealthRecord();
						recordList.forEach(item => {
							store.pushHealthRecord(item);
						})
					}
					this.pullRestore();
				}).catch((err) => {
					console.log("HealthRecords, fetch failed: ", err);
					this.pullRestore();
				});
			},
			insert: function() {
				store.resetRecordIndex();
				uni.navigateTo({
					url: '/pages/records/newrecord'
				});
			},
			setRef(el) {
				if (el) {
					this.recordItems.push(el);
				}
			},
			quickLogin: function(e) {
				if (e.detail?.errMsg != "getPhoneNumber:ok") {
					console.log("HealthRecords, quickLogin, failed: ", e.detail?.errMsg)
					return;
				}
				let options = {}
				if (e.detail?.code) {
					options.phoneNumberCode = e.detail.code
				}
				this.$refs.uniFabLogin.login_before('weixin', true, options)
			},
		}
	}
</script>

<style>
	page {
		background-color: #F6F6F6;
	}

	.records-content {
		display: flex;
		flex-direction: column;
	}

	.records-actions {
		z-index: 10;
		position: fixed;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		right: 30px;
		bottom: 72px;
	}

	.records-action-btn {
		width: 42px;
		height: 42px;
		line-height: 36px;
		color: white;
		font-size: 25px;
		text-align: center;
		vertical-align: middle;
		background: linear-gradient(135deg, rgba(76, 83, 130, 1) 24%, rgba(95, 158, 160, 1) 100%);
		box-shadow: 0 0 20px rgba(76, 83, 130, 0.7),
			0 0 40px rgba(76, 83, 130, 0.5),
			0 0 60px rgba(76, 83, 130, 0.3);
		border-radius: 50%;
	}

	.records-action-btn:active {
		background: linear-gradient(135deg, rgba(46, 53, 100, 1) 24%, rgba(65, 128, 130, 1) 100%);
	}

	.records-empty {
		flex: 1;
		text-align: center;
		margin: 50px 30px;
		font-size: 14px;
		color: dimgray;
		font-weight: normal;
	}
</style>