function setModel(){
	var node,pairs;
	center();
	node = opr.cfig.nNode;
	pairs = opr.pairAssembler(node);
	if(!pairs){
		singleton(node);
		md = Math.max.apply(Math,nset[node].Size);
		setScale(md);
	}
	else{
		topDown(pairs,node);
	}
	animate();
}

function topDown(pairs,node){
	var par,xsts,products,html;
	par = new THREE.Object3D();
	par.name = pairs[0][0];
	scene.add(par);	
	
	$.each(pairs,function(i,v){
		xsts = setObjects(v);
		if(xsts){
			products =  true;
		}
		nset[v[0]].Dims = [0,0,0];
	});
	if(products ){
		bottomUp(pairs);
	}
	else{
		html = nset[node].Label+ " trail has no products"
		$("#notice").show().html(html);
	}
}

function bottomUp(pairs){
	var xyz,last,md;
	xyz = ["x","y","z"];
	//pairs.shift();
	pairs.reverse();
	$.each(pairs,function(i,v){
		expander(v,xyz);		
		ret = boundBox(v,xyz);
		nset[v[0]].Dims = ret.d;
	});
	scene.add(ret.box);
	md = Math.max(ret.d[0],ret.d[1],ret.d[2]);
	setScale(md);
}

function setScale(md){
	w = $("body").width();
	h = $("body").height();
	sc = Math.min(w/md,h/md)/2;
	scene.scale.set(sc,sc,sc);
}

function mouseDown( e ) {
	var intersects,node
    e.preventDefault();
//to pick at mesh behind
	//obj = scene.getObjectByName("helper");
	//scene.remove(obj)
	$("#picking").html("Picking:off");
    mouseVector.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouseVector.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( mouseVector, camera );
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length>0){
        node = intersects[ 0 ].object.parent.name;
		if(node){
			if(node.charAt(0) === "s"){
				node = node.slice(1);
			}
			opr.cfig.nNode = node;
			opr.rerun(node);
		}
	}
}
	
function mouseUp( e ) {	
	var cam,xyz;
	e.preventDefault();
//keep last camera position after orbit
	cam = nset.Admin.monitor["Modeller"].scene.camera;
	xyz = "x,y,z".split(",");
	$.each(xyz,function(i,v){
		cam.position[i] = Math.round(camera.position[v]);
	});
	$("#cam").html(cam.type +": "+cam.position);
}


