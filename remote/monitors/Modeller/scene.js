//mouse event variables
var projector = new THREE.Projector(), 
raycaster = new THREE.Raycaster(),
mouseVector = new THREE.Vector2();

function setScene(project){
	var w,h,cam,ocam,pcam,p
	w = $("body").width();
	h = $("body").height();
	
	renderer = new THREE.CanvasRenderer({ alpha: true });
	renderer.setClearColor( 0xdddddd, 1);
	renderer.setSize( w,h );
	document.body.appendChild( renderer.domElement );
	renderer.domElement.addEventListener( 'mousedown', mouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', mouseUp, false );
	renderer.domElement.addEventListener('mousewheel', mouseScroll, false);
	
	scene = new THREE.Scene();
	
	cam = nset.Admin.monitor["Modeller"].scene.camera;
	
	ocam = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, 1, 1000 );
	pcam = new THREE.PerspectiveCamera( 75, w/h, 0.1, 1000 );

	camera = cam.type === "Perspective"? pcam : ocam
	camera.lookAt(scene.position);
	p = cam.position;
	camera.position.set(p[0],p[1],p[2])
	
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 10, 20, 30 );
	scene.add( new THREE.AmbientLight( 0xffffff ) );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	//controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.enableZoom = true;
}

function animate() {
	requestAnimationFrame( animate );
	controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	
	render();
}

function render() {

	renderer.render( scene, camera );
}
