var scene;	//shared three.js scene
var calibration = {
	scale: {
		leapToThree: 1,
		riftToThree: 1
	},
	camera: {
		position: [0, 300, 0],
		look: [0, 0, -1000],
		up: [0, 1, 0]
	},
	hand: {
		height: 20
	}
}

function initAll() {
	initRift();
	initLeap();
}
