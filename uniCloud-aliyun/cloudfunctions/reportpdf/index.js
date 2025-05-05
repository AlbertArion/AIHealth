'use strict';
const fs = require('fs');

function base64ToPDF(base64String, pdfPath) {
	// 将Base64字符串转换为二进制数据
	const pdfBuffer = Buffer.from(base64String, 'base64');
	// 将Buffer写入PDF文件
	fs.writeFileSync(pdfPath, pdfBuffer);
	uniCloud.uploadFile({
		cloudPath: pdfPath,
		fileContent: pdfBuffer,
		cloudPathAsRealPath: true
	}).then((res) => {
		console.log("ReportPDF, file res = ", res);
	});
}
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const {
		method,
		url,
		data,
		uniIdToken
	} = event;

	const base64String = data.base64String;
	const pdfPath = '/report/health_report_' + data.recordId + '.pdf';
	base64ToPDF(base64String, pdfPath);

	return true;
};