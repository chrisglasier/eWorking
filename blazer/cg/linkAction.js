//link options functions

function fAssembly(act,id,cell){
	fType(act,id);
}

function fGrouping(act,id,cell){
	fType(act,id);
}
	
function fProduct(act,id,cell){
	fType(act,id);
}

function fType(act,id){
	var node;
	if(act){
		node = cfig.nNode;
		if(id === "Product" && nset[node].Type === id){
//creates an new assembly set for multiple products
//assembly type voids all product aspects in original
			lab = newProductAssembly(node)
		}
		else{
			lab = newName(id,node);
		}
		cfig.nTrail.push(lab);
		cfig.trail = cfig.nTrail;
		cfig.nNode = lab;
		bfig.aTrail.key = "Context";
		nRun();
		tRun();			
	}
	else{
		linkOptions(id,2);
	}
}

function newLab(){
	var nr,lab;
	nr = 0;
	$.each(nset,function(k,v){
		lab = parseInt(k);
		if(lab >nr){
			nr = lab;
		}
	});
	nr +=1;
	return nr.toString();
}

function newName(id,node,context,label){
	var obj,nr,lab,o,nn;
	obj = {};
	lab = newLab();
	o = nset[lab] = {};
	o.Type = id;
	o.Context = context? context : "undefined";
	o.Label = label? label : o.Context;
	o.Backlink = [node];
	nn = nset[node];
	if(id === "Product"){
		o.Source = "search";
	}
	else{
		nn = nset[node];
		if(nn.Link){
			o.Link = $.extend(true,[],nn.Link);
		}
	}
	nn.Link = [lab];
	return lab;
}

function newProductAssembly(node){
	var nn,o;
	nn = nset[node];
	lab = newLab();
	o = nset[lab] = $.extend(true,{},nn);
	o.Backlink = [node];
	nn.Type = "Assembly";
	nn.Label += " Assembly";
	nn.Link = [lab];
	return lab;
}

function fCrosslink(act,id,cell){
	var nr,pid,tar,cxt,h,html
	atv = bfig.aTrail.value;
	if(act){
		atv.push(id);
	}
	nr = atv.length -1
	switch(nr){
		case 0:
			linkOptions(id,1);
			crosslinkContexts(id,2);
		break;
		case 1:
			if(id !== atv[1]){
				shifter(cell);
			}
			else{
				crosslinksContextLabels("w",id,1,true);
				crosslinksContextLabels("a",id,2,false);
				$("#aremove").html("");
			}
		break;
		default:
		if(act){
			$("#aremove").html("Remove all");
			pid = cell.parent().attr("id");
			tar = pid === "s1"? "a" : "w";
			if(id === "add" || id === "remove"){
				cxt = atv[1];
				h = id === "add"? false : true;
				crosslinksContextLabels("w",cxt,1,h);
				h = id === "add"? true : false;
				crosslinksContextLabels("a",cxt,2,h);
			}
			else{
				html = cell.html();
				$("#" +tar +id).html(html);
				cell.html("");
			}
			aFinish();
		}
		else{
			shifter(cell);
		}
	}			
}

function fClone(act,id,cell){
	var nt,node,par,ind,nn,label,count,nodes;
	if(act){
		nt = cfig.nTrail;
		node = cfig.nNode;
		par = nt[nt.length-2];
		ind = $.inArray(node,nset[par].Link);
		nn = newLab();
		
		nset[nn] = $.extend(true,{},nset[node]);
		nset[nn].Backlink = [par];
		label = nset[nn].Label.split(" ")[0];
		count = nset[par].Link.length;
		nset[nn].Label = [label,count].join(" ");
		nset[par].Link.splice(ind +1,0,nn);
		
		nt[nt.length-1] = nn;
		cfig.trail = cfig.nTrail = nt;
		cfig.nNode = nn;
		
		ind = 0;
		nodes = [[nn]];
		compile(nodes,ind);			
	}
	else{
		linkOptions(id,2);
	}
	bfig.links = true
	nRun();
	tRun();
}

function fDelete(act,id,cell){
	var nt,par,pLink,node,ind,ent,nodes;
	if(act){
	//remove from parent links	
		nt = cfig.nTrail;
		par = nt[nt.length-2];
		pLink = nset[par].Link;
		node = cfig.nNode;
		ind = $.inArray(node,pLink);
		pLink.splice(ind,1);
		nset[node].deleted = true;
	//remove pivot backlinks
		if(nset[node].Type === "Pivot"){
			links = nset[node].Link;
			$.each(links, function(i,v){
				ind = $.inArray(node,nset[v].Backlink);
				if(ind >-1){
					nset[v].Backlink.splice(ind,1);
				}
			});
		}
	//markup all descendant links for purging
		else if(nset[node].Link){
			nodes = [[node]];
			compile(nodes,0);
		
		}
	//reset node and trails
		if(pLink.length > 0){
			bfig.links = true; //keeps links menu in s2
			ind = pLink[ind -1]? ind -1 : 0;
			ent = pLink[ind];
			cfig.nNode = ent;
			nt[nt.length-1] = ent;
			cfig.trail = cfig.nTrail = nt;
		}
		else{
			bfig.links = false; //allows removal of link menu	
			delete nset[par].Link;
			cfig.nNode = par;
			cfig.trail = cfig.nTrail = nt.slice(0,-1);
		}
	}
	else{
		bfig.links = true;
	//selection to focus line
		linkOptions(id,2);
	}
	nRun();
	tRun();
}

function fKeys(act,id,cell){
	lert(id + "ed");
}

function fNumber(act,id,cell){
	if(act){
		nt = cfig.nTrail;
		par = nt[nt.length-2];
		links = nset[par].Link;
		$.each(links,function(i,v){
			label = nset[v].Label.split(" ")[0];
			nset[v].Label = [label,i +1].join(" ");
		});
	}
	else{
		linkOptions(id,2);
	}
	bfig.links = true
	nRun();
	tRun();
}
		
function fPurge(){
	$.each(nset,function(k,v){
		if(v.hasOwnProperty("deleted")){
			delete nset[k];
		}
	});
}
	


	











