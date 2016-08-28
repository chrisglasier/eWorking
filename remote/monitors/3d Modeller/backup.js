function nodesArray(node) {
	var nodes;
	par = nset[node].Backlink[0];
	nodes = [[node,par]];
	ind = 0;
	compile(nodes,ind);
	function compile(nodes,ind){	
		var n,i,v;
		n = nodes[ind][0];
		nn = nset[n];

		if(nn.Link){
			$.each(nn.Link,function(i,v){
				nodes.push([v,n])
			});
			pass(nodes,ind);
		}
		function pass(nodes,ind){
			var node;
			ind +=1;
			node = nodes[ind];
			if(!nodes[ind]){
				return;
			}
			
			if(nset[node[0]].Link){		
				compile(nodes,ind);			
			}
			else{
				pass(nodes,ind);				
			}
		}	
	}
return nodes;
}
	
function helpBox(node) {
	var obj,helper,ret;
	obj = scene.getObjectByName(node);
	helper = new THREE.BoundingBoxHelper(obj, 0xffffff);
	helper.name = "helper";
	helper.update();
	ret = {};
	ret.min = helper.box.min;
	ret.max = helper.box.max;
	ret.box = helper;
	return ret;
}
