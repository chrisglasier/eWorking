//functions that setup nset and dom

function start(){
	gui.App.clearCache();
	file = "cg/nset.json";
	txt = read(file);
	nset = JSON.parse(txt);
	setConfig();
	win = [];
	lerter();
}

function read(file){
	var txt;
	txt = fs.readFileSync(file, 'utf-8');
	return txt;
	
}

function setConfig(){
	config = nset.Blazer.config;
//sets aspect trail to default in case saved
	config.aTrail = {};
	config.aTrail.key = "Type";
	config.mode = "aspects";
//move this to set up
	wset = storeGet();
//end move
	gui.Screen.Init();
	config.screen = gui.Screen.screens.length;
}

function lerter(){
	var nr,set,sun,obj;
//load lert window first in order to examine other windows
//in case more than 2 screens
	nr = config.screen >1? config.screen -1 : 0;
	set = nset.Lert.monitor;
	set.show = false;
	obj = openWindow(nr,set);
	obj.on("loaded",function(){
		blazer();
	});
}

function openWindow(nr,set){
	var obj;
	obj = gui.Window.open( set.url, {
		"title": set.title,
		"name": set.name,
		"toolbar":set.toolbar,
		"frame":set.frame,
		"show":set.show,
		"x": set.position[nr][0],
		"y": set.position[nr][1],
		"width": set.size[nr][0],
		"height": set.size[nr][1]
	});
	obj.on("resize", function(){
		nr = config.screen >1? config.screen -1 : 0;
		set.size[nr] = [this.width,this.height];
	});
	obj.on("move", function(){
		nr = config.screen >1? config.screen -1 : 0;
		console.log("screen " +nr)
		set.position[nr] = [this.x,this.y];
	});
	obj.on("close", function(){
		this.show(false);
		set.show = false;
	});
	obj.on("loaded",function(){
		set.win = win.length;
		win.push(this);
	});
	return obj;
}

function blazer(){
	var set,nr,obj,height,a,nodes,arr,cc;
	obj = gui.Window.get();
	set = nset.Blazer;
	nr = config.screen >1? config.screen -1 : 0;
	obj.x = set.position[nr][0];
	obj.y = set.position[nr][1];
	obj.on("move", function(){
		nr = config.screen >1? config.screen -1 : 0;
		set.position[nr] = [this.x,this.y];
	});
	obj.on("loaded", function(){
		this.show(true);
	});
	obj.on("close", function(){
		this.hide();
		gui.App.quit();
	});
	setup();
}

function monitors(nr,arr,pass){
	var set;
	set = arr[pass];
	$("#transfer").val(set.title);
	openWindow(nr,set);
	pass += 1;
	if(arr[pass]){
		monitors(nr,arr,pass);
	}
	else{
		finishUp();
	}
}

function setup(){
	var nr,arr,k,v,pass,w,b,s,ot,nt,e;
	menu();
	nRun();
	tRun();
//activate monitors
	nr = config.screen >1? config.screen -1 : 0;
	arr = [];
	$.each(nset,function(k,v){
		if(v.hasOwnProperty("Context")){
			if(v.Context === "Coupler"){
				if(v.hasOwnProperty("monitor")){
					$.each(v.monitor,function(k,v){
						arr.push(v);
					})
				}
			}
		}
	});
	pass = 0;
	monitors(nr,arr,pass);
}

function finishUp(){
//finish up	
	$(document).ready(function(){
//css variables
		w = gui.Window.get();
		b = nset.Blazer;
		s = b.style;
		w.on("resize", function(){
			var h,nr,diff,arr,ot,nt,l;
			h = this.height;
			oh = config.oh;
			diff = h - oh;
			config.oh = h;
			arr = ["s1","s2","m1"];
			$.each(arr,function(k,v){
				ot = $("#"+v).position().top;
				nt = v === "m1"? ot +diff : ot +diff *.5;
				$("#"+v).css("top",nt +"px");
			});
			tide(2)
		});
//initiate		
		$("body").css({
			fontSize: s.font,
			backgroundColor: s.lightgrey
		});	
		$("#m1,#z1").css("height", s.rh +"px");
		$("#z1").css("backgroundColor",s.white);
//cannot use hide/show as negates in-line block children;
		$("#m1").css({
			top: $("body").height() - s.rh +"px",
			backgroundColor: s.white
		});
		$("li,a")
		.css({
			height: s.rh +"px",
			lineHeight: s.rh +"px"
		});
		$("#s1,#s2,#z1").click(function(e){
			down(e);
		});
		$("#m1").click(function(e){
			mown(e);
		});
//resizing just used during sessions
//see https://github.com/nwjs/nw.js/wiki/Preserve-window-state-between-sessions
		config.oh = w.height;
		tide(2);
		w.show();
	});
}
		
function menu(){
	var m,b,s,sra,ga;
	m = $("#m1");
	b = nset.Blazer;
	s = b.style;
	m.append($(document.createElement("img"))
		.attr({
			src: "move.png",
			id: "mover"
		})
		.css({
			height: s.rh/2 +"px",
			margin: s.rh/4 +"px",
			cssFloat: "left"
		})
	);
	ra = b.menu.red;
	ga = b.menu.green;
	arr = [ra,ga];

	$.each(arr,function(i,v){
		clr = i === 0? s.red : s.green;
		flt	= i === 0? "left" : "right";
		$.each(v,function(i,v){
			m.append($(document.createElement("a"))
				.html(v)
				.attr("id",v.toLowerCase())
				.css({
					color: clr,
					float: flt
				})
			)
		})
	});
	$("#toggle").html(b.menu.toggle[1]);
}




