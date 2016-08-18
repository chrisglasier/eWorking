function setModel(node){
	var nodes,ind,helper;
	nodes = [[node]];
	ind = 0;
	compile(nodes,ind);
	
//bounding box bed example for development
	if(nset[node].Type !== "Product"){
		bed = scene.getObjectByName("151");
		var helper = new THREE.BoundingBoxHelper(bed, 0x000000);
		helper.update();
		helper.name = "helper";
	// visible bounding box for demo
		scene.add(helper);
	// need to pass numbers up hierarchy
		console.log(helper.box.min);
		console.log(helper.box.max);
	}
}
	
function compile(nodes,ind){	
	var n,i,v;
	n = nodes[ind][0];
	nn = nset[n];
	if(nn.Link){
	//relate grouping links to previous assembly
		links = nn.Link;
		if(nn.Type === "Grouping"){
			b = nn.Backlink[0];
			c = b;
			while(nset[b].Type === "Grouping"){
				c = b;
				b = nset[b].Backlink[0];
				if(nset[b].Type !== "Grouping"){
					break;
				}
			}
		}
		else{
			c = n;
		}
		$.each(links,function(i,v){
			nodes.push([v,c])
		});
		pass(nodes,ind);
	}
	function pass(nodes,ind){
		var node;
		ind +=1;
		node = nodes[ind];
		if(!nodes[ind]){
			return;
		}
		nn = nset[node[0]];
		if(nn.Type === "Product"){
			if(nn.hasOwnProperty("pset")){
	
				obj = setProduct(node[0]);
			}
		}
		else{
			obj = new THREE.Object3D();
			obj.name = node[0];
		}
		par = scene.getObjectByName(node[1]);
		if(!par){
			par = new THREE.Object3D();
			par.name = node[1];
			scene.add(par);
		}
		par.add(obj);
		
		if(nset[node[0]].Link){		
			compile(nodes,ind);			
		}
		else{
			pass(nodes,ind);				
		}
	}
	animate();
		
}
	
function setProduct(node){
	var style,i,v,on,pp,pi,file,txt,set,comp,r,geometry,plain,img,tex,texture,material,plane,rx,ry,rz,sc;
	on = nset[node];
	pp = on.pset;
	pi = on.image;
	file = pp +"nset.json";
	style = on.Style;
	mats = on.Material;
	txt = opr.read(file);
	set = JSON.parse(txt); 
	comp = new THREE.Object3D();
	$.each(set.Model.Link,function(i,v){
		r = posRot(set,v);
		geometry = new THREE.PlaneGeometry(r[0],r[1],1,1,1);
		color = new THREE.Color( mats );
		plain = new THREE.MeshBasicMaterial( { color: color, transparent: true, side: THREE.DoubleSide} );
		
		img = pi +set[v].Image +".png";
		tex = new THREE.TextureLoader().load( img );
		texture =	new THREE.MeshLambertMaterial( { map: tex, transparent: true, opacity:1, alphaTest: 0.5, side: THREE.DoubleSide });

		material = style === "Texture"? texture : plain;
			
		plane = new THREE.Mesh(geometry, material);
		plane.position.x = r[2];
		plane.position.y = r[3];
		plane.position.z = r[4];
		plane.rotation.x = r[5];
		plane.rotation.y = r[6];
		plane.rotation.z = r[7];
		plane.userData.parent = comp;
		comp.add(plane);
	});
	set = $.extend(true,{},nset[node]);
	$.each(set.Rotation,function(i,v){
		set.Rotation[i] *= Math.PI/180;
	});
	sc = scale;
	$.each(set.Position,function(i,v){
		set.Position[i] *= sc; 
	});
	r = set.Rotation;
	comp.rotation.set(r[0],r[1],r[2]);
	p = set.Position;
	comp.position.set(p[0],p[1],p[2]);
	comp.scale.set(sc,sc,sc);
	comp.name = node;
	return comp;
}

function mouseDown( e ) {
    e.preventDefault();
	obj = scene.getObjectByName("helper");
	scene.remove(obj)
    mouseVector.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouseVector.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( mouseVector, camera );
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length>0){
        node = intersects[ 0 ].object.parent.name;
		if(node){
			opr.config.nNode = node;
			opr.rerun(node);
		}
	}
}


