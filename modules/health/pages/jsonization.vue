<template>
	<view class="splash-content">
		<uni-grid class="grid-container" :square="false" :column="1" :highlight="true" @change="gridEvent"
			borderColor="transparent">
			<uni-grid-item v-for="(item,i) in gridList" :index="i" :key="i">
				<view class="grid-item-box" :style="`background-color: ${item.color};`">
					<text class="grid-item-text"
						:style="`${item.indent ? 'padding-left: 20px;' : ''} 
						${item.textColor ? 'margin-left: -12px; font-size: 16px; color: ' + item.textColor + ';' : ''}`">{{item.text}}</text>
				</view>
			</uni-grid-item>
		</uni-grid>
	</view>
</template>

<script>
	import {
		arrayBufferToString
	} from '@/common/utils/chat';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				current: -1,
				gridList: [],
			}
		},
		props: {
			question: {
				type: String
			}
		},
		mounted() {
			this.request();
		},
		methods: {
			request: function() {
				const id = Date.now();
				console.log("Jsonization, 结构化输入：\n" + this.question);
				this.requestHealthTips(this.question, id);
			},
			receive: function(json) {
				this.gridList.push({
					text: "结构化输出：",
					textColor: '#4C5382',
					color: 'transparent',
				});
				this.gridList.push({
					text: "{",
					color: '#4C5382'
				});
				for (const key in json) {
					this.gridList.push({
						text: key + '："' + json[key] + '",',
						color: '#4C5382',
						indent: true
					});
				}
				this.gridList.push({
					text: "}",
					color: '#4C5382'
				});
			},
			isValidData: function(data) {
				return typeof data === 'object' && data !== null && typeof data.content === 'string' && data.content
					.trim() !== '';
			},
			handleChatData: function(text) {
				const lines = text.split('\n');
				const data = [];
				const parseErrors = [];
				for (let i = 0; i < lines.length; i++) {
					let str = lines[i].trim();
					str = str.substring(str.indexOf('{'));
					if (str !== '') {
						try {
							const parsedData = JSON.parse(str);
							if (this.isValidData(parsedData)) {
								data.push({
									...parsedData
								});
							} else {
								parseErrors.push(str);
							}
						} catch (error) {
							parseErrors.push(str);
						}
					}
				}
				return data;
			},
			requestHealthTips: function(question, id) {
				const requestData = {
					input: {
						repo: "",
						question: question
					},
				};
				let writingContent = "";
				let requestTaskG = uni.http.streamWx('medical', id, requestData, // 注意，streamWx方法的参数顺序固定，不能变动
					(success, res) => {}, (fail, err) => {
						//用户主动中断请求，不进行提示
						if (fail.errMsg != 'request:fail abort') {
							console.log("Jsonization, 服务器网络异常，请重试");
						}
					}, (complete, id, input) => {
						console.log("Jsonization, 结构化输出：\n" + writingContent);

						this.receive(JSON.parse(writingContent));
					}, onHeadersReceivedCallBack => {}, (onChunkReceivedCallBack, id, input) => {
						const requestData = arrayBufferToString(onChunkReceivedCallBack.data);
						const lines = this.handleChatData(requestData);
						lines.forEach(line => {
							writingContent += line.content;
						});
					}
				);
			},
			gridEvent: function(e) {
				const index = e.detail.index;
				this.current = index == this.current ? -1 : index;
				const item = this.gridList[index];
				if (item.event) {
					this[item.event]();
				}
			},
			toBeContinued: function() {
				uni.showToast({
					icon: "none",
					title: this.$t('common.toBeContinued'),
					duration: 600
				});
			},
		},
	}
</script>

<style>
	.splash-content {
		display: flex;
		flex-direction: column;
	}

	.grid-container {
		margin: 10px 20px;
	}

	.grid-item-box {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: left;
		padding: 5px 15px;
	}

	.grid-item-box:active {
		opacity: 0.95;
	}

	.grid-item-text {
		text-align: center;
		color: white;
		font-size: 14px;
		font-weight: bold;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>