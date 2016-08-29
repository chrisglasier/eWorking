//functions that set up sliders and control events 

function tRun(){
	var sl,p;
	sl = $("#z1");
	sl.empty();
	p = "t";
	s = nset.Blazer.style;
	$.each(cfig.trail,function(i,v){
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
	nt = cfig.nTrail;
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
	var nTrail,node,t,t2,t1,pre,tm0,arr,ind,ret,t3;
	nTrail = cfig.nTrail;
	node = cfig.nNode;
	t = !nset[node].Link? nTrail.slice(0,-1) : nTrail;
	t2 = t[t.length-2];
	t1 = t[t.length-1];
	pre = "n";
	tm0 = nset.Blazer.menu.toggle[0];
//Couplers
	if(node === "Couplers" || t1 === "Couplers"){
		arr = ["Couplers"];
		ind = 0;
		domArr(pre,ind,arr,1);
		arr = nset["Couplers"].Link;
		ind = $.inArray(bfig.coupler,arr)
		domArr(pre,ind,arr,2);
	}
//keeps link arr in s2 for repeat clone/delete/number action
	else if(bfig.links){
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
		if(tm0 === "Names"){
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
	bfig.links = false;
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
	cfig.nNode = node;
	ind = cell.index();
	cfig.nTrail = cfig.trail.slice(0,ind+1);
	nRun();
	tide(2);
	if(nset[node].Type !== "System"){
		monitor = nset[bfig.coupler].monitor[bfig.monitor];
		$("#transfer").val(bfig.coupler);
		if(monitor.show){
			w = win[monitor.win];
			w.close(true);
			openMonitor(monitor);
		}
	}
}

function nDown(cell){
	var cell,node,nTrail,ind,coupler;
	node = cell.attr("id").slice(1);
	if(node === "Couplers"){
		return;
	}
	
//change couplers
	if(nset[node].Type === "System" && node !== bfig.coupler){
		last = bfig.coupler;
		coupler = node;
		cfig.nTrail = ["Couplers"];
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
		cfig = nset.Admin;
	//storeSave();
		cfig.store = nset[coupler].Store;
		wset = storeGet();
		bfig.coupler = coupler;
		bfig.monitor = pset.Admin.active;
	}
	else{
		nt = cfig.nTrail;
		par = cell.parent().attr("id");
		nt = par === "s1"? nt = nt.slice(0,-1) : nt;
		nt.push(node);
		cfig.nTrail = nt;
		cfig.trail = nt;
	}
	cfig.nNode = node;
	nRun();
	tRun();
}

function aDown(cell){
	var id,pre,node,nn,s,tp,ret,arr,ind,nt,fun;
	tide(1); //adjust this to show node not par
	id = cell.attr("id");
	pre = id.charAt(0); 
	id = id.slice(1);
	node = cfig.nNode;
	nn = nset[node];
	s = nset.Blazer.style;
	tp = cell.parent().position().top +cell.position().top;
	if(pre === "k"){
		bfig.aTrail.key = id;
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
			if(id === "Note"){
				$("#transfer").val(nn.Note);
				set = nset.Blazer.monitor.Note;
				if(set.show){
					win[set.win].close(true);
				}
				openMonitor(set);
				set.show = true;
			}
			arr = aoptions(node,id);
			pre = "w";
		}
		ind = ind? ind : -1;
		domArr(pre,ind,arr,2);
	}
	else{
		if(bfig.aTrail.key === "Backlink"){
			if(s.foc === tp){
				rerun(id);
			}
			else{
				arr = backlinkArr(node);
				ind = cell.index();
				domArr("a",ind,arr,2);
			}
		}
		else if(bfig.aTrail.key === "Link"){
			act = s.foc === tp? 1 : 0;
			if(pre === "l"){
				fun = bfig.aTrail.fun = id;
				bfig.aTrail.value = [];
				if(cell.parent().attr("id")=== "s1"){
					ret = aspects(node);
					domArr("k",ret[0],ret[1],1,1);
				}
				eval("f" +fun)(act,id,cell);
			}
			else{
				fun = bfig.aTrail.fun;
				eval("f" +fun)(act,id,cell);
			}
		}
//change value arrays and strings;
	else{
			if(s.foc === tp){
				bfig.aTrail.value = id;
			//cannot change type options here
				if(bfig.aTrail.key === "Type"){
					nset[node].Type = id;
					bfig.aTrail.value = id;
					ret = aspects(node);
					domArr("k",ret[0],ret[1],1,1);
				}
				else{
			//editable options for recycling
					val = cell.html().split("-");
					nr = val.constructor === Array? val.length : 1;
					but = buttoner(cell.index());
					but.click(function(e) {
						e.stopPropagation();
						k = $(cell).children();
						if(k.length === 1){
							html = val = $(k[0]).val();
						}
						else{
							val = [];
							$.each(k,function(i,v){
								vv = $(v).val();
								nv = isNaN(vv)? 0 : vv;
								val.push(parseInt(nv));
							});
							html = $.extend(true,[],val).join("-");
						}
						key = bfig.aTrail.key;
						$("#k" + key +" :nth-child(2)").html(html)
						nn[key] = val;
						updateStore(nn.Type,key,val);
					});
					$("#s2").append(but);
										
					cell.empty();
					cell.click(function(e) {
						e.stopPropagation();
					});
					
					w = $("#s2").width();
					pc = w/nr/w *100;
					type = val.length === 6? "xyz" : false;
					i = 0;
					while(i <nr){
						w = $("#s2").width();
						pc = w/nr/w *100;
						inp = inputter(val,i,pc,type);
						cell.append(inp);
						i +=1;
					}	
				}
			}
			else{
			//to focus line
				arr = aoptions(node,bfig.aTrail.key);
				ind = cell.index();
				domArr("w",ind,arr,2);
			}
		}
	}
}

function aFinish(){
	var at,key,fun,val,nn,coll,html,ret,type;
	at = bfig.aTrail;
	key = at.key;
	fun = at.fun;
	val = at.value;
	nn = nset[cfig.nNode];
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
			html =  at.value;
			nn[key] = html;
			tRun();
			updateStore(nn.Type,key,val);
	}
}	
	
	
