<template>
	<view class="bind-device-container">
		<view class="bind-device-title" style="margin-top: 10px;">
			<text class="title-text">蓝牙设备</text>
			<uni-icons class="action-icon" type="scan" size="18" color="#808080" @click="scan" />
		</view>
		<view class="bind-device-tips" style="margin-top: 10px;">
			<text class="tip-text">可以通过蓝牙绑定，也可以通过右侧扫描按钮绑定</text>
		</view>
		<view v-if="hasProducts" class="bind-device-tips" style="margin-top: 25px;">
			<text class="tip-text">我的设备</text>
			<text style="flex: 1; font-size: 9px; color: #C0C0C0;">({{needPermission ? '蓝牙绑定需要位置权限' :'长按可重命名'}})</text>
			<button v-if="needPermission" class="title-button" @click="openSetting">点击授权</button>
		</view>
		<view v-if="hasProducts && showRow" class="device-list">
			<config-item v-for="(row, index) in rowList" :products="row" :id="index" :key="index" :current="current"
				@itemClick="onDeviceClick" />
		</view>
		<view v-if="current != -1 && product.device" class="bind-device-tips"
			style="margin-top: 15px; margin-bottom: 6px;">
			<text class="tip-text">配置网络</text>
			<uni-icons :style="`margin-right: 20px; ${wifing ? '' : ' visibility: hidden;'}`" class="rotate-animation"
				type="spinner-cycle" size="16" color="#B0B0B0" />
		</view>
		<view v-if="current != -1 && product.device" class="device-list"
			style="background-color: white; padding: 5px 0px; margin-bottom: 30px;">
			<wifi-item v-if="product.wifi" v-for="(wifi, index) in [product.wifi]" v-bind:wifi="wifi" :id="index"
				:key="index" @connect="connectDevice" @cancel="cancelConnection" @remove="removeDevice" />
			<!-- <wifi-item v-else-if="wifiList.length > 0" v-for="(wifi, index) in wifiList" v-bind:wifi="wifi" :id="index"
				:key="index" @connect="connectDevice" @cancel="cancelConnection" /> -->
			<view v-else-if="!wifing" class="device-empty">请先连接到WIFI</view>
		</view>
		<view v-if="finding || current == -1 || !product.device" class="bind-device-tips"
			style="margin-top: 15px; margin-bottom: 6px;">
			<text class="tip-text">找到的设备</text>
			<uni-icons :style="`margin-right: 20px; ${finding ? '' : ' visibility: hidden;'}`" class="rotate-animation"
				type="spinner-cycle" size="16" color="#B0B0B0" />
		</view>
		<view v-if="finding || current == -1 || !product.device" class="device-list"
			style="background-color: white; padding: 5px 0px; margin-bottom: 30px;">
			<device-item v-if="hasBindableDevices" v-for="(device, index) in bindableDevices" v-bind:device="device"
				:id="index" :key="index" />
			<view v-else class="device-empty">暂无可连接设备</view>
		</view>
	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store';
	import configItem from './configitem.vue';
	import deviceItem from './deviceitem.vue';
	import wifiItem from './wifiitem.vue';
	import {
		GBK,
		UTF_8,
		enctype,
		findSensorID,
		receiveData,
		scanDevice,
		structData,
		updateUserInfo
	} from '@/common/js/device';
	import {
		createProduct,
		getServiceMillis,
		updateProductOrder
	} from '@/common/js/productorder';
	import {
		getMillisNow,
		monthInMillis,
		yearInMillis
	} from '@/common/utils/timestamp';
	const db = uniCloud.database();
	const connection = {
		state: 0, // WiFi的状态，-1:超时 | 0: 正在连接服务器 | 1: 成功连接服务器
		counter: 0, // 计数器，每秒+1
		counterMax: 20, // 最大计数器20秒，超过这个就是超时了
		counterBad: 8, // 不可靠的WiFi，达到一定时间还未成功，可认为是坏的，需要考虑其他编码方式
		interval: 6, // 进度回调的间隔秒数
		failureMessage: "", // 失败信息
		retry: 0 // 重试次数
	};
	let connectingTimer = null;
	export default {
		data() {
			return {
				options: undefined,
				current: -1,
				product: {},
				showRow: true,
				rowList: [],
				devices: [],
				bindableDevices: [],
				// wifiList: [],
				mapping: {},
				opened: false,
				finding: false,
				wifing: false,
				listening: false,
				refreshing: false,
				connectedDevice: '',
				needPermission: false,
				isStartWifi: false,
				systemInfo: undefined
			}
		},
		components: {
			configItem,
			deviceItem,
			wifiItem
		},
		computed: {
			hasSensorId() {
				return this.product.device?.sensorID?.length > 0;
			},
			storedProducts() {
				return store.userInfo.products;
			},
			hasProducts() {
				return this.storedProducts?.length > 0;
			},
			hasBindableDevices() {
				return this.bindableDevices?.length > 0;
			}
		},
		onLoad(options = {}) {
			console.log("BindDevice, onLoad: ", options);
			this.options = options;
			if (this.hasProducts) {
				this.product = this.storedProducts[store.userConfig.productIndex];
				this.initRow();
			} else {
				this.initProduct();
			}
			this.fetchSystemInfo();
			this.bleAuthorize();
		},
		onUnload() {
			this.offListening();
			this.stopFinding();
			this.closeBluetooth();
		},
		onShow() {
			if (this.refreshing) {
				this.refreshing = false;
				this.getConnectedWifi();
			}
			if (this.needPermission) {
				this.needPermission = false;
				this.openBluetooth();
			}
		},
		methods: {
			initProduct: function() {
				this.product = createProduct();
				this.product.type = this.options.productType;
				this.product.name = this.options.productName;
				this.product.price = this.options.productPrice;
			},
			fetchSystemInfo: function() {
				this.systemInfo = getApp().globalData.systemInfo;
			},
			scan: function() {
				scanDevice((deviceName) => {
					if (deviceName == this.product.device?.name) {
						uni.showToast({
							icon: 'none',
							title: '扫描成功',
							duration: 1000
						});
					} else if (deviceName.includes('SSK_')) {
						uni.showToast({
							icon: 'none',
							title: '请确认当前设备已连接到电源',
							duration: 2000
						});
					} else {
						uni.showToast({
							icon: 'none',
							title: '扫描的设备不是心脉AI的产品，无法识别',
							duration: 2000
						});
					}
				});
			},
			onDeviceClick: function(index) {
				if (this.current == index) {
					this.current = -1;
				} else {
					this.current = index;
					this.product = this.storedProducts[index];
					if (this.product.wifi?.SSID?.length > 0) {
						// 已连接过wifi
					} else if (this.product.device) {
						// 已找到设备，未连接过wifi
						this.getConnectedWifi();
					} else {
						// 未找到设备
					}
				}
			},
			bleAuthorize: function() {
				if (this.systemInfo.osName == "ios") {
					this.openBluetooth();
				} else if (this.systemInfo.locationEnabled && this.systemInfo.locationAuthorized) {
					this.wxAuthorize();
				} else {
					uni.showModal({
						title: '提示',
						content: `${this.systemInfo.locationEnabled ? '微信的位置权限没有开启' : '手机定位没有开启'}`,
						confirmText: '去开启',
						confirmColor: '#4C5382',
						cancelColor: '#808080',
						success: function(res) {
							if (!res.confirm) {
								return;
							}
							uni.openAppAuthorizeSetting({
								success: function(res) {
									console.log('openAppAuthorizeSetting success', res);
								}
							});
						}
					});
				}
			},
			wxAuthorize: function() {
				const that = this;
				wx.getSetting({
					success: function(res) {
						if (res.authSetting['scope.userLocation']) {
							that.openBluetooth();
							return;
						}
						uni.showModal({
							title: '提示',
							content: '通过蓝牙绑定设备，需要开启心脉AI小程序的定位权限',
							confirmColor: '#4C5382',
							cancelColor: '#808080',
							success: function(res) {
								if (!res.confirm) {
									return;
								}
								wx.authorize({
									scope: 'scope.userLocation'
								}).then((res) => {
									that.needPermission = true;
								});
							}
						});
					}
				});
			},
			openSetting: function() {
				const that = this;
				wx.openSetting({
					success: function(res) {
						that.openBluetooth();
					}
				});
			},
			openBluetooth: function() {
				const that = this;
				this.opened = true;
				uni.openBluetoothAdapter({
					success: function(res) {
						console.log('openBluetoothAdapter success', res);
						that.findDevices();
					},
					fail: function(err) {
						console.log('openBluetoothAdapter fail', err);
						that.findDevices();
					}
				});
			},
			closeBluetooth: function() {
				if (!this.opened) {
					return;
				}
				this.opened = false;
				uni.closeBluetoothAdapter({
					success: function(res) {
						console.log('closeBluetoothAdapter success', res);
					},
					fail: function(res) {
						console.log('closeBluetoothAdapter fail', res);
					}
				});
			},
			findDevices: function() {
				const that = this;
				if (this.hasSensorId) {
					// 已有设备已绑定
					console.log("BindDevice, 已有绑定设备: " + this.product.device.name);
					if (!this.product.wifi) {
						this.product.wifi = {};
					}
					this.product.wifi.connected = 1;
				}
				console.log("BindDevice, 开始查找新设备");
				this.finding = true;
				uni.startBluetoothDevicesDiscovery({
					success: function(res) {
						console.log('startBluetoothDevicesDiscovery success', res);
						that.getDevices();
					},
					fail: function(res) {
						console.log('startBluetoothDevicesDiscovery fail', res);
						that.getDevices();
					}
				});
			},
			stopFinding: function() {
				if (!this.finding) {
					return;
				}
				this.finding = false;
				uni.stopBluetoothDevicesDiscovery({
					success: function(res) {
						console.log('stopBluetoothDevicesDiscovery success', res);
					},
					fail: function(res) {
						console.log('stopBluetoothDevicesDiscovery fail', res);
					}
				});
				uni.offBluetoothDeviceFound();
			},
			isValidDevice: function(item) {
				return item.name != '' && !item.name.includes('未知') && !item.name.includes('不支持')
			},
			getDevices: function() {
				uni.getBluetoothDevices({
					success: res => {
						console.log('getBluetoothDevices success: ', res.devices);
						// 过滤掉name为空或者未知设备的设备
						const devices = res.devices.filter(item => {
							return this.isValidDevice(item);
						});
						this.devices = devices;
						this.bindableDevices = [];
						this.mapping = {};
						devices.forEach(device => {
							this.mapping[device.name] = device;
						});
						setTimeout(() => {
							if (this.finding) {
								this.stopFinding();
							}
						}, 15000);
						uni.onBluetoothDeviceFound(res => {
							const item = res.devices[0];
							if (!this.isValidDevice(item)) {
								// 设备无效
								return;
							}
							if (this.mapping[item.name]) {
								// 设备已存在mapping中，不重复添加
								console.log("BindDevice, onDeviceFound(repeat): " + item.name);
							} else {
								this.mapping[item.name] = item;
								this.devices.push(item);
								if (item.name.startsWith('SSK_')) {
									this.bindableDevices.push(item);
									this.onDeviceFound(item);
								}
							}
						});
					},
					fail: function(res) {
						console.log('getBluetoothDevices fail', res);
					}
				});
			},
			onDeviceFound: function(device) {
				if (this.product.device) {
					if (this.product.device.name == device.name) {
						console.log("BindDevice, 找到已绑定设备: " + device.name);
						this.product.device.RSSI = device.RSSI;
						this.product.device.deviceId = device.deviceId;
						if (this.product.wifi?.connected == 1) {
							device.connected = true;
						}
						return;
					} else {
						let found = false;
						for (let i = 0; i < this.storedProducts.length; i++) {
							const item = this.storedProducts[i];
							if (item.device.name == device.name) {
								console.log("BindDevice, 找到已绑定设备: " + device.name);
								found = true;
								item.device.RSSI = device.RSSI;
								item.device.deviceId = device.deviceId;
								if (item.wifi?.connected == 1) {
									device.connected = true;
								}
								break;
							}
						}
						if (found) {
							return;
						} else {
							this.initProduct();
							this.product.device = device;
							this.addProduct(this.product);
						}
					}
				} else {
					this.product.device = device;
					if (!this.hasProducts) {
						this.addProduct(this.product);
					}
				}
				this.stopFinding();
				console.log("BindDevice, 找到新设备，准备绑定: ", device);
				const query = this.product.poid?.length > 0 ? {
					_id: this.product.poid
				} : {
					deviceName: device.name
				};
				db.collection('health-product-order').where(query).get({
					getOne: true
				}).then((res) => {
					const orderData = res.result?.data;
					if (orderData) {
						console.log("BindDevice, 从订单里找到，直接连接");
						this.product.poid = orderData._id;
						this.product.price = orderData.price;
						this.product.state = orderData.state;
						const onServiceStart = (serviceStart) => {
							orderData.serviceStart = serviceStart;
							updateProductOrder({
								_id: orderData._id
							}, {
								deviceName: device.name,
								serviceStart: serviceStart
							});
						};
						this.updateService(orderData, getMillisNow(), onServiceStart);
						this.product.device.sensorID = orderData.sid;
						if (!this.product.wifi) {
							this.product.wifi = {};
						}
						this.product.wifi.connected = orderData.sid?.length > 0 ? 1 : -1;
						this.getConnectedWifi();
						this.updateProducts();
					} else {
						console.log("BindDevice, 未从订单里找到，配置WIFI");
						this.getConnectedWifi();
					}
				}).catch((err) => {
					console.log("BindDevice, 从订单查找设备失败，配置WIFI: ", err);
				});
			},
			updateService: function(orderData, timestamp, onServiceStart = undefined) {
				if (orderData.serviceStart) {
					this.product.serviceStart = orderData.serviceStart;
				} else {
					this.product.serviceStart = String(timestamp);
					onServiceStart && onServiceStart(this.product.serviceStart);
				}
				const durationMillis = getServiceMillis(this.product.price);
				this.product.serviceEnd = String(Number(this.product.serviceStart) + durationMillis);
			},
			connectDevice: function(wifi) {
				this.product.wifi.connected = 0;
				this.product.wifi.password = wifi.password;
				this.createConnection(this.product.device.deviceId);
			},
			createConnection: function(deviceId) {
				const that = this;
				this.connectedDevice = deviceId;
				uni.createBLEConnection({
					deviceId: deviceId,
					success: function(res) {
						that.getDeviceService(deviceId);
					},
					fail: function(err) {
						console.log('createBLEConnection fail:', err);
						that.product.wifi.connected = -1;
						uni.showToast({
							icon: 'none',
							title: '设备连接失败，请确认设备已连接电源',
							duration: 2000
						});
					}
				});
			},
			cancelConnection: function(pause = false) {
				this.offListening(); // 清除监听和定时器
				if (connection.failureMessage == "") {
					connection.failureMessage = "用户手动取消";
				}
				console.log('BindDevice, 联网取消：' + connection.failureMessage); //流程结束，联网失败，附带异常情况
				if (this.product.wifi && !pause) {
					this.product.wifi.connected = -1;
				}
			},
			disconnectDevice: function() {
				console.log("BindDevice, disconnectDevice");
				if (this.connectedDevice?.length > 0) {
					const deviceId = this.connectedDevice;
					this.connectedDevice = '';
					uni.closeBLEConnection({
						deviceId: deviceId,
						success: function(res) {
							console.log('closeBLEConnection success', res);
						},
						fail: function(res) {
							console.log('closeBLEConnection fail', res);
						}
					});
				}
			},
			removeDevice: function() {
				if (this.current > -1) {
					// 移除产品信息
					this.storedProducts.splice(this.current, 1);
					if (store.userConfig.productIndex == this.current) {
						store.userConfig.productIndex = 0;
					}
					this.current = -1;
					this.initRow();
					this.refreshRow();
					// 更新用户产品信息
					updateUserInfo(store.userInfo._id, {
						products: this.storedProducts
					}, res => {
						uni.$emit('productUpdate');
						uni.showToast({
							icon: 'none',
							title: '解绑成功',
							duration: 1000
						});
					});
				}
			},
			onReadingResp: function(res) {
				console.log("BindDevice, onReadingResp: ", res);
				if (res.cmd == 0x06) { // 配置参数响应
					console.log('BindDevice, 写入WiFi参数，等待联网反馈...');
				} else if (res.cmd == 0x08) { // 读取状态响应
					if (res.networkState == 0x01 || res.networkState == 0x06) { //此时表明，硬件设备连接到服务器
						connection.state += 1; // 确认2次才认为是联网成功
						console.log("BindDevice, 联网正常" + connection.state + "次");
					} else {
						connection.state = 0; // 联网成功后，设备可能重启，因此可能存在联网成功了又断开了，此时重新开始计数，直到重启完毕，避免客户重复配置wifi
						if (res.networkState != 0x02) { // 不显示“连接断开”等容易造成困惑的信息
							if (res.networkState == 3 || res.networkState == 4) { //根据0x08状态判断连接异常情况
								connection.failureMessage = "已连接WiFi，未连接服务器（可能原因：WiFi无法连接到公网）";
							} else if (res.networkState == 0x05) {
								const str = "未找到WiFi或无法连接WiFi（可能原因：WiFi名称不对；或WiFi信号弱；或WiFi密码输入错误）";
								if (connection.failureMessage == "") { // 0x05的情况比较多，因此如果已经记录其他状态，就不用改状态覆盖了
									connection.failureMessage = str;
								}
							}
						}
					}
				} else if (res.cmd == 0x52) { // 联网状态通知响应，因为是异步不可控的，因此不参与状态判定，但是反馈的信息很有用 ，可以适当的输出部分信息
					if (res.wifiState == 6 || // WiFi模块尝试连接路由器
						res.wifiState == 7 || // WiFi模块已连接到路由器
						res.wifiState == 4 || // WiFi连接即将成功...
						res.wifiState == 1 // WiFi模块已经联网成功
					) {
						console.log("BindDevice, wifiState normal: " + res.wifiStateContent + ", " + res.rscpContent);
						connection.state += 1; // 联网正常，state+1，验证两次后，结束循环监听onConnectingResp 
					} else if (res.wifiState == 2 || res.wifiState == 3 || res.wifiState == 5) {
						console.log("BindDevice, wifiState error: " + res.wifiStateContent);
						if (res.wifiState == 2) { // 根据0x52反馈连接异常情况
							connection.failureMessage = "未找到WiFi（可能原因：WiFi名称不对；或WiFi信号弱）";
						} else if (res.wifiState == 3) {
							connection.failureMessage = "已找到WiFi，但是无法连接到WiFi（可能原因：WiFi密码输入错误）";
						} else {
							connection.failureMessage = res.wifiStateContent; // 其他情况
						}
					}
				}
			},
			onConnectSuccess: function() {
				if (this.product.wifi.connected == 1) {
					// 设备WiFi配置成功，不重复操作
					return;
				}
				this.product.wifi.connected = 1;
				this.product.wifi.enctype = enctype;
				this.product.state = 3;
				findSensorID(this.product.device, (deviceItem) => {
					this.product.device.sensorID = deviceItem.SensorID;
					this.onSensorBound();
				}, (err) => {
					this.onSensorBound();
				});
				setTimeout(() => {
					this.offListening(); // 清除监听和定时器
					uni.showToast({
						icon: 'none',
						title: '设备WIFI已连接',
						duration: 1000
					});
				}, 2000);
			},
			onConnectingResp: function() {
				if (connectingTimer) {
					return;
				}
				connectingTimer = setInterval(() => {
					console.log("BindDevice, onConnectingResp, connection = ", connection);
					connection.counter += 1;
					if (connection.state >= 2) { // 配置成功
						this.onConnectSuccess();
					} else if (connection.counter >= connection.counterMax) { //联网超时，可能是参数配置有误，或者网络不稳定
						this.offListening(); // 清除监听和定时器
						if (connection.failureMessage == "") { //无法获取具体信息时的默认提示信息，只要硬件反馈有用的信息，就会覆盖该信息
							connection.failureMessage = "WiFi连接失败（可能原因：WiFi名称不对、WiFi信号弱，或者WiFi密码输入错误）"
						}
						console.log('BindDevice, 联网超时：' + connection.failureMessage); //流程结束，联网失败，附带异常情况
						this.product.wifi.connected = -1;
						uni.showToast({
							icon: 'none',
							title: '设备WIFI连接失败，请靠近设备，确保密码输入正确',
							duration: 2000
						});
					} else if (connection.retry == 0 && connection.counter == connection.counterBad) {
						this.cancelConnection(true);
						connection.counter = 0; // 重新开始计数
						connection.retry += 1;
						setTimeout(() => {
							const wifi = this.product.wifi;
							wifi.enctype = wifi.enctype == UTF_8 ? GBK : UTF_8;
							this.connectDevice(this.product.wifi);
						}, 1000);
					}
					// else if (connection.counter % connection.interval == 0) { // 状态未确定时，每interval秒发送一次状态请求 
					// 	if (getConnected() == false) {
					// 		recordWiFiMsg("蓝牙连接已断开,无法获取到连接信息!", "red");
					// 	} else {
					// 		getDeviceState();
					// 	}
					// }
				}, 1000);
			},
			clearConnectingTimer: function() {
				if (connectingTimer) {
					clearInterval(connectingTimer);
					connectingTimer = null;
				}
			},
			initRow: function() {
				this.rowList = [];
				for (let i = 0; i < Math.floor(this.storedProducts.length / 2); i++) {
					const rowItem = [this.storedProducts[i * 2], this.storedProducts[i * 2 + 1]];
					this.rowList.push(rowItem);
				}
				if (this.storedProducts.length % 2 == 1) {
					const rowItem = [this.storedProducts[this.storedProducts.length - 1]];
					this.rowList.push(rowItem);
				}
			},
			refreshRow: function() {
				this.showRow = false;
				this.$nextTick(() => {
					this.showRow = true;
				});
			},
			addProduct(product) {
				if (!this.hasProducts) {
					store.userInfo.products = [];
					this.current = 0;
				}
				this.storedProducts.push(product);
				if (this.rowList.length == 0 || this.rowList[this.rowList.length - 1].length == 2) {
					this.rowList.push([product]);
				} else {
					this.rowList[this.rowList.length - 1].push(product);
				}
				this.refreshRow();
			},
			updateProducts() {
				const data = {
					products: this.storedProducts
				};
				if (this.current == store.userConfig.productIndex) {
					const onSuccess = (res) => {
						uni.$emit('productUpdate', this.product);
					};
					updateUserInfo(store.userInfo._id, data, onSuccess);
				} else {
					updateUserInfo(store.userInfo._id, data);
				}
			},
			onSensorBound: function() {
				const product = this.product;
				const hasPoid = product.poid?.length > 0;
				const hasSensor = product.device.sensorID?.length > 0;
				if (hasPoid) {
					const query = {
						_id: product.poid
					};
					const orderData = {
						state: 3
					};
					if (hasSensor) {
						orderData.sid = product.device.SensorID;
						orderData.deviceName = product.device.name;
					}
					updateProductOrder(query, orderData);
					this.updateProducts();
				} else if (hasSensor) {
					db.collection('health-product-order').where({
						sid: product.device.sensorID
					}).get({
						getOne: true
					}).then((res) => {
						const orderData = res.result?.data;
						if (orderData) {
							product.poid = orderData._id;
							product.price = orderData.price;
							product.state = orderData.state;
							this.updateService(orderData, timestamp);
						}
						this.updateProducts();
					}).catch((err) => {
						this.updateProducts();
					});
				} else {
					this.updateProducts();
				}
			},
			startListening: function(deviceId, serviceId, characteristicId, onComplete = undefined) {
				this.listening = true;
				uni.notifyBLECharacteristicValueChange({
					state: true, // 启用 notify 功能
					deviceId: deviceId,
					serviceId: serviceId,
					characteristicId: characteristicId,
					success: function(res) {
						console.log("BindDevice, notifyBLECharacteristicValueChange success: ", res);
						onComplete && onComplete(res);
					},
					fail: function(err) {
						console.log("BindDevice, notifyBLECharacteristicValueChange failed: ", err);
						onComplete && onComplete(err);
					}
				});
				uni.onBLECharacteristicValueChange((res) => {
					console.log("BindDevice, onBLECharacteristicValueChange: ", res);
					const uint8Array = new Uint8Array(res.value); //这里可以res.deviceId，所以可以知道是哪个设备的特征值
					const bs = new Array();
					for (var i = 0; i < uint8Array.byteLength; i++) { //将Uint8Array转成Array操作，因为Array操作方便，不考虑性能
						bs.push(uint8Array[i]);
					}
					receiveData(bs, this.onReadingResp);
				});
			},
			offListening: function() {
				if (!this.listening) {
					return;
				}
				this.listening = false;
				this.clearConnectingTimer();
				uni.offBLECharacteristicValueChange();
				this.disconnectDevice();
			},
			writingLoop: function(struct, deviceId, serviceId, characteristicId) {
				const that = this;
				let offset = 0;
				const writingTimer = setInterval(function() {
					let buffer = new Array();
					for (let i = 0; i < 20; i++) { //蓝牙一次只能发送20个字节的数据，所以这里要分批发送
						//小程序不会对写入数据包大小做限制，但系统与蓝牙设备会限制蓝牙4.0单次传输的数据大小，超过最大字节数后会发生写入错误，建议每次写入不超过20字节
						//若单次写入数据过长，iOS 上存在系统不会有任何回调的情况（包括错误回调）
						if (offset < struct.data.length) {
							buffer.push(struct.data[offset++]);
						} else {
							clearInterval(writingTimer);
							break;
						}
					}
					let dataToSend = new ArrayBuffer(buffer.length);
					let dataView = new DataView(dataToSend);
					for (let i = 0; i < buffer.length; i++) {
						dataView.setUint8(i, buffer[i]);
					};
					console.log("BindDevice, writing ble data: ", dataToSend);
					// 发送数据
					uni.writeBLECharacteristicValue({
						deviceId: deviceId,
						serviceId: serviceId,
						characteristicId: characteristicId,
						value: dataToSend,
						success: function(res) {
							console.log("BindDevice, 为蓝牙设备写入wifi配置数据: ", res);
							if (res.errCode == 0 && offset == struct.data.length) { //发送完毕  
								console.log("BindDevice, 完成为蓝牙设备写入wifi配置数据完成：", struct);
								that.onConnectingResp(); //配置成功后，开始尝试循环获取设备状态，直到设备连接到服务器
							}
						},
						fail: function(err) {
							console.log('BindDevice, 为蓝牙设备写入数据失败', err);
						}
					});
				}, 100);
			},
			sendServiceValue: function(deviceId, serviceId) {
				const that = this;
				uni.getBLEDeviceCharacteristics({
					deviceId: deviceId,
					serviceId: serviceId,
					success: function(res) {
						console.log("BindDevice, getBLEDeviceCharacteristics: ", res);
						let notifyCharacteristic = undefined;
						let writeCharacteristic = undefined;
						for (let i = 0; i < res.characteristics.length; i++) {
							const char = res.characteristics[i];
							if (char.properties.notify) {
								notifyCharacteristic = char;
							}
							if (char.properties.write) {
								writeCharacteristic = char;
							}
							if (notifyCharacteristic && writeCharacteristic) {
								break;
							}
						}
						if (notifyCharacteristic) {
							that.startListening(deviceId, serviceId, notifyCharacteristic.uuid);
						}
						if (writeCharacteristic) {
							connection.state = 0; // 初始化connection
							connection.counter = 0;
							connection.failureMessage = "";
							const wifi = that.product.wifi;
							// 构建WiFi参数配置的帧数据
							const struct = structData(wifi);
							const wid = writeCharacteristic.uuid;
							that.writingLoop(struct, deviceId, serviceId, wid);
						}
					}
				});
			},
			getDeviceService: function(deviceId) {
				const that = this;
				uni.getBLEDeviceServices({
					deviceId: deviceId,
					success(res) {
						console.log("BindDevice, 获取设备服务成功: ", res);
						res.services.forEach(service => {
							that.sendServiceValue(deviceId, service.uuid);
						});
					},
					fail(err) {
						console.log("BindDevice, 获取设备服务失败: ", err);
					}
				});
				if (this.systemInfo.osName != "ios") {
					uni.onBLEMTUChange(res => {
						console.log('BindDevice, 蓝牙最大传输带宽发生变化: ', res)
					});
					uni.setBLEMTU({
						deviceId: deviceId,
						mtu: 213, // 213字节
						success: function(res) {
							console.log('BindDevice, 设置蓝牙最大传输带宽成功: ', res)
						},
						fail: function(err) {
							console.log('BindDevice, 设置蓝牙最大传输带宽失败: ', err)
						},
					});
				}
			},
			checkNetwork(network) {
				const _5GIndex = network.SSID.indexOf('_5G');
				const isWifi5G = _5GIndex >= 0; // 手机连接的WIFI是 5G 网络，需要查找对应的 2.4G WIFI 来配置硬件设备
				const _4GSSID = isWifi5G ? network.SSID.substring(0, _5GIndex) : undefined;
				if (isWifi5G) { // WIFI与设备标准不符
					const wifi = this.product.wifi;
					if (wifi && wifi.SSID == _4GSSID) {
						// 已保存的2.4G WIFI开放可连接
						console.log('BindDevice, 当前连接的 5G WIFI 与已保存的 2.4G WIFI 属于同一个路由器，无需重复连接', network);
					} else {
						this.showNetModal(
							`手机当前连接的WIFI（${network.SSID}）是 5G 网络，请去手机WIFI配置里连接到对应的2.4G WIFI（${_4GSSID}）来配置硬件设备。`
						);
					}
				} else { // WIFI符合设备连接标准
					const connected = this.product.wifi?.connected;
					this.product.wifi = network;
					this.product.wifi.connected = connected ? connected : -1;
				}
			},
			showNetModal(content) {
				const that = this
				uni.showModal({
					title: 'WI-FI连接：',
					content: content,
					confirmText: '好的',
					confirmColor: '#4C5382',
					showCancel: false,
					success(res) {
						if (res.confirm) {
							that.refreshing = true;
						}
					}
				});
			},
			getConnectedWifi: function() {
				this.wifing = true;
				if (this.current == -1) {
					this.current == this.storedProducts.length - 1;
				}
				if (this.isStartWifi) {
					this.fetchWifiInfo();
				} else {
					uni.startWifi({
						success: res => {
							this.isStartWifi = true;
							this.fetchWifiInfo();
						},
						fail: err => {
							console.log('BindDevice, 调用uni.startWiFi失败: ', err);
							this.showNetModal('请先将手机连接到WIFI');
							this.wifing = false;
						}
					});
				}
			},
			fetchWifiInfo: function() {
				uni.getConnectedWifi({
					success: res => {
						if (res.wifi?.SSID?.length > 0) {
							console.log("BindDevice, 找到已连接的WIFI: ", res);
							if (this.product.wifi?.SSID == res.wifi.SSID) {
								// 已连接的 WiFi 和产品要求的 WiFi 相同
							} else {
								// 2.4G: 2.400GHz-2.4835GHz
								// 5G: 5.150GHz-5.825GHz
								this.checkNetwork(res.wifi);
							}
						}
					},
					fail: err => {
						console.log('BindDevice, 获取已连接的WiFi信息失败: ', err);
						uni.showToast({
							icon: 'none',
							title: '手机处于非WIFI环境下',
							duration: 1000
						});
					},
					complete: res => {
						this.wifing = false;
					}
				});
			}
		}
	}
</script>

<style>
	page {
		background-color: #f6f6f6;
	}

	.bind-device-container {
		display: flex;
		flex-direction: column;
	}

	.bind-device-title {
		display: flex;
		flex-direction: row;
		min-height: 45px;
		background-color: white;
		border-radius: 15px;
		margin: 0px 20px;
		align-items: center;
	}

	.title-text {
		flex: 1;
		font-size: 14px;
		color: #282828;
		margin-left: 20px;
	}

	.action-icon {
		margin-right: 20px;
	}

	.action-icon:active {
		opacity: 0.8;
	}

	.bind-device-tips {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0px 20px;
	}

	.tip-text {
		font-size: 11px;
		color: #B0B0B0;
		margin: 0px 6px 0px 20px;
	}

	.title-button {
		background-color: #4C5382;
		color: white;
		border-radius: 20px;
		font-size: 10px;
		line-height: 20px;
		padding: 0px 10px;
	}

	.title-button:active {
		opacity: 0.8;
	}

	.device-list {
		display: flex;
		flex-direction: column;
		margin: 0px 20px;
		border-radius: 20px;
	}

	.device-empty {
		flex: 1;
		text-align: center;
		margin: 30px 0px;
		font-size: 12px;
		color: #808080;
		font-weight: normal;
	}
</style>