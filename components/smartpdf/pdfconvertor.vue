<template>
</template>

<script>
	import {
		noticeMap
	} from '../../common/js/record';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	// npm install pdfjs-dist@3.11.174
	// import * as pdfjsLib from "pdfjs-dist/build/pdf.js";

	// 设置PDFjs的workerSrc路径
	// pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';
	export default {
		data() {
			return {
				images: []
			}
		},
		methods: {
			// async convertPDFToImage(pdfUrl) {
			// 	const loadingTask = pdfjsLib.getDocument(pdfUrl);
			// 	const pdf = await loadingTask.promise;
			// 	const numPages = pdf.numPages;
			// 	const images = [];

			// 	for (let pageNum = 1; pageNum <= numPages; pageNum++) {
			// 		const page = await pdf.getPage(pageNum);
			// 		const viewport = page.getViewport({
			// 			scale: 1.5
			// 		}); // 可以调整scale来改变图片大小
			// 		const canvas = document.createElement('canvas');
			// 		const context = canvas.getContext('2d');

			// 		canvas.height = viewport.height;
			// 		canvas.width = viewport.width;

			// 		const renderContext = {
			// 			canvasContext: context,
			// 			viewport: viewport
			// 		};

			// 		await page.render(renderContext).promise;
			// 		images.push(canvas.toDataURL('image/jpeg', 1.0)); // 可以调整第二个参数来改变图片质量
			// 	}
			// 	console.log("PDFConvertor, images: ", images);
			// 	return images;
			// }
			requestAiTips: function(record) {
				// const pdfUrl = record.fileUrl;
				// this.convertPDFToImage(pdfUrl).then(images => {
				// 	this.images = images;
				// });
				if (uni.subscribed) {
					this.aiRecord(record);
				} else {
					uni.subscribed = true;
					uni.requestSubscribeMessage({
						tmplIds: [noticeMap["recordTips"].template_id],
						complete: (data) => {
							this.aiRecord(record);
						}
					});
				}
			},
			aiRecord: function(record) {
				if (record?._id) {
					uniCloud.database().collection('health-records').where({
							_id: record._id
						})
						.update({
							isPaidForAI: true
						}).then((res) => {
							this.sendSms(record);
						}).catch((err) => {
							console.log("PDFConvertor, AI要解读的报告获取失败, err: ", err);
						}).finally(() => {});
				} else {
					uni.showToast({
						title: '报告不存在',
						icon: 'none',
						duration: 600
					});
				}
			},
			sendSms: function(record) {
				uniCloud.callFunction({
					name: 'aisms',
					data: {
						data: {
							nickname: store.userInfo.nickname,
							rid: record?._id,
						}
					}
				}).then((res) => {
					console.log("PDF convert, sendSms success");
				});
			},
		}
	}
</script>

<style>
</style>