var scene,camera,renderer,scale;

//mouse event variables
var projector = new THREE.Projector(), 
raycaster = new THREE.Raycaster(),
mouseVector = new THREE.Vector2();

function setScene(project){
	var w,h
	w = $("body").width();
	h = $("body").height();
	scale = 1/10;
	scene = new THREE.Scene();
	
	cam = nset.Admin.monitor["3D Modeller"].scene.camera;

	ocam = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, 1, 1000 );
	ocam.position.x = 200;
	ocam.position.y = 200;
	ocam.position.z = 200;

	pcam = new THREE.PerspectiveCamera( 75, w/h, 0.1, 1000 );
	pcam.position.x = 270;
	pcam.position.y = 0;
	pcam.position.z = 300;
	camera = cam === "Perspective"? pcam : ocam
	camera.lookAt(scene.position);	
	
	renderer = new THREE.CanvasRenderer({ alpha: true });
	renderer.setClearColor( 0xdddddd, 1);
	renderer.setSize( w,h );
	document.body.appendChild( renderer.domElement );
	renderer.domElement.addEventListener( 'mousedown', mouseDown, false );

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 10, 20, 30 );
	scene.add( new THREE.AmbientLight( 0xffffff ) );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	//controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.enableZoom = false;
	
}

function animate() {
	requestAnimationFrame( animate );
	controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	render();
}

function render() {
	renderer.render( scene, camera );
}
