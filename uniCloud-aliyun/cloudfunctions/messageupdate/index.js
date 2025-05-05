'use strict';
const db = uniCloud.databaseForJQL()
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const {
		method,
		url,
		data,
		uniIdToken
	} = event;

	db.collection('chatai-msg').where({
		_id: data._id
	}).update({
		approve: data.approve ? true : false,
		disapprove: data.disapprove ? true : false,
	});

	return true;
};