jQuery.fn.extend({
	MobileForm:function(t){
		var self=this,form=this.selector,numofele,steps=new Array(),curStep=1,prevBtn="<button type='button' class='btn btn-info btn-prev pull-left' >Previous</button>",nxtBtn="<button type='button' class='btn btn-info btn-nxt pull-right' >Next</button>",initialize=true,prev=false,nxt=false,inValidEle,depends=new Array(),
		init= function() {
			var s=j();
			getDataAttr();
			getDataDepends();
			hideOthers(1);
			initialize=false;
			hideSubmit();
			injectBtn();
			enableDisablePNBtn();
		},
		j = function() {
			return self;
		},
		getSteps=function(){
			return steps;
		},
		setSteps=function(s){
			steps=s;
		},
		getDepends=function(){
			return depends;
		},
		setDepends=function(d){
			depends=d;
		},
		getCurstep=function(){
			return curStep;
		},
		getDataAttr=function(){
			var s=j();
			var elements=$(s).children();
			numofele=elements.length;
			var elData=new Array();
			$.each(elements,function(index,value){
				if($(value).attr('data-step')){
					elData.push(value);
				}
			});
			setSteps(elData);
		},
		getDataDepends=function(){
			var els=getSteps();
			var arr=new Array();
			
			$.each(els,function(index,value){
				if($(value).attr('data-depends')){
					arr.push(value);
					$.each($(value).children(),function(z,q){
						$.each($(q).find('input'),function(e,w){
							if($(w).attr('required')){
								$(w).attr('data-required','required');
							}
						});
					});
				}
			});
			setDepends(arr);
		},
		canBeShown=function(isPrev){
			var dpnds=getDepends();
			var nxtStp=isPrev ? getCurstep()-1:getCurstep()+1;
			var prevStp=getCurstep();
			var cbs=true;
			if(dpnds.length>0){
				$.each(dpnds,function(i,v){
					if($(v).data('step')==nxtStp){
						var dpndID=$(v).data('depends');
						var inpt=$("input[name="+dpndID+"]");
						var vl=getVal(inpt,dpndID);
						var dpndValue=$(v).data('depends-value');
						if(vl==dpndValue){
							cbs=true;
							$.each($(v).children().find('input'),function(j,k){
								if($(k).attr('required')!=$(k).attr('data-required')){
									makeInvalid(k);
								}
							});
							
						}else{
							cbs=false;

							makeValid(v);
						}
					}
				});
			}
			return cbs;
		},
		makeValid=function(v){
			var ele=v;
			var ips=$(ele).find('input');
			$.each(ips,function(i,v){
				if($(v).attr('required')){
					$(v).attr('required',false);
				}
			});
			
		},
		makeInvalid=function(x){
			$(x).attr('required',true);
		},
		getVal=function(i,nme){
			var ip=i;
			var typ='';
			if(ip.length>1){
				typ=ip[0].type;
			}else{
				typ=ip.type;
			}
			switch(typ){
				case "radio": return $( "input:radio[name="+nme+"]:checked" ).val();break;
				case "checkbox":return $( "input:checkbox[name="+nme+"]:checked" ).val();break;
				case "text":return $( "input[name="+nme+"]" ).val();break;
			}
		},
		formValidation=function(){
			var frm=$(form);
			var crstep=getCurstep();
			var stps=getSteps();
			var valid=true;
			var curInputs=$(stps[crstep-1]).find('input');
			$.each(curInputs,function(i,v){
				if($(v).attr('required')){
					if($(v).val()!=''){
						valid=true;
					}else{
						valid=false,inValidEle=v;
						return false;
					}
					
				}
			});
			return valid;
		},
		hideOthers=function(except){
			var stps=getSteps();
			$.each(stps,function(i,v){
				if($(v).data('step')==except){
					$(v).toggleClass('hidden',false);
					animate(v,true);
					
				}else{
					animate(v,false);
					$(v).toggleClass('hidden',true);
				}
			});
		},
		animate=function(v,ex){
			if(!initialize){
				if(prev){
					if(ex){
						$(v).removeClass('animated slideOutRight slideOutLeft slideInRight').addClass('animated slideInLeft');
					}else{
						$(v).removeClass('animated slideOutRight slideOutLeft slideInRight').addClass('animated slideOutRight');
					}
				}
				if(nxt){
					if(ex){
						$(v).removeClass('animated slideOutRight slideOutLeft slideInRight').addClass('animated slideInRight');
					}else{
						$(v).removeClass('animated slideOutRight slideOutLeft slideInRight').addClass('animated slideOutLeft');
					}
				}
			}
		},
		hideSubmit=function(){
			$(form).find(':submit').toggleClass('hidden',true);
		},
		enableSubmit=function(){
			$(form).find(':submit').toggleClass('hidden',false);
		},
		injectBtn=function(){
			var s=j();
			$(prevBtn).insertBefore($(form).find(':submit'));
			$(nxtBtn).insertAfter($(form).find(':submit'));
			//$(form).append(nxtBtn);
			$(form+' .btn-prev').on('click',$.proxy(prevBTN,this));
			$(form +' .btn-nxt').on('click',$.proxy(nxtBTN,this));
		},
		prevBTN=function(e){
			var canMovePrev=(curStep>1);
			hideSubmit();
			if(canMovePrev){
				var cshw=canBeShown(true);
				if(!cshw)curStep--;
				prev=true;
				nxt=false;
				hideOthers(curStep-1);
				curStep--;
				enableDisablePNBtn();
			}
		},
		nxtBTN=function(e){
			var canMoveNext=(curStep<(numofele-1));
			if(canMoveNext){
				var f=formValidation();
				if(formValidation()){
					var cshw=canBeShown(false);
					if(!cshw)curStep++;
					nxt=true;
					prev=false;
					hideOthers(curStep+1);
					curStep++;
					enableDisablePNBtn();
				}else{
					$(inValidEle).addClass('animated shake').one('webkitAnimationEnd oAnimationEnd animationEnd', function(){
						$(this).removeClass('animated shake');
					});
				}
			}
		},
		enableDisablePNBtn=function(){
			var cur=getCurstep();
			if(cur<2){
				$('.btn-prev').toggleClass('disabled',true);
			}else if(cur==(steps.length)){
				$('.btn-nxt').toggleClass('disabled',true);
				$('.btn-nxt').addClass('hidden');
				enableSubmit();
			}else{
				$('.btn-prev').toggleClass('disabled',false);
				$('.btn-nxt').removeClass('hidden');
				$('.btn-nxt').toggleClass('disabled',false);
			}
			
		};
		return init();
	}
});