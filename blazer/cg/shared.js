//for blazer and monitors

function compile(nodes,ind){
	var n,links,i,v;
	n = nodes[ind][0]; 
	if(nset[n].Link){
		links = nset[n].Link;
		$.each(links,function(i,v){
			nodes.push([v,n]);
		});
		pass(nodes,ind);
	}
}

function pass(nodes,ind){
	var node,nn;
	ind += 1;
	node = nodes[ind];
	if(!nodes[ind]){
		return;
	}
	if(bfig.aTrail.fun === "Delete"){
		nset[node[0]].deleted = true;
	}
	else{
		nn = newLab();
		nset[nn] = $.extend(true, {}, nset[node[0]]);
		nset[nn].Backlink[0] = node[1];
		nodes[ind][0] = nn;
	}
	if(nset[node[0]].Link){	
		compile(nodes,ind);			
	}
	else{
		pass(nodes,ind);				
	}
}

function rerun(id){
	var nt;
	nt = [id];
	while(nset[id].Backlink){
		id = nset[id].Backlink[0];
		nt.unshift(id);
	}
	cfig.nTrail = nt;
	cfig.trail = nt;
	nRun();
	tRun();
}