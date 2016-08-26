function helpBox(node){
	var obj,helper,ret;
	obj = scene.getObjectByName(node); 
	helper = new THREE.BoundingBoxHelper(obj, 0x000000);
	helper.name = "helper";
	helper.update();
	ret = {};
	ret.min = helper.box.min;
	ret.max = helper.box.max;
	ret.box = helper;
	return ret;
}