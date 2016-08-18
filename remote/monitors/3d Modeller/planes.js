function posRot(set,node){
	var d,ow,od,oh,w,d,h,rx,ry,rz,arr;
	d = set.Model.Dims;
	ow = d[0];
	od = d[1];
	oh = d[2];
	switch(set[node].Label){
		case "front":
			w = ow; h = oh;
			x = 0; y = 0; z = od/2-5;
			rx = 2; ry = 0; rz = 0;
		break;
		case "back":
			w = ow; h = oh;
			x = 0; y = 0; z = -od/2;
			rx = 0; ry = 0; rz = 0;
		break;
		case "top":
			w = ow; h = od;
			x = 0; y = oh/2; z = 0;
			rx = 90; ry = 0; rz = 0;
		break;
		case "bottom":
			w = ow; h = od;
			x = 0; y = -oh/2; z = 0;
			rx = 90; ry = 0; rz = 0;
		break;
		case "left":
			w = od; h = oh;
			x = ow/2; y = 0; z = 0;
			rx = 0; ry = 90; rz = 0;
		break;
		case "right":
			w = od; h = oh;
			x = -ow/2; y = 0; z = 0;
			rx = 0; ry = 270; rz = 0;
		break;
	}	
	m = Math.PI/180;
	t = 1;
	arr = [w*t, h*t, x*t, y*t, z*t, rx*m, ry*m, rz*m];
	return arr;
}