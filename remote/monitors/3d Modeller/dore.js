var opr,nset,node,lert

function start(){

	opr = opener;
	lert = opr.lert;
	$(document).ready(function(){
		project = $("#transfer",opr.window.document).val();
		if(project === opr.config.coupler){
			nset = opr.nset;
			node = opr.config.nNode;
		}
		else{
			file = opr.nset[project].Location;
			txt = opr.read(file);
			nset = JSON.parse(txt);
			node = nset.Admin.nNode;
		}
		/*
		if(scene){
			$.each(scene.children,function(i,v){
				//lert(v.constructor);
			
				//scene.remove(scene.children[len]);
			});
		}
		else{
	//initiate scene and add new keys to opr.nset
			if(project === opr.config.coupler){
				$.each(nset,function(k,v){
					node = k;
					if(v.hasOwnProperty("Type")){
						if(v.Type === "Assembly" && !v.Dims){
							v.Dims = [0,0,0];
							v.Rotation = [0,0,0];
							v.Position = [0,0,0];
						}
					}
				})
			}				
			setScene(project);
		}
		*/
		setScene();
		setModel(node);
		
	});
}
