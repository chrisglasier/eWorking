//support for model.js
function setObjects(node,pode,nn){
	var obj,par,products;
	obj = new THREE.Object3D();
	obj.name = node;
	par = scene.getObjectByName(pode);
//parent of first node might be made unnecessary
	if(!par){
		par = new THREE.Object3D();
		par.name = pode;
		scene.add(par);
	}
	par.add(obj);
	if(nn.Type === "Product"){
		if(nn.hasOwnProperty("pset")){
			obj = setProduct(obj);
		}	
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

//removes products identified but no size
function placeholders(node){
	$.each(nset[node].Link,function(i,v){
		fv = nset[v];
		if(fv.Type === "Product"){
			if(!fv.Size){
				fv.Size = [0,0,0];
			}
		}
	});		
}

function expander(pair,xyz){
	var length,width,height,i,v,nv,nr,on,dims,size,ax,obj,offset,m,di,adj;
	length = 0; width = 0; height = 0; offset = [];
	nn = nset[pair[0]];
	links = nn.Link;
//expand to contain links	
	$.each(links,function(i,v){
		nv = nset[v];
		if(nv.Type === "Product"){
			size = nv.Size;
			length = size[0] >0? length += size[0] : length;
			width = Math.max(width,size[1]);
			height = height >size[2]? height : size[2];
		}
		else{
			dims = nv.Dims;
			offset.push([length,dims[0],v]);
			length += dims[0];
			width = Math.max(width,dims[1]);
			height = height >dims[2]? height : dims[2];
		}
	});
	dims = [length,width,height];
	nn.offset = offset;
//position products
	$.each(links,function(i,v){
		nv = nset[v];
		if(nv.Type === "Product"){
			size = nv.Size;
			obj = scene.getObjectByName(v);
			offset = (length -size[0])/2;
			m = size[0] >length/2? 1 : -1;
			obj.position.x = offset * m;
			obj.position.z = (size[2] -height)/2;
		}
	});
//position container for margins
	m = nn.Margin;
	i = 0; di = 0;
	pos = [0,0,0];
	while(i <m.length){
		if(m[i]!== m[i+1]){
			adj = -m[i]/2;
			//obj.position[xyz[i]] = adj;
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
	arr = nn.offset;
	$.each(arr,function(i,v){
		if(v[0] >0 && v[1] >0){
			obj = scene.getObjectByName(v[2]);
			off = v[0];
			obj.position.x = -off;
		}
	});
	//obj = scene.getObjectByName(pair[0]);
	//lert([obj.position.x,dims[0]/2])
	expanderBox(dims,pair,pos);

}

function expanderBox(d,pair,pos){
	var geo,expBox,par;
	geo = new THREE.BoxGeometry( d[0], d[1], d[2] );
	mat = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		wireframe: true
	});
	obj = new THREE.Mesh(geo,mat);
	//expBox = new THREE.Mesh(geo);
	//expBox.visible = false;
	obj.name = "g" +pair[0];
	n = [];
	$.each(pos,function(i,v){
		n.push(-v);
	});
	obj.position.set(n[0],n[1],n[2]);
	par = scene.getObjectByName(pair[0]);
	par.add(obj);
}

function bounds(pair,xyz){
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
	helper = new THREE.BoundingBoxHelper(obj, 0x000000);
	helper.name = "helper";
	helper.update();
	ret = {};
	ret.min = helper.box.min;
	ret.max = helper.box.max;
	ret.box = helper;
	return ret;
}
