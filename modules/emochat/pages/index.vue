<template>
	<chattycomp ref="chattycomp" color="#4C5382" />
</template>

<script>
	import chattycomp from './chattycomp.vue';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js';
	export default {
		data() {
			return {}
		},
		components: {
			chattycomp
		},
		computed: {},
		mounted: function() {
			console.log("Dialog, mounted");
		},
		onLoad: function(option) {
			console.log("Dialog, onLoad");
			this.$refs.chattycomp.load(option);

		},
		onShow: function() {
			console.log("Dialog, onShow");
			this.$refs.chattycomp.show();
		},
		onHide: function() {
			console.log("Dialog, onHide");
			this.$refs.chattycomp.hide();
		},
		onReady: function() {
			console.log("Dialog, onReady");
			this.$refs.chattycomp.ready();
		}
	}
</script>

<style>
	.m-content-head-home-dialog:before {
		border: 7px solid transparent;
		border-right: 7px solid white;
		left: -13px;
		width: 0;
		height: 0;
		position: absolute;
		content: ' '
	}

	.m-content-head-customer-dialog:after {
		border: 7px solid transparent;
		border-left: 7px solid #0088BB;
		top: 10px;
		right: -13px;
		width: 0;
		height: 0;
		position: absolute;
		content: ' ';
	}

	.m-content-head-customer {
		font-size: 14px;
		padding: 10px;
		color: white;
		border: 1px #C8DAF1 solid;
		border-radius: 6px;
		background: linear-gradient(225deg, #0088BB 0%, #7872F4 100%);
		white-space: pre-wrap;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	.m-content-pdf:after {
		border: 7px solid transparent;
		border-left: 7px solid #0088BB;
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
		background: linear-gradient(225deg, #0088BB 0%, #7872F4 100%);
	}
</style>