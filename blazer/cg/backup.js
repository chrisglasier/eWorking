//functions that support events

function storeGet(){
	var path,txt;
	path = cfig.Store;
	txt = fs.readFileSync(path, 'utf-8');
	return JSON.parse(txt);
}

function updateStore(t,k,v){
	var vals,vs,name,ind,nv,diff,xsts;
	vals = wset.values;
	if(!vals[k]){
		vals[k] = {}
	}
	if(!vals[k][t]){
		vals[k][t] = [];
	}
//remove nr suffix if any
	if(typeof v ==="string"){
		vs = v.split(" ");
		name = typeof vs[1] === Number? vs[0] : v;
		ind = $.inArray(vs[0],vals[k][t]);
		if(ind <0){
			vals[k][t].push(name); 
		}
	}
	else{
		nv = v;
		xsts = false;
		$.each(vals[k][t],function(i,v){
			diff = $(nv).not(v).get();
			if(diff == ""){
				xsts = true;
			}
		});
		if(xsts === false){
			vals[k][t].push(v); 
		}
	}
}

function hTrails(node,nt){
	var arr;
	$.each(cfig.hTrail,function(k,v){
		ind = $.inArray(node,v);
		if(ind >-1){
			arr = v;
		}
	});
	if(arr){
		cfig.trail = arr;
	}
	else{
		k = node;
		arr = $.extend([],nt)
		while(nset[node].Link){
			node = nset[node].Link[0];
			arr.push(node);
		}
		cfig.trail = arr;
		cfig.hTrail[k] = arr;
	}
}

function aspects(node){
	var arr,narr,i,k,v;
	arr = [];
	i = 0; ind = -1;
	narr = $.extend(true, {}, nset[node]);
	nn = nset[node];
//if set has no links it still needs a link manager
	if(!nn.Link){
		larr = [];
		ind = 0;
		$.each(narr,function(k,v){
			larr.push([k,v])
			if(k === "Backlink"){
				ins = ind;
			}
			ind +=1;
		});
		larr.splice(ins+1,0,["Link","manager"]);
		narr = {};
		$.each(larr,function(i,v){
			narr[v[0]] = v[1];
		});
	}
//links and backlinks changed to managers
	$.each(narr,function(k,v){
		if(k === "Backlink" || k === "Link"){
			v = "manager";
		}
		if(k === bfig.aTrail.key){
			ind = i;
		}
		i +=1;
		arr.push([k,v]);
	});
	return [ind,arr];
}

function aoptions(node,key){
	var type,cont,arr;
	type = nset[node].Type;
	cont = nset[node].Context;
	arr = wset.keys[key];
	if(wset.values[key]){
		if(!arr){
			arr = wset.values[key][type];
		}
		if(!arr){
			arr = wset.values[key][cont];
		}
	}
	if(!arr){
		arr = [nset[node][key]];
	}
	return arr;
}

function backlinkArr(node){
	var arr;
	arr = [];
	$.each(nset[node].Backlink,function(i,v){
		arr.push(v);
	});
	return arr;
}

function linkArr(){
	var k,l,t,p,arr,karr,ind;
	k = wset.keys;
	node = cfig.nNode;
	l = nset[node].Label;
	t = nset[node].Type;
	p = nset[node].Link? k.link[0] : k.link[1];
	a = k.action[t]? k.action[t] : k.action.default; 
	arr = [];
	$.each(a,function(i,v){
		switch(v){
			case "Type":
				$.each(k[v],function(i,v){
					karr = $.extend(true,[],p);
					ind = $.inArray("v",karr);
					if(ind >0){
						karr[ind] = v;
					}
					arr.push(v)
				});
			break;
			default:
	//can use variables as above
			karr = $.extend(true,[],k[v]);
			arr.push(v );
		}
	});
	return arr;
}

function linkOptions(id,sn){
	var arr,ind;
	arr = linkArr();
	$.each(arr,function(i,v){
		if(v === bfig.aTrail.fun){
			ind = i;
		}
	});
	domArr("l",ind,arr,sn);
}

function crosslinkContexts(id,sn){
	var arr,ind;
	arr = [];
	$.each(wset.values.Label,function(k,v){
		arr.push(k);
	});
	ind = $.inArray(id,arr);
	domArr("a",ind,arr,sn);
}

function shifter(cell){
	s = nset.Blazer.style;
	$("li").css("fontWeight","normal");
	cell.css("fontWeight","bold");
	ind = cell.index();
	tp = s.foc - (ind *s.rh);
	$("#slider1,#slider2").css("top",tp +"px");
}

function buttoner(ind){
	var s;
	s = nset.Blazer.style;
	but = $(document.createElement("button"))
	.html("<")
	.css({
		cursor:"pointer",
		position: "absolute",
		top: ind *s.rh +"px",
		left: - s.rh/2 +"px",
		width: s.rh /2 +"px",
		height: s.rh +"px",
		color: s.lightblue,
		fontWeight: "bolder",
		backgroundColor: s.green,
		border: 0
	});
	return but;
}

function inputter(val,i,pc,type){
	var xyz;
	xyz = ["-x","x+","-y","y+","-z","z+"];
	if(type === "xyz"){
		val[i] = val[i] === 0? xyz[i] : val[i];
	}
	inp = $(document.createElement("input"))
	.val(val[i])
	.css({
		width: pc +"%",
		height: "100%",
		border: 0
	})
	.on('focus', function (e) {
		$(this)
		.one('mouseup', function () {
			$(this).select();
			return false;
		})										
		.select();
	})
	return inp;
}