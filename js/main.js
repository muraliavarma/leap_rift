var initLeap = function(){

	var sceneObj = initScene();
	var scene = sceneObj.scene;
	var renderer = sceneObj.renderer;
	var camera = sceneObj.camera;

	var fingers = {};
	var spheres = {};

	controller = new Leap.Controller({enableGestures:true});
	controller.connect();
	
	controller.on('frame', function(frame) {

		var fingerIds = {};
		var handIds = {};
		
		for (var index = 0; index < frame.pointables.length; index++) {
			
			var pointable = frame.pointables[index];
			var finger = fingers[pointable.id];
			
			var pos = pointable.tipPosition;
			var dir = pointable.direction;
			
			var origin = new THREE.Vector3(pos.x, pos.y, -pos.z);
			var direction = new THREE.Vector3(dir.x, dir.y, -dir.z);
			
			if (!finger) {
				// finger = new THREE.ArrowHelper(origin, direction, 40, Math.random() * 0xffffff);
				var geometry = new THREE.CubeGeometry( 5, 5, 5 );
				var material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
				finger = new THREE.Mesh( geometry, material );
				scene.add(finger);
				fingers[pointable.id] = finger;
				// scene.add(finger);
			}
			
			finger.position = origin;
			// finger.setDirection(direction);

			if (finger.position.y < scene.children[0].position.y) {
				console.log(index);
			}
			
			fingerIds[pointable.id] = true;
		}

		for (fingerId in fingers) {
			if (!fingerIds[fingerId]) {
				scene.remove(fingers[fingerId]);
				delete fingers[fingerId];
			}
		}
		
		if(frame.gestures.length > 0) {
			var gesture = frame.gestures[0];
			if (gesture.type == 'keyTap') {
				console.log(gesture.pointableIds);
			}
		}
		renderer.render(scene, camera);
	});
};

var initScene = function() {
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.10, 1000);
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement); 
	camera.position.z = 500;
	camera.position.y = 120;
	camera.lookAt(new THREE.Vector3(0,200,0));

	var plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshNormalMaterial());
	plane.rotation.x = -Math.PI/2;
	plane.position.z = 20;
	plane.position.y = 100;
	scene.add(plane);
	return {
		scene: scene,
		renderer: renderer,
		camera: camera
	};
}

(function() {
			var camera, scene, renderer;
			var geometry, material, mesh;
			var controls, time = Date.now();

			var effect; // rift effect

			var objects = [];

			var ray;

			// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

			// var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

			// if ( havePointerLock ) {
			// 	var element = document.body;

			// 	var fullscreenchange = function ( event ) {
			// 		if (document.fullscreenElement === element ||
			// 				document.mozFullscreenElement === element ||
			// 				document.mozFullScreenElement === element) {
			// 			document.removeEventListener( 'fullscreenchange', fullscreenchange );
			// 			document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
			// 			element.requestPointerLock();
			// 		}
			// 	}

			// 	document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			// 	document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

			// 	element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			// 	var pointerlockchange = function ( event ) {
			// 		if (document.pointerLockElement === element ||
			// 				document.mozPointerLockElement === element ||
			// 				document.webkitPointerLockElement === element) {
			// 			controls.enabled = true;
			// 		} else {
			// 			controls.enabled = false;
			// 		}
			// 	}

			// 	var pointerlockerror = function ( event ) {
			// 	}

			// 	// Hook pointer lock state change events
			// 	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
			// 	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
			// 	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

			// 	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
			// 	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
			// 	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

			// 	document.body.addEventListener( 'click', function ( event ) {
			// 		// Ask the browser to lock the pointer
			// 		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			// 		element.requestPointerLock();
			// 	}, false );
			// } else {
			// 	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
			// }

			if (!vr.isInstalled()) {
				//statusEl.innerText = 'NPVR plugin not installed!';
				console.log('NPVR plugin not installed!');
			}
			vr.load(function(error) {
				if (error) {
					//statusEl.innerText = 'Plugin load failed: ' + error.toString();
					console.log('Plugin load failed: ' + error.toString());
				}

				try {
					init();
					animate();
				} catch (e) {
					//statusEl.innerText = e.toString();
					console.log(e);
				}
			});

			function init() {

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

				scene = new THREE.Scene();
				scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

				var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
				light.position.set( 1, 1, 1 );
				scene.add( light );

				var light = new THREE.DirectionalLight( 0xffffff, 0.75 );
				light.position.set( -1, - 0.5, -1 );
				scene.add( light );

				controls = new THREE.OculusRiftControls( camera );
				scene.add( controls.getObject() );

				// var cameraHelper = new THREE.CameraHelper(camera);
				// scene.add(cameraHelper);

				ray = new THREE.Raycaster();
				ray.ray.direction.set( 0, -1, 0 );

				// floor
				geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
				geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

				// materials
				var materials = []; 
				materials.push( new THREE.MeshBasicMaterial( { color: 0x222222 }) );
				materials.push( new THREE.MeshBasicMaterial( { color: 0xdddddd }) );

				var side = geometry.widthSegments;

				for( var i = 0; i < geometry.faces.length; i ++ ) {
				    geometry.faces[ i ].materialIndex = (i + parseInt(i / side)) % 2;
				}

				mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
				scene.add( mesh );

				// objects

				// geometry = new THREE.CubeGeometry( 20, 20, 20 );

				// for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

				// 	var face = geometry.faces[ i ];
				// 	face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
				// 	face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
				// 	face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
				// 	face.vertexColors[ 3 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

				// }

				// for ( var i = 0; i < 250; i ++ ) {

				// 	material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

				// 	var mesh = new THREE.Mesh( geometry, material );
				// 	mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
				// 	mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
				// 	mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
				// 	scene.add( mesh );

				// 	material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

				// 	objects.push( mesh );

				// }

				//

				renderer = new THREE.WebGLRenderer({
					devicePixelRatio: 1,
					alpha: false,
					clearColor: 0xffffff,
					antialias: true
				});

				effect = new THREE.OculusRiftEffect( renderer );

				document.getElementById('ipd').innerHTML =
						effect.getInterpupillaryDistance().toFixed(3);

				document.body.appendChild( renderer.domElement );

				//

				window.addEventListener( 'resize', onWindowResize, false );
				document.addEventListener( 'keydown', keyPressed, false );
			}

			function onWindowResize() {
			}

			function keyPressed (event) {
				switch ( event.keyCode ) {
					case 79: // o
						effect.setInterpupillaryDistance(
								effect.getInterpupillaryDistance() - 0.001);
						document.getElementById('ipd').innerHTML =
								effect.getInterpupillaryDistance().toFixed(3);
						break;
					case 80: // p
						effect.setInterpupillaryDistance(
								effect.getInterpupillaryDistance() + 0.001);
						document.getElementById('ipd').innerHTML =
								effect.getInterpupillaryDistance().toFixed(3);
						break;

					case 70: // f
						if (!vr.isFullScreen()) {
							vr.enterFullScreen();
						} else {
							vr.exitFullScreen();
						}
						e.preventDefault();
						break;

					case 32: // space
						vr.resetHmdOrientation();
						e.preventDefault();
						break;
				}
			}

			var vrstate = new vr.State();
			function animate() {
				vr.requestAnimationFrame(animate);

				controls.isOnObject( false );

				ray.ray.origin.copy( controls.getObject().position );
				ray.ray.origin.y -= 10;

				var intersections = ray.intersectObjects( objects );
				if ( intersections.length > 0 ) {
					var distance = intersections[ 0 ].distance;
					if ( distance > 0 && distance < 10 ) {
						controls.isOnObject( true );
					}
				}

				// Poll VR, if it's ready.
				var polled = vr.pollState(vrstate);
				controls.update( Date.now() - time, polled ? vrstate : null );

				renderer.render( scene, camera );
				// effect.render( scene, camera, polled ? vrstate : null );

				time = Date.now();
			}
		})();