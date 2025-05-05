<template>
	<chattycomp ref="chattycomp" from="checkin" color="#4C5382" />
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
			console.log("CheckIn, mounted");
		},
		onLoad: function(option) {
			console.log("CheckIn, onLoad");
			this.$refs.chattycomp.load(option);

		},
		onShow() {
			console.log("CheckIn, onShow");
			this.$refs.chattycomp.show();
		},
		onReady: function() {
			console.log("CheckIn, onReady");
			this.$refs.chattycomp.ready();
		},
		methods: {},
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
</style>