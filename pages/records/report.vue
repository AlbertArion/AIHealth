<template>
	<view class="report-root">
		<smart-pdf ref="reportpdf" :base-id="id" :file-url="fileUrl" :report-index="reportIndex"
			:report-tips="reportTips" :is-expert="isExpert" :report-time="reportTime" :from="from" />
	</view>
</template>

<script>
	import smartPdf from '@/components/smartpdf/smartpdf.vue';
	export default {
		data() {
			return {
				id: undefined,
				fileUrl: undefined,
				reportIndex: undefined,
				reportTips: undefined,
				isExpert: undefined,
				from: undefined,
				reportTime: undefined
			}
		},
		components: {
			smartPdf
		},
		computed: {
			isPc() {
				return getApp().globalData.systemInfo?.deviceType === 'pc';
			}
		},
		onLoad(option = undefined) {
			if (option) {
				this.id = option.id;
				this.fileUrl = option.fileUrl;
				this.reportIndex = Number(option.reportIndex);
				this.reportTips = option.reportTips;
				this.isExpert = Boolean(option.isExpert);
				this.reportTime = option.reportTime;
				this.from = option.from;
			}
		},
		methods: {
			download: function() {
				this.$refs.reportpdf.generatePDF();
			}
		}
	}
</script>

<style>
	.report-root {
		display: flex;
		flex-direction: column;
	}
</style>