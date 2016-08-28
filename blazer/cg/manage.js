//functions that support menu items.

//Events
function mown(e){
	var id,path;
	cell = $(e.target);
	id = cell.attr("id");
	switch(id){
		case "toggle":
			macToggle(cell);
		break;
		case "monitors":
			macMonitor();
		break;
		case "save":
			path = "cg/nset.json";
			macSave(nset,path);
	//during development manual save
			//storeSave();
			$("#save").html("Saved");
		break;
		case "exit":
			gui.Window.get().close();
		break;
		case "store":
	//during development
			storeSave();
		break;
		case "dev":
			gui.Window.get().showDevTools();
		break;
	}	
}

function macToggle(cell){
	var arr;
	arr = nset.Blazer.menu.toggle.reverse();
	$("#toggle").html(arr[1]);
	nRun();
}

function macMonitor(){
	var id,pre;
	id = $("#s2 li:first-child").attr("id");
	pre = id.charAt(0);
	if(pre === "m"){
		nRun();
	}
	else{
		mRun();
	}
}

function mRun(){
	var arr,ctr,ind,set,k,v,sw;
	arr = [];
	ctr = 0;
	$.each(nset,function(k,v){
		if(v.Context === "Coupler"){
			if(k === bfig.mTrail[0]){
				ind = ctr;
			}
			ctr +=1;
			arr.push([v.Label,k]);
		}
	});
	domArr("m",ind,arr,1);
	set = nset[bfig.coupler].monitor;
	ret = monArr(set);
	domArr("m",ret[0],ret[1],2);
}

function monArr(set){
	var arr,ctr,k,v,ind,sw,ret;
	arr = [];
	ctr = 0; ind = 0;
	$.each(set,function(k,v){
		if(k === bfig.mTrail[1]){
			ind = ctr;
		}
		ctr +=1;
		sw = v.show? "t" : "f";
		arr.push([k,k,sw]);
	});
	ret = [ind,arr];
	return ret;
}

function mDown(cell){
	var s,par,pid,id,ptp,ctp,cm;
	s = nset.Blazer.style;
	par = cell.parent();
	pid = par.attr("id");
	id = cell.attr("id");
	
	ptp = par.position().top;
	ctp = cell.position().top;
	
	cm = bfig.mTrail;
	if(pid === "s1"){
		node = id.slice(1);
		cm = [node];
		set = nset[node].monitor;
		ret = monArr(set);
		domArr("m",ret[0],ret[1],2);
	}
	else{
		cm[1] = id.slice(1);
		if(ptp +ctp === s.foc){
			node = cm[0];
			set = nset[cm[0]].monitor[cm[1]];
			wn = set.win;
			if(set.show){
				set.show = false;
				td = "line-through";
				win[wn].hide();
			}
			else{
				set.show = true;
				td = "none";
				nr = bfig.screen >1? bfig.screen -1 : 0;
				wn = set.win;
				win[wn].show();
			}
			cell.css("textDecoration", td);
		}
	}
	tp = s.foc - (cell.index() *s.rh);
	par.children().css("fontWeight","normal");
	cell.css("fontWeight","bold");
	ind = cell.index();
	par.css("top",tp +"px");
	bfig.mTrail = cm;
}

function storeSave(){
	var txt,path;
	txt = macStringify(wset);
	path = bfig.store;
	fs.writeFile(path, txt);
}

function macSave(set,path){
	txt = macStringify(set);
	if(txt === ""){
		lert("save failed");
		return;
	}
	fs.writeFile(path, txt );
	//storeSave();
}	

function macStringify(set,offset){
	var num,str,pre,k,v,arr,sset,i,vv,offset,json,mod;
//if set is already array
	if(set.constructor === Array){
		return set;
	}
//turn set object into array of objects
	num = []; str = [];
	$.each(set,function(k,v){
		if(isNaN(parseInt(k))){
			str.push(k);
		}
		else{
			num.push(parseInt(k));
		}
	});
	str.sort();
	num.sort(function(a,b){return a-b});
	arr = str.concat(num);
	sset = {};
	$.each(arr,function(i,v){
		sset[v] = set[v];
	});
//remove offset option?
	offset = offset? offset : "\t";
//stringifies all normally except arrays made on one line
	json = JSON.stringify(sset,function(k,v){
		if(v instanceof Array){
//this stringifies objects in arrays
			mod = [];
			$.each(v,function(i,v){
				if(v instanceof Object){
					mod.push(JSON.stringify(v));
				}
			});
			if(mod.length >0){
				return mod;
			}
			else{
				return JSON.stringify(v);
			}
		}
		else{
			return v;
		}
	},offset);
//makes stringed arrays into valid arrays (removes external quotes)
	json = json.split('"{').join("{");
	json = json.split('}"').join("}");
	json = json.split('"[').join("[");
	json = json.split(']"').join("]");
	json = json.split('\\"').join('"');
	return(json);							
}


