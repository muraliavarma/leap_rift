var initRift = function() {
	var geometry, material, mesh;
	var controls, time = Date.now();
	var effect; // rift effect
	var objects = [];
	var ray;
	var camera, renderer;

	if (!vr.isInstalled()) {
		console.log('NPVR plugin not installed!');
	}
	vr.load(function(error) {
		if (error) {
			console.log('Plugin load failed: ' + error.toString());
		}

		try {
			init();
			animate();
		} catch (e) {
			console.log(e);
		}
	});

	var cylinderMesh = function(origin, dir) {
	    var arrow = new THREE.ArrowHelper( dir, origin );

	    var edgeGeometry = new THREE.CylinderGeometry( 2, 2, dir.length(), 6, 4 );

	    var edge = new THREE.Mesh(edgeGeometry, new THREE.MeshBasicMaterial({color: 0x0000ff}));
	    edge.rotation = arrow.rotation.clone();
	    edge.position = new THREE.Vector3().addVectors(origin, direction.multiplyScalar(0.5));
	    return edge;
	}

	function init() {

		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000);
		var pos = calibration.camera.position;
		var look = calibration.camera.look;
		camera.position = new THREE.Vector3(pos[0], pos[1], pos[2]);
		camera.lookAt(new THREE.Vector3(look[0], look[1], look[2]));

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

		renderer = new THREE.WebGLRenderer({
			devicePixelRatio: 1,
			alpha: false,
			clearColor: 0xffffff,
			antialias: true
		});

		effect = new THREE.OculusRiftEffect( renderer );

		document.body.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );
		document.addEventListener( 'keydown', keyPressed, false );
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
	function onWindowResize() {

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
		controls.update(Date.now() - time, polled ? vrstate : null);

		// renderer.render(scene, camera);
		effect.render(scene, camera, polled ? vrstate : null);

		time = Date.now();
	}
};