/**
 * Based on THREE.PointerLockControls by mrdoob.
 * @author benvanik
 */

THREE.OculusRiftControls = function ( camera ) {

	var scope = this;

	var moveObject = new THREE.Object3D();
	moveObject.position.y = 10;
	moveObject.add( camera );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;
	var SKIP_FRAMES_TO_PRINT = 20;

	this.moveSpeed = 0.12 / 0.1;
	this.jumpSpeed = 2;
	this.framesSkipped = 0;

	var _q1 = new THREE.Quaternion();
	var axisX = new THREE.Vector3( 1, 0, 0 );
	var axisZ = new THREE.Vector3( 0, 0, 1 );

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		console.log(movementX, movementY);

		_q1.setFromAxisAngle( axisZ, movementX * 0.002 );
		moveObject.quaternion.multiplySelf( _q1 );
		_q1.setFromAxisAngle( axisX, movementY * 0.002 );
		moveObject.quaternion.multiplySelf( _q1 );
	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += this.jumpSpeed;
				canJump = false;
				break;

		}

	}.bind(this);

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // a
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {

		return moveObject;

	};

	this.isOnObject = function ( boolean ) {

		isOnObject = boolean;
		canJump = boolean;

	};

	this.update = function ( delta, vrstate ) {
		if ((this.framesSkipped ++) % SKIP_FRAMES_TO_PRINT == 0) {
			// console.log(velocity.z);
		}
		//if ( scope.enabled === false ) return;

		delta *= 0.1;

		velocity.x += ( - velocity.x ) * 0.8 * delta;
		velocity.z += ( - velocity.z ) * 0.8 * delta;

		velocity.y -= 0.10 * delta;

		if ( moveForward ) velocity.z -= this.moveSpeed * delta;
		if ( moveBackward ) velocity.z += this.moveSpeed * delta;

		if ( moveLeft ) velocity.x -= this.moveSpeed * delta;
		if ( moveRight ) velocity.x += this.moveSpeed * delta;

		if (  true ) {

			velocity.y = Math.max( 0, velocity.y );

		}

		var rotation = new THREE.Quaternion();
		var angles = new THREE.Vector3();
		if (vrstate) {
			rotation.set(
					vrstate.hmd.rotation[0],
					vrstate.hmd.rotation[1],
					vrstate.hmd.rotation[2],
					vrstate.hmd.rotation[3]);
			angles.setEulerFromQuaternion(rotation, 'XYZ');
			angles.z = 0;
			angles.normalize();
			rotation.setFromEuler(angles, 'XYZ');
			rotation.normalize();
			// velocity.applyQuaternion(rotation);
		}

		moveObject.translateX( velocity.x );
		moveObject.translateY( velocity.y );
		moveObject.translateZ( velocity.z );

		if ( moveObject.position.y < 10 ) {

			velocity.y = 0;
			moveObject.position.y = 10;

			canJump = true;

		}

	};

};
