<template>
	<view class="item-row" :style="`${id == 0 ? '' : 'border-top: 1px #B0B0B0 solid;'}`">
		<view class="item-info">
			<view style="display: flex; flex-direction: row;">
				<image style="width: 18px; height: 18px; margin-right: 6px;" mode="widthFix"
					src="https://mp-d4a734ea-9ae3-4448-99e4-ae65b22bbaf4.cdn.bspapp.com/xinmai/device/wifi.png" />
				<text class="item-name">{{wifiName}}</text>
			</view>
			<view class="password-container">
				<input v-if="passwordShow" class="item-password" :disabled="isDisable" v-model="password"
					cursor-color="#4C5382" maxlength="16" placeholder-class="item-password-placeholder"
					placeholder="请输入WIFI密码" type="text" />
				<input v-else class="item-password" :disabled="isDisable" v-model="password" cursor-color="#4C5382"
					maxlength="16" placeholder-class="item-password-placeholder" placeholder="请输入WIFI密码"
					type="password" />
				<uni-icons :type="`${passwordShow ? 'eye-filled' : (isDisable ? 'locked' : 'eye')}`" size="20"
					:color="`${passwordShow ? '#4C5382' : '#808080'}`" @click="changePassword" />
			</view>
		</view>
		<view class="item-column">
			<view :class="`${wifi.connected == 0 ? 'action-button-light' : 'action-button'}`" @click="connect">
				{{wifiState}}
			</view>
			<view class="action-button-deep" @click="remove">解绑</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	export default {
		data() {
			return {
				password: '',
				passwordShow: false
			}
		},
		props: {
			id: {
				type: Number
			},
			wifi: {
				type: Object
			}
		},
		mounted() {
			console.log("WifiItem, mounted, wifi: ", this.wifi);
			if (this.hasWifiPassword) {
				this.password = this.wifi.password;
			} else if (this.wifi.connected == 1) {
				this.password = '*********';
			}
		},
		computed: {
			isDisable() {
				return this.wifi.connected >= 0;
			},
			wifiState() {
				const stateArr = ['连接', '取消', '重置'];
				return stateArr[Number(this.wifi.connected + 1).toFixed(0)];
			},
			wifiName() {
				return this.wifi.SSID?.length > 0 ? this.wifi.SSID : '数据网络';
			},
			hasPassword() {
				return this.password?.length > 0;
			},
			hasWifiPassword() {
				return this.wifi.password?.length > 0;
			}
		},
		methods: {
			changePassword: function() {
				if (this.isDisable) return;
				this.passwordShow = !this.passwordShow;
			},
			connect: function() {
				if (this.wifi.connected == -1) { // 未连接，点击连接
					if (this.hasPassword) {
						this.passwordShow = false;
						this.wifi.password = this.password;
						this.$emit('connect', this.wifi);
					} else {
						uni.showToast({
							icon: 'none',
							title: '请输入WIFI密码'
						});
					}
				} else if (this.wifi.connected == 0) { // 连接中，点击取消
					this.wifi.connected = -1;
					this.$emit('cancel');
				} else { // 已连接，点击重置
					const that = this;
					uni.showModal({
						content: '重置后，设备将断开，需要重新输入WIFI密码再次连接',
						confirmColor: '#4C5382',
						confirmText: "确定",
						showCancel: true,
						cancelText: "取消",
						cancelColor: '#808080',
						success(res) {
							if (res.confirm) {
								that.password = '';
								that.wifi.connected = -1;
							}
						}
					});
				}
			},
			remove: function() {
				const that = this;
				uni.showModal({
					title: "解绑设备",
					content: "解绑后，设备对应的产品信息将被移除，需要重新绑定。确定要解绑该设备吗？",
					confirmColor: '#4C5382',
					showCancel: true,
					success: function(res) {
						if (res.confirm) {
							that.$emit('remove');
						}
					}
				});
			}
		}
	}
</script>

<style>
	.item-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px 0px;
		margin: 0px 20px;
	}

	.item-column {
		display: flex;
		flex-direction: column;
		margin: 10px 0px 10px 10px;
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin-right: 10px;
	}

	.item-name {
		font-size: 14px;
		color: #808080;
		margin-right: 10px;
	}

	.password-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		border: 1px solid lightgray;
		border-radius: 6px;
		margin-top: 3px;
		padding: 0px 10px;
	}

	.item-password {
		flex: 1;
		font-size: 12px;
		color: #808080;
		word-spacing: 3px;
		white-space: nowrap;
		overflow: hidden;
	}

	.item-password-placeholder {
		color: lightgray;
	}

	.action-button {
		background-color: #4C5382;
		color: white;
		border-radius: 20px;
		font-size: 10px;
		padding: 4px 20px;
	}

	.action-button:active {
		opacity: 0.8;
	}

	.action-button-light {
		background-color: lightgray;
		color: #282828;
		border-radius: 20px;
		font-size: 10px;
		padding: 4px 20px;
	}

	.action-button-light:active {
		opacity: 0.8;
	}

	.action-button-deep {
		background-color: indianred;
		color: white;
		border-radius: 20px;
		font-size: 10px;
		padding: 4px 20px;
		margin-top: 6px;
	}

	.action-button-deep:active {
		opacity: 0.8;
	}
</style>