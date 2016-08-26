var opr,nset,node,lert,scene,camera,renderer;

function start(){
	opr = opener;
	lert = opr.lert;
// xyz to match nset	
	THREE.Object3D.DefaultUp.set( 0, 0, 1 );
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
		if(scene){
			$.each(scene.children,function(i,v){
				//lert(v.constructor);
			
				//scene.remove(scene.children[len]);
			});
		}
		else{
			setScene();
		}
		setModel(node);
	});
}
