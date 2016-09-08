function setModel(){
	var node,nodes;
	node = opr.legitNode(opr.cfig.nNode);
	nodes = opr.assemblyArray(node);
	topDown(nodes);
}

function topDown(nodes){
	var nn;
	$.each(nodes,function(i,v){
		nn = nset[v[0]];
		setObjects(v[0],v[1],nset[v[0]]);
//to rebuild from bottom up -- products identified not sized
		if(nn.Type === "Assembly"){
			nn.Dims = [0,0,0];
		}
	});
	if(nset[nodes[0][0]].Type !== "Product"){
		bottomUp(nodes);
	}
	else{
		obj = new THREE.Object3D();
		obj.name = nodes[0][0];
		obj = setProduct(obj);
		scene.add(obj);
		md = Math.max.apply(Math,nset[nodes[0][0]].Size);
		setScale(md);
	}
	animate();
}

function bottomUp(nodes){
	var xyz,md;
	xyz = ["x","y","z"];
	nodes.reverse();
	$.each(nodes,function(i,v){
		if(nset[v[0]].Link){
			expander(v,xyz);		
			ret = bounds(v,xyz);
			nset[v[0]].Dims = ret.d;
			//lert(["RET",nset[v[0]].Label,nset[v[0]].Dims])
		}
	});
	//scene.add(ret.box);
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


