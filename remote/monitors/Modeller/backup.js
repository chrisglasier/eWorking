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
			clone = nset[v].clone;
			cloner = scene.getObjectByName(clone);
			if(clone && cloner){
				obj = cloner.clone( new THREE.Object3D(),false);
			}
			else{
				obj = new THREE.Object3D();
			}
			obj.name = v;
		}
		if(nset[v].Type === "Product"){
			if(nset[v].hasOwnProperty("pset")){
				obj = setProduct(obj);
				xsts = true;
			}
		}	
		par.add(obj);
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
	var nn,links,a,b,c,parr,ax,d,x,y,i,v,nv,size,obj,offset,m,di,adj,pos,rot;
	nn = nset[pair[0]];
	links = pair[1];
	nn.Dims = [0,0,0];
	a = 0; b = 0; c = 0;
	parr = [];
//float
	switch(nn.Float){
		case "Back": ax = "y"; d = 1; x = 1; y = 0; break;
		case "Down": ax = "z"; d = 2; break;
		default: ax = "x"; d = 0; x = 0; y = 1;
	}
//expand to contain products	
	$.each(links,function(i,v){
		nv = nset[v];
		if(nv.Type === "Product"){
			parr.push(v);
			size = nv.Size;
			a = size[0] >0? a += size[0] : a;
			b = Math.max(b,size[1]);
			c = c >size[2]? c : size[2];
		}
		else{
			a = a >0? a += nv.Dims[x] : nv.Dims[x];
			b = Math.max(b,nv.Dims[y]);
			c = c >nv.Dims[2]? c : nv.Dims[2];
		}
	});
	nn.Dims = d === 1? [b,a,c] : [a,b,c];
//position products
	$.each(parr,function(i,v){
		nv = nset[v];
		if(nv.Type === "Product"){
			size = nv.Size;
			obj = scene.getObjectByName(v);
			offset = (nn.Dims[0] -size[0])/2;
			m = size[0] >nn.Dims[0]/2? 1 : -1;
			obj.position.x = offset * m;
			obj.position.z = (size[2] -nn.Dims[2])/2;
		}
	});
//Assembly pos rot
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
			adj = m[i] >m[i+1]? -m[i]/2 : m[i+1]/2;
			obj.position[xyz[di]] = adj;
			pos[di] = adj;
			
		}
		di +=1;
		i +=2;
	}
	
//	resize container for margins	
	m = nn.Margin;
	nn.Margin = d === 1? [m[2],m[3],m[0],m[1],m[4],m[5]] : [m[0],m[1],m[2],m[3],m[4],m[5]]; 	
	i = 0;
	di = 0;
	while(i <m.length){
		tot = m[i] +m[i+1];;
		nn.Dims[di] +=tot;
		i +=2;
		di +=1;
	}
//position multiple objs in containers
	arr = []; tot = 0;
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
	expanderBox(nn.Dims,pair,pos,rot);
}

function expanderBox(d,pair,pos,rot){
	var geo,mat,mesh,obj;
	
	color = new THREE.Color("white");
	mat = new THREE.LineBasicMaterial({
        color: color
    });
	geo = new THREE.Geometry();
	gv = geo.vertices;
	
	gv.push(new THREE.Vector3(d[0]/2, -d[1]/2, -d[2]/2));
	gv.push(new THREE.Vector3(-d[0]/2, -d[1]/2, -d[2]/2));
	gv.push(new THREE.Vector3(-d[0]/2, d[1]/2, -d[2]/2));
	
	gv.push(new THREE.Vector3(d[0]/2, d[1]/2, -d[2]/2));
	gv.push(new THREE.Vector3(d[0]/2, -d[1]/2, -d[2]/2));
	
    line = new THREE.Line(geo, mat);
	line.name = "x" +pair[0];
	n = [];
	$.each(pos,function(i,v){
		n.push(-v);
	});
//needed when original not @0,0,0
	line.position.set(n[0],n[1],n[2]);
	obj = scene.getObjectByName(pair[0]);
	obj.add(line);
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
