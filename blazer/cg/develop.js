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
	nr = config.screen >1? config.screen -1 : 0;
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

//For dev editing nsets
function adjuster(){
	nn = "oMachine";
	nodes = [[nn]];
	ind = 0;
	compile(nset,nodes,ind);
}

function compile(set,nodes,ind){
	var n,k,a;
//compiles the Links array
	n = nodes[ind][0];
	if(set[n].Link){
		k = set[n].Link;
		for(a = 0; a < k.length; a += 1){
			nodes.push([k[a],n]);
		}
		
		//delete set[n].Link;
		pass(set,nodes,ind);
	}
}

function pass(set,nodes,ind){
	var node;
	ind += 1;
	node = nodes[ind];
	if(!nodes[ind]){
		lset = {}
		$.each(nodes,function(k,v){
			lset[v[0]] = nset[v[0]];
		});
		nset = lset;
		return;
	}
	n = nodes[ind][0];
//Filter
	if(set[node[0]].Link){
//node has children = compile	
		compile(set,nodes,ind);			
	}
	else{
// no children = pass again	
		pass(set,nodes,ind);				
	}
}
