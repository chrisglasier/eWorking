//functions that support development

//customisable pinnable printable version of alert
function lert(set,switcher,single){
	var hold,html,k,v,i,val,str;
	w = win[0];
	w.show();
	w.focus();
	nset.Lert.monitor.show = true;
	hold = $("#hold",w.window.document);
	if(single){
//clear all previous	
		html = "";
	}
	else{
		html = hold.html();
		html += "\n";
	}
	if(switcher){
		try{		
			html += macStringify(set,2); 
		}
		catch(e){
			arr = [];
			for(n in set){
				arr.push(n +":" +set[n]); 
			}
			html += arr.join("<br>");
		}
 	}
    else{
   		html += set +"\n";
   }
	hold.html(html);
}

//to examine machine code
function inspect(){
	var  monitor,path,file,nr,obj;
	monitor = nset.Code;
	path = monitor.Output.Location;
	file = monitor.Output.File; 
	nr = bfig.screen >1? bfig.screen -1 : 0;
	obj = gui.Window.open(path +"/" +file +".html",{
		"title": "code",
		"name": "code",
		//"icon": "red.png",
		"toolbar":false,
		"frame":true,
		"show":true,
		"resizable":true,
		"x":monitor.position[nr][0],
		"y":monitor.position[nr][1],
		"width": monitor.size[nr][0],
		"height": monitor.size[nr][1]
	});
	obj.on("resize", function(){
		nset.oCode.size[nr] = [this.width,this.height];
	});
	obj.on("move", function(){
		nset.oCode.position[nr] = [this.x,this.y];
	});
	obj.on("close", function(){
		this.show(false);
		monitor.show = false;
	});
	obj.on("loaded", function(){
		monitor.win = win.length;
		win.push(this);
		this.show(true);
		monitor.show = true;
	});
}

