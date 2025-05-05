<template>
	<view class="question-item-flag">
		<view class="guide-question" @click="onGuideQuestionClick(guideQuestions[0])">
			<text class="question-text" v-if="hasLogin">{{guideQuestions[0]}}</text>
			<button v-else class="question-unlogin question-text" open-type="getPhoneNumber"
				@getphonenumber="quickLogin">{{guideQuestions[0]}}</button>
		</view>
		<view class="guide-question" @click="onGuideQuestionClick(guideQuestions[1])">
			<text class="question-text" v-if="hasLogin">{{guideQuestions[1]}}</text>
			<button v-else class="question-unlogin question-text" open-type="getPhoneNumber"
				@getphonenumber="quickLogin">{{guideQuestions[1]}}</button>
		</view>
		<view class="guide-question-container">
			<view class="guide-question" @click="onGuideQuestionClick(guideQuestions[2])">
				<text class="question-text" v-if="hasLogin">{{guideQuestions[2]}}</text>
				<button v-else class="question-unlogin question-text" open-type="getPhoneNumber"
					@getphonenumber="quickLogin">{{guideQuestions[2]}}</button>
			</view>
			<uni-icons :class="`${questionRefreshing ? 'refresh-animation' : 'refresh-still'}`" type="reload" size="20"
				color="#4C5382" @click="refreshQuestions" />
		</view>
		<view class="gap" style="height: 20px;" />
		<!-- 固定定位的快捷登录按钮 -->
		<uni-id-pages-fab-login style="display: none;" ref="uniFabLogin" />
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		data() {
			return {
				questionRefreshing: false,
			}
		},
		props: {
			guideQuestions: {
				type: Array,
				default: []
			}
		},
		computed: {
			hasLogin: function() {
				return store.hasLogin;
			},
		},
		methods: {
			getDomByClass: function(classNameSelect) {
				return uni.createSelectorQuery().in(this).select(classNameSelect);
			},
			onGuideQuestionClick: function(question) {
				if (this.hasLogin) {
					this.$emit('onGuideQuestionClick', question);
				}
			},
			refreshQuestions: function() {
				this.questionRefreshing = true;
				setTimeout(() => {
					this.questionRefreshing = false;
					this.$emit('refreshQuestions');
				}, 800);
			},
			quickLogin: function(e) {
				if (e.detail?.errMsg != "getPhoneNumber:ok") {
					console.log("ChatDialog, quickLogin, failed: ", e.detail?.errMsg)
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
	.question-item-flag {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-around;
		margin: 0px 20px;
	}

	.guide-question-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}

	.guide-question {
		padding: 10rpx 20rpx;
		margin: 10rpx 20rpx;
		color: #4C5382;
		font-size: 12px;
		border-radius: 20px;
		border: 1px solid #CBD2E4;
		overflow: hidden;
	}

	.guide-question:active {
		color: white;
		background-color: rgba(76, 83, 130, 1);
	}

	.question-text {
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
	}

	.question-unlogin {
		color: dimgray;
		font-size: 12px;
		font-family: Arial, sans-serif;
		background: transparent;
		border: none;
		padding: 0px 0px;
		line-height: 16px;
	}

	.question-unlogin::after {
		border: none;
	}

	.refresh-animation {
		animation: rotate 800ms linear infinite;
	}

	.refresh-still {}

	.refresh-still:active {
		opacity: 0.8;
	}
</style>