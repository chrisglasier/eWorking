//functions that support events

function storeGet(){
	var path,txt;
	path = config.store;
	txt = fs.readFileSync(path, 'utf-8');
	return JSON.parse(txt);
}

function updateStore(t,k,v){
	var vals,type;
	vals = wset.values;
	if(!vals[k]){
		vals[k] = {}
	}
	if(!vals[k][t]){
		vals[k][t] = [];
	}
//remove nr suffix if any
	vs = v.split(" ");
	name = typeof vs[1] === Number? vs[0] : v;
	ind = $.inArray(v[0],vals[k][t]);
	if(ind <0){
		vals[k][t].push(name);
	}
}

function aspects(node){
	var arr,narr,i,k,v;
	arr = [];
	i = 0; ind = -1;
	narr = $.extend(true, {}, nset[node]);
	nn = nset[node]; 
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
	$.each(narr,function(k,v){
		if(k === "Backlink" || k === "Link"){
			v = "manager";
		}
		if(k === config.aTrail.key){
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
		val = nset[node][key];
		val = val.constructor === Array? [val] : val;
		arr = [val];
	}
	
	return arr;
}
function backlinkArr(node){
	var arr;
	arr = [];
	$.each(nset[node].Backlink,function(i,v){
		arr.push([nset[v].Label,v]);
	});
	return arr;
}

function linkArr(){
	var k,l,t,p,arr,karr,ind;
	k = wset.keys;
	node = config.nNode;
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
					arr.push([karr.join(" "),v])
				});
			break;
			default:
	//can use variables as above
			karr = $.extend(true,[],k[v]);
			arr.push([karr.join(" "),v] );
		}
	});
	return arr;
}

function linkOptions(id,sn){
	var arr,ind;
	arr = linkArr();
	$.each(arr,function(i,v){
		if(v[1] === config.aTrail.fun){
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

function crosslinksContextLabels(pre,id,sn,h){
	var arr,k,v,ent,ind;
	arr = [];
	$.each(nset,function(k,v){
		if(v.Context === id){
			lab = h? v.Label : '';
			arr.push([lab,k]);
		}
	});
	ent = pre === "a"? ["Remove all","remove"] : ["Add all","add"];
	arr.unshift(ent)
	ind = 0;
	domArr(pre,ind,arr,sn);
}

function shifter(cell){
	s = nset.Blazer.style;
	$("li").css("fontWeight","normal");
	cell.css("fontWeight","bold");
	ind = cell.index();
	tp = s.foc - (ind *s.rh);
	$("#s1,#s2").css("top",tp +"px");
}

