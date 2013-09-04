function initLeap() {
	var fingers = {};
	var leapController;
	leapController = new Leap.Controller({enableGestures:true});
	leapController.connect();
	leapController.on('frame', function(frame) {
		var fingerIds = {};
		var handIds = {};
		
		for (var index = 0; index < frame.pointables.length; index++) {
			if (!scene) {
				continue;
			}
			var pointable = frame.pointables[index];
			var finger = fingers[pointable.id];
			
			var pos = pointable.tipPosition;
			var direction = new THREE.Vector3(pointable.direction.x, pointable.direction.y, pointable.direction.z);
			
			var origin = new THREE.Vector3(pos.x, pos.y, pos.z);
			var axis = new THREE.Vector3(0, 1, 0);
			var angle = 0 * (Math.PI / 180);
			var matrix = new THREE.Matrix4().makeRotationAxis(axis, angle).makeTranslation(0, 0, 0);
			// origin.applyMatrix4(matrix);
			if (!finger) {
				finger = new THREE.LineBasicMaterial(origin, direction, 100, 0xff0000);
				var geometry = new THREE.CubeGeometry( 5, 5, 5 );
				var material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
				// finger = cylinderMesh(origin, direction);
				finger = new THREE.Mesh( geometry, material );
				scene.add(finger);
				fingers[pointable.id] = finger;
			}
			if (finger.position) {
				finger.position = origin;
			}
			// finger.setDirection(direction);

			fingerIds[pointable.id] = true;
		}

		//cleanup
		for (fingerId in fingers) {
			if (!fingerIds[fingerId]) {
				scene.remove(fingers[fingerId], 1);	//remove element from array
				delete fingers[fingerId];
			}
		}

		//gestures
		if(frame.gestures.length > 0) {
			var gesture = frame.gestures[0];
			if (gesture.type == 'keyTap') {
				console.log(gesture.pointableIds);
			}
		}
	});
}
