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
	bfig = nset.Blazer.bfig;
//blazer configuration
//in case saved during cloning/deleting
	bfig.links = false;
	gui.Screen.Init();
	bfig.screen = gui.Screen.screens.length;
//coupler configuration;
	cfig = nset.Admin;
//word store
	wset = storeGet();
}

function lerter(){
	var nr,set,sun,obj;
//load lert window first in order to examine other windows
//in case more than 2 screens
	nr = bfig.screen >1? bfig.screen -1 : 0;
	set = nset.Lert.monitor;
	set.show = false;
	obj = openWindow(nr,set);
	obj.on("loaded",function(){
		set.win = win.length;
		win.push(this);
		blazer();
	});
}

function blazer(){
	var set,nr,obj,height,a,pairs,arr,cc;
	obj = gui.Window.get();
	set = nset.Blazer;
	nr = bfig.screen >1? bfig.screen -1 : 0;
	obj.x = set.position[nr][0];
	obj.y = set.position[nr][1];
	obj.on("move", function(){
		nr = bfig.screen >1? bfig.screen -1 : 0;
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
		nr = bfig.screen >1? bfig.screen -1 : 0;
		set.size[nr] = [this.width,this.height];
	});
	obj.on("move", function(){
		nr = bfig.screen >1? bfig.screen -1 : 0;
		console.log("screen " +nr)
		set.position[nr] = [this.x,this.y];
	});
	return obj;
}

function monitors(nr,arr,pass){
	var set,i,v;
	set = arr[pass];
	obj = openWindow(nr,set);
	obj.on("loaded",function(){
		win[set.win] = this;
	});
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
//create active monitors
	nr = bfig.screen >1? bfig.screen -1 : 0;
	arr = [];
	i =1;
	$.each(nset,function(k,v){
		if(v.hasOwnProperty("Context")){
			if(v.Context === "Coupler"){
				if(v.hasOwnProperty("monitor")){
					$.each(v.monitor,function(k,v){
						v.win  = i;
						i +=1;
						if(v.show){
							arr.push(v);
						}
					})
				}
			}
		}
	});
	pass = 0;
	if(arr.length >0){
		monitors(nr,arr,pass);
	}
	else{
		finishUp();
	}
}

function finishUp(){
//finish up	
	$(document).ready(function(){
//css variables
		w = gui.Window.get();
		b = nset.Blazer;
		s = b.style;
		$("#transfer").val(bfig.coupler);
		w.on("resize", function(){
			var h,nr,diff,arr,ot,nt,l;
			h = this.height;
			oh = bfig.oh;
			diff = h - oh;
			bfig.oh = h;
			arr = ["slider1","slider2","manager"];
			$.each(arr,function(k,v){
				ot = $("#"+v).position().top;
				nt = v === "manager"? ot +diff : ot +diff *.5;
				$("#"+v).css("top",nt +"px");
			});
			tide(2)
		});
//initiate		
		$("body").css({
			fontSize: s.font,
			backgroundColor: s.lightgrey
		});	
		$("#manager,#nameTrail").css("height", s.rh +"px");
		$("#nameTrail").css("backgroundColor",s.white);
//cannot use hide/show as negates in-line block children;
		$("#manager").css({
			top: $("body").height() - s.rh +"px",
			backgroundColor: s.white
		});
		$("li,a")
		.css({
			height: s.rh +"px",
			lineHeight: s.rh +"px"
		});
		$("#slider1,#slider2,#nameTrail").click(function(e){
			down(e);
		});
		$("#manager").click(function(e){
			mown(e);
		});
//resizing just used during sessions
//see https://github.com/nwjs/nw.js/wiki/Preserve-window-state-between-sessions
		bfig.oh = w.height;
		tide(2);
		w.show();
		//tester();
	});
}

function tester(){
	dno = 1200;
	hno = 2493;
	$.each(nset,function(k,v){
		if(v.Type === "Product"){
			label = v.Label.split(" ")[0];
			if(label === "Divan"){
				dno +=1;
				v.Label = "Divan " + dno;
			}
			else if(label === "Headboard"){
				hno +=1;
				v.Label = "Headboard " + hno;
			}
		}
	});
		
}
		
function menu(){
	var m,b,s,sra,ga;
	m = $("#manager");
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




