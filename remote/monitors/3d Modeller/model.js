function setModel(node){
	var obj,nodes,ind,ret,max,min,xyz,last,len,w,h,sc;
//first object
	obj = new THREE.Object3D();
	obj.name = node;
	if(nset[node].hasOwnProperty("pset")){
		obj = setProduct(obj);
	}
	scene.add(obj);
	if(nset[node].Link){
		nodes = [[node]];
		ind = 0;
		nodes = compile(nodes,ind);
		sc = bounds(nodes);
		scene.scale.set(sc,sc,sc);
		animate();
	}
}
	
function compile(nodes,ind){	
	var n,i,v;
	n = nodes[ind][0];
	nn = nset[n];
//will always have link
	if(nn.Link){
		$.each(nn.Link,function(i,v){
			nodes.push([v,n])
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
		obj = new THREE.Object3D();
		obj.name = node[0];
		nn = nset[node[0]];
		if(nn.Type === "Product"){
			if(nn.hasOwnProperty("pset")){
				obj = setProduct(obj);
			}
		}
		else{
			if(nn.hasOwnProperty("Dims") && nn.Dims[0] >0){
				set = $.extend(true,{},nn);
				$.each(set.Rotation,function(i,v){
					set.Rotation[i] *= Math.PI/180;
				});
				r = set.Rotation;
				obj.rotation.set(r[0],r[1],r[2]);
			//xyz determined by relationships
				//p = set.Position;
				//obj.position.set(p[0],p[1],p[2]);
			}
		}
		
		par = scene.getObjectByName(node[1]);
		if(!par){
			par = new THREE.Object3D();
			par.name = node[1];
		}
		par.add(obj);
		
		
		
		if(nset[node[0]].Link){		
			compile(nodes,ind);			
		}
		else{
			pass(nodes,ind);				
		}
	}
	return nodes;	
}
	
function setProduct(obj){
	var node,on,pp,pi,file,txt,set,obj,r,geometry,plain,img,tex,texture,material,plane,rx,ry,rz,sc;
	on = nset[obj.name];
	pp = on.pset;
	pi = on.image;
	file = pp +"nset.json";
	style = on.Style;
	shape = on.Shape;
	mats = on.Material;
	txt = opr.read(file);
	set = JSON.parse(txt); 
	$.each(set.Model.Link,function(i,v){
		sv = $.extend(true,{},set[v]);
		geometry = new THREE.PlaneGeometry(sv.size[0],sv.size[1],1,1,1);
		color = new THREE.Color( mats );
		plain = new THREE.MeshBasicMaterial( {
			color: color, 
			transparent: true, 
			side: THREE.DoubleSide
		} );
		
		img = pi +set[v].Image +".png";
		tex = new THREE.TextureLoader().load( img );
		texture =	new THREE.MeshLambertMaterial( {
			map: tex, 
			transparent: true, 
			opacity:1, 
			alphaTest: 0.5, 
			side: THREE.DoubleSide 
		});

		material = style === "Texture"? texture : plain;
		
		plane = new THREE.Mesh(geometry, material);
		
		$.each(sv.rotation,function(i,v){
			sv.rotation[i] *= Math.PI/180;
		});
		r = sv.rotation;
		plane.rotation.set(r[0],r[1],r[2]);
		p = sv.position;
		plane.position.set(p[0],p[1],p[2]);
		
		plane.userData.parent = obj;
		obj.add(plane);
	});
	set = $.extend(true,{},nset[obj.name]);
	$.each(set.Rotation,function(i,v){
		set.Rotation[i] *= Math.PI/180;
	});
	r = set.Rotation;
	obj.rotation.set(r[0],r[1],r[2]);
	p = set.Position;
	obj.position.set(p[0],p[1],p[2]);
	return obj;
}

function bounds(nodes){
	var xyz,node,nn,cs,d,sp,obj,tot,adj,geo,mat,spaceBox,par,retmax,min,md,w,sc;
//from bottom up - only products have fixed dimensions and positioning
	nodes.reverse();
	xyz = ["x","y","z"];
	$.each(nodes,function(i,v){
		node = v[0];
		nn = nset[node];
//add space object to parent to force helpBox
		if(nn.hasOwnProperty("Space")){
			cs = nn.Space.Current;
			d = nn.Dims;
			sp = [];
			obj = scene.getObjectByName(node); 
			$.each(xyz,function(i,v){
				tot = cs[v][0] +cs[v][1]
				sp.push(d[i] +tot);
				adj = cs[v][0] === 0? -cs[v][1]/2 : (cs[v][1]-cs[v][0])/2
				obj.position[v] = adj;
			});
			geo = new THREE.BoxGeometry( sp[0], sp[1], sp[2] );
			mat = new THREE.MeshBasicMaterial( {
				wireframe:true,
				color: 0xffffff
			} );
			spaceBox = new THREE.Mesh( geo, mat );
			par = scene.getObjectByName(v[1]); 
			par.add(spaceBox);
		}	
		if(nn.hasOwnProperty("Dims")){
			ret = helpBox(node);
			max = []; min = []; 
			d = nset[node].Dims;
			$.each(xyz,function(i,v){
				min[i] = ret.min[v] === Infinity? 0 : ret.min[v];
				max[i] = ret.max[v] === -Infinity? 0 : ret.max[v];
				d[i] = min[i] <0? Math.abs(min[i]) + max[i] : max[i] - min[i];
				d[i] = Math.round(d[i])
			})
		}	
	});
	md = Math.max(d[0],d[1],d[2]);
	w = $("body").width(); h = $("body").height();
	sc = Math.min(w/md,h/md)/2;
//during development
	scene.add(ret.box);
//just to get bounding box dims
	if(spaceBox){
		par.remove(spaceBox);
	}
	return sc;
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
			if(node.charAt(0) === "s"){
				node = node.slice(1);
			}
			opr.config.nNode = node;
			opr.rerun(node);
		}
	}
}


