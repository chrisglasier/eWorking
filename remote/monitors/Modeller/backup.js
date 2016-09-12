//support for model.js
function center(){
	var w,h,mat,geoline;
	w = $("body").width();
	h = $("body").height();
	mat = new THREE.LineBasicMaterial({
        color: 0xff00ff
    });
	geo = new THREE.Geometry();
    geo.vertices.push(new THREE.Vector3(-w, 0, 0));
    geo.vertices.push(new THREE.Vector3(0, 0, 0));
	geo.vertices.push(new THREE.Vector3(0, -h, 0));
    line = new THREE.Line(geo, mat);
	scene.add(line);
}
 function singleton(node){
	obj = new THREE.Object3D();
	obj.name = node;
	if(nset[node].hasOwnProperty("pset")){
		obj = setProduct(obj);
		scene.add(obj)
	}
	else{
		html = nset[node].Label +" not sized yet";
		$("#notice").show().html(html);
	}	
}
 
function setObjects(pair){
	var obj,par,xsts;
	par = scene.getObjectByName(pair[0]);
	$.each(pair[1],function(i,v){
		obj = scene.getObjectByName(v);
		if(!obj){
			obj = new THREE.Object3D();
			obj.name = v;
		}
		if(nset[v].Type === "Product"){
			if(nset[v].hasOwnProperty("pset")){
				obj = setProduct(obj);
				xsts = true;
			}
		}			
		par.add(obj);
		console.log(obj)
	});
	if(xsts){
		return true;
	}
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
	return obj;
}

function expander(pair,xyz,pen){
	var nn,links,a,b,c,i,v,nv,nr,on,dims,size,ax,obj,m,di,adj;
	a = 0; b = 0; c = 0;
	nn = nset[pair[0]];
	links = pair[1];
	switch(nn.Float){
		case "Back": ax = "y"; d = 1; x = 1; y = 0; break;
		case "Down": ax = "z"; d = 2; break;
		default: ax = "x"; d = 0; x = 0; y = 1;
	}
	//ax = "x";  x = 0; y = 1;
//expand to contain links	
	$.each(links,function(i,v){
		nv = nset[v];
		if(nv.Type === "Product"){
			size = nv.Size;
			a = size[0] >0? a += size[0] : a;
			b = Math.max(b,size[1]);
			c = c >size[2]? c : size[2];
		}
		else{
			dims = nv.Dims;
			a = Math.max(a,dims[x]);
			b = Math.max(b,dims[y]);
			c = c >dims[2]? c : dims[2];
		}
	});
	dims = nn.Float === "Back"? [b,a,c] : [a,b,c];
	
//position products
	$.each(links,function(i,v){
		nv = nset[v];
		if(nv.Type === "Product"){
			size = nv.Size;
			obj = scene.getObjectByName(v);
			offset = (a -size[0])/2;
			m = size[0] >a/2? 1 : -1;
			obj.position.x = offset * m;
			obj.position.z = (size[2] -c)/2;
		}
	});
	obj = scene.getObjectByName(pair[0]);
	pos = [0,0,0];
	rot = $.extend(true,{},nn.Rotation);
	$.each(rot,function(i,v){
		rot[i] *= Math.PI/180;
	});
	obj.rotation.set(rot[0],rot[1],rot[2]);
//position container for margins
	m = nn.Margin;
	i = 0; di = 0;
	while(i <m.length){
		if(m[i]!== m[i+1]){
			adj = -m[i]/2;
			obj.position[xyz[i]] = adj;
			pos[i] = adj;
		}
		di +=1;
		i +=2;
	}	
//resize container for margins	
	m = nn.Margin;
	i = 0;
	di = 0;
	while(i <m.length){
		tot = m[i] +m[i+1];;
		dims[di] +=tot;
		i +=2;
		di +=1;
	}
	tot = 0; arr = [];
	//lert([nn.Label,dims])
//position multiple objs in containers
	if(links.length >1){
		$.each(links,function(i,v){
			nv = nset[v];
			if(nv.Type === "Assembly"){
				dim = nv.Dims[d];
				if(dim > 0){
					arr.push([v,dim]);
				}
				last = dim;
				tot += last;
			}
		});
		if(arr.length >1){
			min = -(tot-last)/2;
			$.each(arr,function(i,v){
				obj = scene.getObjectByName(v[0]);
				obj.position[ax] = min;
				min += v[1];
			});
		}
	
	}
	expanderBox(dims,pair,pos);
}

function expanderBox(d,pair,pos){
	var geo,mat,obj,par;
	geo = new THREE.BoxGeometry( d[0], d[1], d[2] );
	mat = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		wireframe: true
	});
	obj = new THREE.Mesh(geo,mat);
	//expBox = new THREE.Mesh(geo);
	//expBox.visible = false;
	obj.name = "g" +pair[0];
	//obj.visible = false;
	n = [];
	$.each(pos,function(i,v){
		n.push(-v);
	});
//needed when original not @0,0,0
	obj.position.set(n[0],n[1],n[2]);
	par = scene.getObjectByName(pair[0]);
	par.add(obj);
	console.log(obj)
}

function boundBox(pair,xyz){
	var ret,max,min,d
	ret = helpBox(pair[0]);
	max = []; min = []; 
	d = [];
	$.each(xyz,function(i,v){
		min[i] = ret.min[v] === Infinity? 0 : ret.min[v];
		max[i] = ret.max[v] === -Infinity? 0 : ret.max[v];
		d[i] = min[i] <0? Math.abs(min[i]) + max[i] : max[i] - min[i];
		d[i] = Math.round(d[i])
	});
	b = {};
	b.d = d;
	b.box = ret.box;
	return b;
}		
			
function helpBox(node) {
	var obj,helper,ret;
	obj = scene.getObjectByName(node);
	helper = new THREE.BoundingBoxHelper(obj, 0xff0000);
	helper.name = "helper";
	helper.update();
	ret = {};
	ret.min = helper.box.min;
	ret.max = helper.box.max;
	ret.box = helper;
	return ret;
}
