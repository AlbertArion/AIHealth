// Description: This module provides the data processing functions for the ECG data.

function getAverage(arr) {
	let sum = 0;
	arr.forEach((value) => {
		sum += value;
	});
	return sum / arr.length;
}

function fetchAFRRIs() {
	const rris = [];
	return rris;
}

function fetchAFWave() {
	const waveArray = [];
	return waveArray;
}

function fetchECGWave() {
	const waveArray = [];
	return waveArray;
}

export {
	fetchAFRRIs,
	fetchAFWave,
	fetchECGWave
}