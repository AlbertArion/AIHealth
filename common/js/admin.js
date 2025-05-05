import {
	store
} from "@/uni_modules/uni-id-pages/common/store";

function sAdmin() { // 超级管理员

	// 钟医生 ID: "65f232b355b3372a1f686094"
	// 高浩然 ID: "65f1c4cce0ec199b18d53c81"
	// 张涛 ID："65f552a08b0da4a4e4a7192b"
	return (store.userInfo._id == "65f232b355b3372a1f686094") ||
		(store.userInfo._id == "65f1c4cce0ec199b18d53c81") ||
		(store.userInfo._id == "65f552a08b0da4a4e4a7192b");
}

function eAdmin() { // 企业管理员

	// 心脉AI管理员:
	// 钟医生 ID: "65f232b355b3372a1f686094" mobile: "13683082173"
	// 高浩然 ID: "65f1c4cce0ec199b18d53c81" mobile: "18910646380"
	// 张涛 ID: "65f552a08b0da4a4e4a7192b" mobile: "18301570096"

	// 客户管理员：
	// [智纤至康] 陈云飞 mobile: "17321215813"
	// [银川极智] 李萍 mobile: "18595169704"
	// [康康血压] 曾总 mobile: "18901012321"
	// [睡睡康] 卢东旭 mobile: "13734023099"
	// [质子科技] 汪总 mobile: "13750850999"
	// [滴答一检] 家贝 mobile: "18510685099"
	// [超思科技] 于经理 mobile: "18515319836"
	// [益体康] 赵总 mobile: "18500339106"

	return (store.userInfo._id == "65f232b355b3372a1f686094") ||
		(store.userInfo._id == "65f1c4cce0ec199b18d53c81") ||
		(store.userInfo._id == "65f552a08b0da4a4e4a7192b") ||
		(store.userInfo.mobile == "17321215813") ||
		(store.userInfo.mobile == "18595169704") ||
		(store.userInfo.mobile == "18901012321") ||
		(store.userInfo.mobile == "13734023099") ||
		(store.userInfo.mobile == "13750850999") ||
		(store.userInfo.mobile == "18510685099") ||
		(store.userInfo.mobile == "18515319836") ||
		(store.userInfo.mobile == "18500339106");
}

function oAdmin() { // 运营管理员 

	// 客户运营管理员：
	// [睡睡康] 赵德 mobile: "15835056948"

	return (store.userInfo.mobile == "15835056948");
}

function freeTrial() {
	return false && (store.userInfo._id == "65f1c4cce0ec199b18d53c81");
}

function privileged() {
	return store.userInfo._id == "65f1c4cce0ec199b18d53c81";
}

function printScore() {
	uniCloud.database().collection("uni-id-users")
		.field('_id, nickname, mobile, score')
		.orderBy('score desc')
		.get()
		.then((res) => {
			console.log("Admin, scoreList: ", res);
		});
}

export {
	sAdmin,
	eAdmin,
	oAdmin,
	freeTrial,
	privileged,
	printScore
}