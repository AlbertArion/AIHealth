<template>
	<view class="container">
		<view :class="`${current=='simulator'?'transformer flip':'transformer'}`">
			<chattyai ref="chattyai" class="chattyai" color="#4C5382" from="home" @start-call="startCall"
				@start-record="startRecord" @end-record="endRecord" @ai-speaking="aiSpeaking"
				:style="`${isChatVisible ? '' : 'display: none;'}`" />
			<simulator ref="simulator" class="simulator" @end-call="endCall" @input-send="inputSend"
				:style="`${isSimulatorVisible ? '' : 'display: none;'}`" />
		</view>
	</view>
</template>

<script>
	import chattyai from '@/components/chat/chattyai.vue';
	import simulator from '@/components/chat/simulator.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		data() {
			return {
				/**
				 * 当前页面，可选范围：[chattyai, simulator]
				 */
				current: 'chattyai',
				isChatVisible: true,
				isSimulatorVisible: false
			}
		},
		components: {
			chattyai,
			simulator,
		},
		computed: {},
		mounted: function() {
			console.log("ChatAi, mounted");
		},
		onLoad: function(option) {
			console.log("ChatAi, onLoad");
			this.$refs.chattyai?.load(option);
			uni.$on('askMore', (params) => {
				this.$refs.chattyai?.sendMessage({
					message_type: 2,
					record: store.healthRecords[params.index],
					isAsked: params.isAsked,
					content: params.content,
					question: params.question
				});
			});
		},
		onUnload: function() {
			uni.$off('askMore');
			this.$refs.chattyai?.unload();
		},
		onShow() {
			console.log("ChatAi, onShow");
			this.$refs.chattyai?.show();
			this.$refs.simulator?.show();
		},
		onHide() {
			console.log("ChatAi, onHide");
			this.$refs.chattyai?.hide();
			this.$refs.simulator?.hide();
		},
		onReady: function() {
			console.log("ChatAi, onReady");
			this.$refs.chattyai?.ready();
		},
		onShareTimeline: function() {
			let query = "";
			if (store.hasInviteCode()) {
				query = `uniInvitationCode=${store.userInfo.inviteCode}`;
			}
			console.log("ChatAi, onShareTimeline, query = " + query);
			return {
				title: "心脉AI：持续守护您和家人的心血管健康",
				query: query
			};
		},
		onShareAppMessage: async function() {
			let path = 'pages/chatai/dialog';
			if (store.hasInviteCode()) {
				path += `?uniInvitationCode=${store.userInfo.inviteCode}`;
			}
			console.log("ChatAi, onShareAppMessage, path = " + path);
			return {
				title: "心脉AI：持续守护您和家人的心血管健康",
				path: path,
				// imageUrl: 'https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/cloudstorage/mp_share.jpg'
				// imageUrl: 'http://api.cskzcn.com/img/mp_share.jpg',
			};
		},
		methods: {
			flipping: function() {
				if (this.current == 'chattyai') {
					this.current = 'simulator';
					this.isSimulatorVisible = true;
					setTimeout(() => {
						this.isChatVisible = false;
						this.$refs.simulator.startCall();
					}, 200);
					// uni.hideTabBar();
				} else {
					this.current = 'chattyai';
					setTimeout(() => {
						this.isChatVisible = true;
					}, 100);
					setTimeout(() => {
						this.isSimulatorVisible = false;
						this.$refs.chattyai.autoScroll();
						// uni.showTabBar();
					}, 500);
					setTimeout(() => {
						this.$refs.chattyai.endCall();
					}, 1000);
				}
			},
			startCall: function() {
				this.flipping();
				uni.report('start-call', {
					page: 'pages/chatai/dialog',
					action: 'start',
					timestamp: Date.now(),
					uid: store.userInfo._id,
					uname: store.userInfo.nickname,
				});
			},
			endCall: function() {
				this.flipping();
				uni.report('start-call', {
					page: 'pages/chatai/dialog',
					action: 'end',
					timestamp: Date.now(),
					uid: store.userInfo._id,
					uname: store.userInfo.nickname,
				});
			},
			startRecord: function() {
				this.$refs.simulator?.startRecord();
			},
			endRecord: function() {
				this.$refs.simulator?.endRecord();
			},
			aiSpeaking: function(text) {
				this.$refs.simulator.aiSpeaking(text);
			},
			inputSend: function(message) {
				this.$refs.chattyai.inputSend(message);
			}
		}
	}
</script>

<style>
	.container {
		position: fixed;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		perspective: 1000px;
	}

	.transformer {
		position: fixed;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		transform-style: preserve-3d;
		transition: transform 800ms;
	}

	.flip {
		transform: rotateY(180deg);
	}

	.chattyai {
		background-color: #9DB6F9;
		backface-visibility: hidden;
	}

	.simulator {
		position: fixed;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		background: linear-gradient(0deg, #4C5382 3%, #000000 100%);
		transform: rotateY(180deg);
		backface-visibility: hidden;
	}

	.m-content-head-home-dialog:before {
		border: 7px solid transparent;
		border-right: 7px solid white;
		left: -13px;
		width: 0;
		height: 0;
		position: absolute;
		content: ' '
	}

	.m-content-head-customer {
		font-size: 14px;
		/* border: 0.5px #a7dddf solid; */
		background: linear-gradient(90deg, #95C972 0%, #00B6F0 100%);
		border-radius: 6px;
		padding: 10px;
		white-space: pre-wrap;
		color: white;
		/* -webkit-user-select: text; */
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	.m-content-head-customer:active {
		opacity: 0.8;
	}

	.m-content-head-customer:after {
		border: 7px solid transparent;
		border-left: 7px solid #00B6F0;
		top: 10px;
		right: -13px;
		width: 0;
		height: 0;
		position: absolute;
		content: ' ';
	}

	.m-content-pdf:after {
		border: 7px solid transparent;
		border-left: 7px solid #00B6F0;
		top: 10px;
		right: -13px;
		width: 0;
		height: 0;
		position: absolute;
		content: ' ';
	}

	.m-content-pdf {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 14px;
		padding: 10px;
		color: white;
		border: 1px #C8DAF1 solid;
		border-radius: 6px;
		background: linear-gradient(90deg, #95C972 0%, #00B6F0 100%);
	}
</style>