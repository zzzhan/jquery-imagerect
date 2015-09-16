/*!
 * Jquery Imagerect
 * https://github.com/zzzhan/jquery-imagerect
 *
 * Licensed under the Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0.txt
 *
 */
(function(factory){
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (window.jQuery) {
        factory(window.jQuery);
    }	
}(function($){
	var defaults = {};
	var ImageRect = function(elm, option) {
	  this.element = elm;
	  var $elem = $(this.element);
        //$elm.height(this.option.h);
	  this.opts = $.extend({}, defaults, $elem.data(), option);
	  if(!!this.opts.url) {
	    this.load(this.opts.url);
	  }
	};
    var _defRect = function(img) {
	  return {w:img.width/2,h:img.height/2, x:0,y:0};
	};
    ImageRect.version = '0.1.1';
    ImageRect.prototype = {
        constructor: ImageRect,
    	_loaded:function(e) {
	       var $elm = $(this.element);
    		//console.log(this.img.width+'x'+this.img.height);
			$elm.text('');
			var img = e.target;
			this.opts.url = img.src;
            $elm.css({'background': 'url('+img.src+') no-repeat'});
            this.opts.w=this.opts.w||$elm.width();
            this.opts.h=this.opts.h||$elm.height();
    		if(this.opts.w<img.width) {
    			//console.log('percent:'+percent);
				$elm.css('background-size', '100% auto'); 
				//hack ie8
				$elm.css('filter',"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+this.opts.url+"', sizingMethod='scale')\\9");
			}
				this.percent = this.opts.w/img.width;
            var rect = this.opts.rect||_defRect(img);
            var dh = img.height*this.percent;
            $elm.height(Math.max(this.opts.h, dh));     
            if($('.imagerect-selector', $elm).length===0) {
               $('<div class="imagerect-selector"></div>').appendTo($elm).on('dblclick', 
			     $.proxy(this.dblclick, this)).on('mousedown', $.proxy(this.mousedown, this)).on('mouseup', 
			     $.proxy(this.mouseup, this)).css('resize', this.opts.resize||'both');
            }
            this.rect(rect);       
            $elm.trigger('loaded',[this.rect(),img]);
			this.img = img;
    	},
		load: function(url, rect) {
	      var $elm = $(this.element);		  
		  $('.imagerect-selector', $elm).remove();
		  this.opts.rect = rect;
		  var img = new Image();
		  //img.crossOrigin = "Anonymous";
		  img.src = url;
		  $(img).on('load', $.proxy(this._loaded, this)).on('error', function() {
		    $elm.text('Load image error.');		    
		  });
		  $elm.text('Loading...');		  
		},
    	mousedown:function(evt) {
	      var $elm = $(this.element);		 
		  var selector = $('.imagerect-selector', $elm);
            evt.stopPropagation();
            //evt.preventDefault();
            var e = evt.originalEvent;
            var sw = selector.width();
            var sh = selector.height();
            this.sw = sw;
            this.sh = sh;
            this.offsetDx = (e.clientX - $elm.offset().left);
            this.offsetDy = (e.clientY - $elm.offset().top);
            selector.on('mousemove', $.proxy(this.mousemove, this));
    	},
    	mousemove:function(evt) {
	      var $elm = $(this.element);
		  var selector = $('.imagerect-selector', $elm);
            evt.stopPropagation();
            //evt.preventDefault();
    		var e = evt.originalEvent;
            var sw = selector.width();
            var sh = selector.height();
            if(this.sw!==sw||this.sh!==sh) {return;}
            this.offsetMx = (e.clientX - $elm.offset().left);
            this.offsetMy = (e.clientY - $elm.offset().top);
    		this.move();
            this.offsetDx=this.offsetMx;
            this.offsetDy=this.offsetMy;
    	},
    	mouseup:function() {
	      var $elm = $(this.element);
		  var selector = $('.imagerect-selector', $elm);
            selector.off('mousemove');
            var p = this.percent;
            var co = this.currOffset();
            var pw = selector.innerWidth();
            var ph = selector.innerHeight();
            $.extend(this.opts.rect, {x:co.left/p,y:co.top/p,w:pw/p,h:ph/p});
            $elm.trigger('rect',[this.rect()]);
    	},
    	move:function() {
	      var $elm = $(this.element);
		  var selector = $('.imagerect-selector', $elm);
    		var dx = (this.offsetMx-this.offsetDx);
    		var dy = (this.offsetMy-this.offsetDy);
    		var offset = selector.offset();
    		var sx = offset.left;
    		var sy = offset.top;
    		selector.offset({top:sy+dy, left:sx+dx});
    	},
        dblclick:function(e) {
	      var $elm = $(this.element);
		  var img = this.img;
            e.stopPropagation();
            e.preventDefault();
            if(!this.opts.dblToggle) {
                this.opts.dblToggle = true;
                this.lastRect = this.rect();
                $elm.trigger('rect',[this.rect({x:0,y:0,w:img.width,h:img.height})]);
            } else {
                this.opts.dblToggle = false;
                var l = this.lastRect||_defRect(img);
				console.log(l);
                $elm.trigger('rect',[this.rect({x:l.x,y:l.y,w:l.w,h:l.h})]);
            }
        },
        currOffset:function() {
	      var $elm = $(this.element);
		  var selector = $('.imagerect-selector', $elm);
            var offset = selector.offset();
            var offset1 = $elm.offset();
            var bw = (selector.outerWidth(true)-selector.innerWidth())/2;
            var bh = (selector.outerHeight(true)-selector.innerHeight())/2;
            //console.log(bw+'x'+bh);
            var px = offset.left-offset1.left+bw;
            var py = offset.top-offset1.top+bh;
            return {left:px, top:py};
        },
    	rect: function(rect) {
            var percent = this.percent;
            if(!!rect) {
	        var $elm = $(this.element);
		    var selector = $('.imagerect-selector', $elm);
                rect = $.extend({}, this.opts.rect, rect);
                var sx = rect.x*percent;
                var sy = rect.y*percent;
                var sw = rect.w*percent;
                var sh = rect.h*percent;
                var co = this.currOffset();
                this.offsetMx = sx;
                this.offsetMy = sy;
                this.offsetDx = co.left;
                this.offsetDy = co.top;
                this.move();
                selector.width(sw);
                selector.height(sh);
                this.opts.rect = rect;
            }
            return this.opts.rect;
    	}
    };
    $.imagerect = ImageRect;

    $.fn.imagerect = function(option) {
        var pickerArgs = arguments;
        var ret = null;
        this.each(function() {
            var $this = $(this),
            inst = $this.data('imagerect'),
            options = ((typeof option === 'object') ? option : {});
            if ((!inst) && (typeof option !== 'string')) {
                $this.data('imagerect', new ImageRect(this, options));
            } else {
                if (typeof option === 'string') {
                    ret = inst[option].apply(inst, Array.prototype.slice.call(pickerArgs, 1));
                }
            }
        });
        return ret||this;
    };

    $.fn.imagerect.constructor = ImageRect;
}));