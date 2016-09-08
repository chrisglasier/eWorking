//for clones and deletes
//for receiving monitor callbacks (rerun)

function compile(nodes,ind){
	var n,links,i,v;
	n = nodes[ind][0]; 
	if(nset[n].Link){
		links = nset[n].Link;
		$.each(links,function(i,v){
			nodes.push([v,n]);
		});
	//to keep position
		nset[n].Link = undefined;
		pass(nodes,ind);
		function pass(nodes,ind){
			var node,nn;
			ind += 1;
			node = nodes[ind];
			if(!nodes[ind]){
				cfig.trail = nset.Admin.hTrail[nodes[0][0]];
				return;
			}
			if(bfig.aTrail.fun === "Delete"){
				nset[node[0]].deleted = true;
			}
			else{
				nn = newLab();
				i = $.inArray(node[0],cfig.trail);
				if(i >-1){
					nset.Admin.hTrail[nodes[0][0]].push(nn);
				}
				nset[nn] = $.extend(true, {}, nset[node[0]]);
				nset[nn].Backlink[0] = node[1];
			}	
			if(nset[node[1]].Link){
				nset[node[1]].Link.push(nn);
			}
			else{
				nset[node[1]].Link = [nn];
			}
			nset[nn].clone = node[0];
			nodes[ind][0] = nn;
			if(nset[node[0]].Link){	
				compile(nodes,ind);			
			}
			else{
				pass(nodes,ind);				
			}
		}
	}
}

function legitNode(node){
	var nn,bn;
	nn = nset[node];
	if(nn.Type === "Assembly" || nn.Type === "Product"){
		node = node;
	}
	else{
		bn = node;
		while(nset[bn].Type !== "Assembly" ){
			bn = nset[bn].Backlink[0];
			if(nset[bn].Type === "Assembly"){
				node = bn;
				break;
			}
		}
	}
	return node;
}

function assemblyArray(node) {
	var set,par,nodes;
	set = $.extend({},nset)
	par = legitNode(set[node].Backlink[0]);
	nodes = [[node,par]];
	ind = 0;
	aCompile(nodes,ind);
	function aCompile(nodes,ind,links){	
		var n,i,v;
		n = nodes[ind][0];
		nn = set[n];
		if(nn.Link){
			$.each(nn.Link,function(i,v){
				nodes.push([v,n]);
			});
			aPass(nodes,ind);
		}
		function aPass(nodes,ind){
			var node;
			ind += 1;
			node = nodes[ind];
			if(!node){
				return;
			}
			sn = set[node[0]];
			type = sn.Type === "Assembly";
			if(type && sn.Link){
				aCompile(nodes,ind);
			}
			else if(sn.Link){
				set[node[1]].Link = sn.Link;
				aPass(nodes,ind);
			}	
			else{
				aPass(nodes,ind);
			}
		}	
	}
	return nodes;
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