//populates vertical sliders

function domArr(pre,ind,arr,nr,kv){
	var s,ind,tp,hind,sl,bgc,node,color,hi,ks,vs,html,id,bgc;
	s = nset.Blazer.style;
	s.foc = ($("body").height() - s.rh)/2;
//no link options hilited
	sind = ind <0? Math.floor(arr.length/2) : ind;
	tp = s.foc - (sind *s.rh);
	if(sind >-2){
		hind = ind +1;
	}
	sl = $("#s" +nr);
switch(pre){
		case "n": bgc = s.lightgrey; break;
		case "m": bgc = s.lightred; break;
		case "w": bgc = s.white; break;
		default: bgc = s.lightblue;
	}
	sl.css({
		top: tp +"px",
		backgroundColor: bgc
	});
	node = pre === "n"? cfig.nNode : bfig.aTrail.key;
	sl.empty();
	$.each(arr,function(i,v){
		if(kv){
			if(v[1].constructor === Array){
				v[1] = v[1].join(" ");
			}
			ks = "<span>" +v[0] +"</span>";
			vs = "<span>" +v[1] +"</span>";
			html = [ks,vs].join(" : ");
			id = "k" +v[0];
		}	
		else{
			if(pre === "n"){
				html = nset[v].Label;
				id = pre +v;
			}
			else{
				if(v.constructor === Array){
					html = v[0];
					id = pre +v[1];
				}
				else{
					html = v;
					id = pre +v;
				}
			}
		}
		td = pre === "m" && v[2] === "f"? "line-through" : null;
		sl.append($(document.createElement("li"))
			.html(html)
			.attr("id", id)
			.attr("title", id)
			.css({
				height: s.rh +"px",
				lineHeight:s.rh +"px",
				textDecoration: td
			})
		)
	})
	if(hind){
		$("#s" +nr +" li:nth-child(" +hind +")")
		.css("fontWeight","bold");
	}
}