var opr,nset,node,lert,scene,camera,renderer;

function start(){
	var nodes;
	opr = opener;
	lert = opr.lert;
// xyz to match nset	
	THREE.Object3D.DefaultUp.set( 0, 0, 1 );
	$(document).ready(function(){
		project = $("#transfer",opr.window.document).val();
		if(project === opr.bfig.coupler){
			nset = opr.nset;
			node = opr.cfig.nNode;
		}
		else{
			file = opr.nset[project].Location;
			txt = opr.read(file);
			nset = JSON.parse(txt);
			node = nset.Admin.nNode;
		}
		cam = nset.Admin.monitor["Modeller"].scene.camera;
		$("#cam").html(cam.type +": "+cam.position);
		setScene();
		setModel();
	});
}