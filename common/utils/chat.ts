export const arrayBufferToString = (str : Iterable<number>) => {
	const uint8Array = new Uint8Array(str);
	let text = String.fromCharCode.apply(null, uint8Array);
	text = decodeURIComponent(escape(text));
	return text;
}

export const handleChatData = (text : string) => {
	const lines = text.split('\n');
	const data : any = [];
	const parseErrors : string[] = [];

	for (let i = 0; i < lines.length; i++) {
		let str = lines[i].trim();
		str = str.substring(str.indexOf('{'));
		if (str !== '') {
			try {
				const parsedData : any = JSON.parse(str);
				if (isValidData(parsedData)) {
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
}

export const handleChatNonJsonData = (text : string) => {
	const lines = text.split('\n');
	const data : any = [];

	for (let i = 0; i < lines.length; i++) {
		let str = lines[i].trim();

		if (str.includes('data: "')) {
			let regex = /"([^"]*)"/;
			let match = str.match(regex);
			if (match) {
				data.push(match[1])
			}
		}
	}

	return data;
}

export const fetchlines = (array : Array<any>) => {
	console.log("FetchLines, array = ", array);
	const data : any = [];
	for (let i = 0; i < array.length; i++) {
		let str = array[i].data?.data?.content;
		data.push(str);
		// if (str.includes('data: "')) {
		// 	let regex = /"([^"]*)"/;
		// 	let match = str.match(regex);
		// 	if (match) {
		// 		data.push(match[1])
		// 	}
		// }
	}

	return data;
}

const isValidData = (data) => {
	return typeof data === 'object' && data !== null && typeof data.content === 'string' && data.content
		.trim() !== '';
}

export function removeMarkdown(text) {
	return text
		.replace(/^- /gm, '')  // 去除无序列表标志
		.replace(/^\d+\.\s/gm, '') // 去除有序列表标志
		.replace(/\n+/g, ''); // 合并多个换行符
}