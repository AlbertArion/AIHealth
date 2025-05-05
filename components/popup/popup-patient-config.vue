<template>
	<view class="user-info">
		<view class="info-item" style="padding-left: 0px; margin-bottom: 10px;">
			<uni-icons class="info-item-picker" size="20" color="#ffffff" type="smallcircle'" />
			<text class="info-item-picker-text">首都医科大学附属北京安贞医院</text>
		</view>
		<view class="info-item">
			<text class="info-item-label">姓名：</text>
			<input class="info-item-text" v-model="user.realname" placeholder-class="info-item-text-placeholder"
				placeholder="请输入您的真实姓名" type="text" cursor-color="#4C5382" />
		</view>
		<view class="info-item">
			<text class="info-item-label">医生：</text>
			<input class="info-item-text" v-model="user.doctor" placeholder-class="info-item-text-placeholder"
				placeholder="请输入您的主治医生" type="text" cursor-color="#4C5382" />
		</view>
		<view class="bottom-action-area">
			<view style="flex: 1;" />
			<button class="info-submit-btn" @click="onSubmit">更新个人资料</button>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		name: "popupConfig",
		data() {
			return {
				user: {
					realname: store.userConfig.realname,
					doctor: store.userConfig.doctor
				},
			};
		},
		methods: {
			updateUser() {
				this.user.realname = store.userConfig.realname;
				this.user.doctor = store.userConfig.doctor;
			},
			onSubmit() {
				if (this.user.realname?.length > 0 || this.user.doctor?.length > 0) {
					store.userConfig.realname = this.user.realname;
					store.userConfig.doctor = this.user.doctor;
					uni.showToast({
						title: '更新成功',
						icon: 'none',
						duration: 600
					});
					this.$emit('closePopup', true);
				} else {
					uni.showToast({
						title: '请输入您的信息',
						icon: 'none',
						duration: 600
					});
				}
			}
		}
	}
</script>

<style>
	.user-info {
		display: flex;
		flex-direction: column;
		padding: 24px 20px;
		border-radius: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		background-color: #4C5382;
		align-items: flex-start;
	}

	.info-item {
		display: flex;
		flex-direction: row;
		padding: 6px 20px;
		align-items: center;
	}

	.info-item-label {
		font-size: 14px;
		color: white;
		width: 60px;
		height: 20px;
		align-self: center;
		font-weight: bold;
	}

	.info-item-picker {
		flex: 1;
		margin-right: 10px;
	}

	.info-item-picker-text {
		font-size: 16px;
		color: white;
		font-weight: bold;
	}

	.info-item-text {
		flex: 1;
		height: 20px;
		font-size: 14px;
		background-color: white;
		color: #4C5382;
		font-weight: bold;
		border: solid 1px #a9a9a9;
		border-radius: 20px;
		padding: 3px 15px;
	}

	.info-item-text-placeholder {
		font-size: 14px;
		color: darkgray;
	}

	.bottom-action-area {
		display: flex;
		flex-direction: row;
		width: 100%;
		margin-top: 15px;
	}

	.info-submit-btn {
		color: #4C5382;
		border-radius: 20px;
		border: 1px #a9a9a9 solid;
		font-size: 14px;
		padding: 0px 15px;
		margin-right: 20px;
		font-weight: bold;
		background: linear-gradient(135deg, #D7DCFC 30%, #FBFDF0 100%);
	}
</style>