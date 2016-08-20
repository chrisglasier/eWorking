//functions that set up sliders and control events 

function tRun(){
	var sl,p;
	sl = $("#z1");
	sl.empty();
	p = "t";
	s = nset.Blazer.style;
	$.each(config.trail,function(i,v){
		sl
		.append($(document.createElement("a"))
			.html(nset[v].Label)
			.attr({
				id: p +v,
				title: p +v
			})
			.css({
				height: s.rh +"px",
				lineHeight:  s.rh +"px"
			})
		)
	});
	tide(2);
}

function tide(pos){
	var cell,tl,left;
	nt = config.nTrail;
	par = nt[nt.length-pos]? nt[nt.length-pos] : nt[nt.length-1];
	cell = $("#t" +par); 
	$("#z1 a").css("fontWeight","normal");
	cell.css("fontWeight","bold");
	w = gui.Window.get();
	ww = w.width;
	cl = cell.position().left; 
	cw = cell.width();
	left = (ww -cw)/2 -cl;
	$("#z1").css("left", left +"px");
}

function nRun(){
	var nTrail,node,t,s,links,sl,atop,t1,ind,t2;
	nTrail = config.nTrail;
	node = config.nNode;
	t = !nset[node].Link? nTrail.slice(0,-1) : nTrail;
	t2 = t[t.length-2];
	t1 = t[t.length-1];
	pre = "n";
	
//Couplers
	if(node === "Couplers" || t1 === "Couplers"){
		arr = ["Couplers"];
		ind = 0;
		domArr(pre,ind,arr,1);
		arr = nset["Couplers"].Link;
		ind = $.inArray(config.coupler,arr)
		domArr(pre,ind,arr,2);
	}
	
//static links for clone/delete/number/action/monitor kvs
	else if(config.mode === "links"){
			t = nset[node].Link? t2 : t1;
			arr = nset[t].Link;
			ind = $.inArray(node,arr);
			domArr(pre,ind,arr,1);
		}
		
//end of trail
	else if(!nset[node].Link){
		arr = nset[t1].Link;
		ind = $.inArray(node,arr);
		domArr(pre,ind,arr,1);
		ret = aspects(node);
		pre = "k";
		domArr(pre,ret[0],ret[1],2,1);
	}
	
//default
	else{
		arr = nset[t2].Link;
		ind = $.inArray(t1,arr);
		domArr(pre,ind,arr,1);
		if(nset.Blazer.menu.toggle[0] === "Names"){
			arr = nset[t1].Link;
			ind = -2;
			domArr(pre,ind,arr,2);
		}
		else{
			ret = aspects(node);
			pre = "k";
			domArr(pre,ret[0],ret[1],2,1);
		}
	}
}

function down(e){
	var cell,pid;
	$("#save").html("Save");
	config.mode = "";
//switch
	cell = typeof e === "object"? $(e.target) : $(e);
	if(cell.prop("tagName") === "SPAN"){
		cell = cell.parent();
	}
	pre = cell.attr("id").charAt(0);
	
	switch(pre){
		case "t": tDown(cell); break;
		case "n": nDown(cell); break;
		case "m": mDown(cell); break;
		default: aDown(cell);
	}
}

function tDown(cell){
	var node;			
	node = cell.attr("id").slice(1);
	config.nNode = node;
	ind = cell.index();
	config.nTrail = config.trail.slice(0,ind +1);
	nRun();
	tide(2);
	monitor = nset[config.coupler].monitor[config.monitor];
	ww = win[monitor.win].window;
//the code for clearing canvas not finalised yet
	//ww.start(node);
}

function nDown(cell){
	var cell,node,nTrail,ind,coupler;
	node = cell.attr("id").slice(1);
	if(node === "Couplers"){
		return;
	}
	nt = config.nTrail;
	par = parseInt(cell.parent().attr("id").slice(1));
	nt = par === 1? nt = nt.slice(0,-1) : nt;
	nt.push(node);
	config.nTrail = nt;
	config.trail = nt;
	//nr = nset[node].Link? 2 : 1;
	//tide(nr);
//change couplers
	if(nset[node].Type === "System" && node !== config.coupler){
		last = config.coupler;
		coupler = node;
		config.nTrail = ["Couplers"];
		config.trail = ["Couplers"];
		nRun();
		tide(2);
		node = "Couplers";
	//split nset bset pset
		bset = {}; pset = {};
		$.each(nset,function(k,v){
			if(v.hasOwnProperty("Type") && v.Type === "System"){
				bset[k] = v;
			}
			else{
				pset[k] = v;
			}
		});
	//save pset
		path = nset[last].Location;
		macSave(pset,path);
	//new pset
		path = nset[coupler].Location;
		txt = fs.readFileSync(path, 'utf-8');
		pset = JSON.parse(txt);
	//add to bset
		nset = $.extend({}, bset, pset);
		nset[coupler].Link = pset.Admin.Link;
		$.each(pset.Admin.Link,function(i,v){
			nset[v].Backlink = [coupler];
		});		
		//storeSave();
		config.store = nset[coupler].Store;
		wset = storeGet();
		config.coupler = coupler;
	}
	config.nNode = node;
	nRun();
	tRun();
}

function aDown(cell){
	var id,pre,node,nn,s,tp,ret,arr,ind,nt,fun;
	tide(1); //adjust this to show node not par
	id = cell.attr("id");
	pre = id.charAt(0); 
	id = id.slice(1);
	node = config.nNode;
	nn = nset[node];
	s = nset.Blazer.style;
	tp = cell.parent().position().top +cell.position().top;
	if(pre === "k"){
		config.aTrail.key = id;
		ret = aspects(node);
		domArr("k",ret[0],ret[1],1,1);
		if(id === "Backlink"){
			arr = backlinkArr(node);
			pre = "a";
		}
		else if(id === "Link"){
			arr = linkArr(node);
			pre = "l";
			ind = Math.floor(arr.length/2);
		}
		else{
			arr = aoptions(node,id);
			pre = "w";
		}
		ind = ind? ind : -1;
		domArr(pre,ind,arr,2);
	}
	else{
		if(config.aTrail.key === "Backlink"){
			if(s.foc === tp){
				rerun(id);
			}
			else{
				arr = backlinkArr(node);
				ind = cell.index();
				domArr("a",ind,arr,2);
			}
		}
		else if(config.aTrail.key === "Link"){
			act = s.foc === tp? 1 : 0;
			if(pre === "l"){
				fun = config.aTrail.fun = id;
				config.aTrail.value = [];
				if(cell.parent().attr("id")=== "s1"){
					ret = aspects(node);
					domArr("k",ret[0],ret[1],1,1);
				}
				eval("f" +fun)(act,id,cell);
			}
			else{
				fun = config.aTrail.fun;
				eval("f" +fun)(act,id,cell);
			}
		}
//devices here	
//change value strings;
	else{
			if(s.foc === tp){
				config.aTrail.value = id;
			//cannot change type options here
				if(config.aTrail.key === "Type"){
					nset[node].Type = id;
					config.aTrail.value = id;
					ret = aspects(node);
					domArr("k",ret[0],ret[1],1,1);
				}
				else{
			//editable options for recycling
					cell
					.attr("contenteditable",true)
					.css("cursor","text")
					.focus()
					.mouseleave(function(){
						html = $(this).html();
						$("#k" + config.aTrail.key +" :nth-child(2)")
						.html(html)
						config.aTrail.value = html;
						aFinish()
					});
				}
			}
			else{
			//to focus line
				arr = aoptions(node,config.aTrail.key);
				ind = cell.index();
				domArr("w",ind,arr,2);
			}
		}
	}
}

function aFinish(){
	var at,key,fun,val,nn,coll,html,ret,type;
	at = config.aTrail;
	key = at.key;
	fun = at.fun;
	val = at.value;
	nn = nset[config.nNode];
	switch(fun){
		case "Crosslink":
			if(!nn.Link){
				nn.Link = [];
			}
			coll = $("#s2").children().slice(1);
			coll.each(function(){
				html = $(this).html();
				if(html !== ""){
					nn.Link.push($(this).attr("id").slice(1));
				}
			});
		break;
		default:
			html =  at.value; lert(html)
			nn[key] = html;
			tRun();
			updateStore(nn.Type,key,val);
	}
}	
	
	
