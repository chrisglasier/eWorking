//for clones and deletes

function compile(pairs,ind){
	var n,links,i,v,nn;
	n = pairs[ind][0];
	if(nset[n].Link){
		links = nset[n].Link;
		$.each(links,function(i,v){
			pairs.push([v,n]);
		});
		delete nset[n].Link;
		pass(pairs,ind);
		function pass(pairs,ind){
			var pair,nn;
			ind += 1;
			pair = pairs[ind];
			if(!pairs[ind]){
				return;
			}
			nn = newLab();
			nset[nn] = $.extend(true, {}, nset[pair[0]]);
			nset[nn].Backlink[0] = pair[1];	
			if(nset[pair[1]].Link){
				nset[pair[1]].Link.push(nn);
			}
			else{
				nset[pair[1]].Link = [nn];
			}
			nset[nn].clone = pair[0];
			pairs[ind][0] = nn;
			if(nset[pair[0]].Link){	
				compile(pairs,ind);			
			}
			else{
				pass(pairs,ind);				
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
//for analysing/modelling assemblies
function pairAssembler(node) {
	var set,par,pairs,ind,pair,node,pode,np,repair,last,va,sn;
	set = $.extend(true,{},nset);
	if(!set[node].Link){
				return;
	}
	node =  legitNode(node);
	pairs = [[node]];
	ind = 0;
	aCompile(pairs,ind);
	function aCompile(pairs,ind){	
		var n,i,v;
		pair = pairs[ind];
		node = pair[0];
		pode = pair[1];
//passes on grouping links
		np = set[node].Type === "Grouping"? pode : node;
		$.each(set[node].Link,function(i,v){
			pairs.push([v,np]);
		});
		aPass(pairs,ind);
		function aPass(pairs,ind){
			var pair;
			ind += 1; 
			pair = pairs[ind];
			if(!pair){
				repair = [];
				$.each(pairs,function(i,v){
		//first node acts as first parent			
					if(!v[1]){
						return;
					}
					t = set[v[0]].Type;
					if(t === "Assembly" || t === "Product"){
						if(v[1] !== last){
							va = [v[1],[v[0]]];
							repair.push(va);
						}
						else{
							va[1].push(v[0]);
						}
						last = v[1];
					}
				});
				return;
			}
			sn = set[pair[0]];
			if(sn.Link){
				aCompile(pairs,ind); 
			}	
			else{
				aPass(pairs,ind);
			}
		}		
	}
	return repair;
}

//called from monitor (passing id extracted from event event)	
function rerun(node){
	var nt;
	nt = [node];
	while(nset[node].Backlink){
		node = nset[node].Backlink[0];
		nt.unshift(node);
	}
	cfig.nTrail = nt;
	cfig.trail = nt;
	nRun();
	tRun();
}