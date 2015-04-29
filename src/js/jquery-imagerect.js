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
        this.elm = $(elm);
        //this.elm.height(this.option.h);
        this.option($.extend({}, defaults, this.elm.data(), option));
	};
    ImageRect.version = '0.1.1';
    ImageRect.prototype = {
        constructor: ImageRect,
    	imageload:function(e) {
    		//console.log(this.img.width+'x'+this.img.height);
			this.elm.text('');
    		this.url(this.opts.url);
            this.opts.w=this.opts.w||this.elm.width();
            this.opts.h=this.opts.h||this.elm.height();
    		if(this.opts.w<this.img.width) {
    			//console.log('percent:'+percent);
				this.elm.css('background-size', '100% auto'); 
				//hack ie8
				this.elm.css('filter',"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+this.opts.url+"', sizingMethod='scale')\\9");
            }
            this.percent = this.opts.w/this.img.width;
            var rect = this.opts.rect||this.defRect();
            var dh = this.img.height*this.percent;
            this.elm.height(Math.max(this.opts.h, dh));     
            if(this.selector==null) {
                this.selector = $('<div class="imagerect-selector"></div>').appendTo(this.elm);
                this.selector.on('dblclick', $.proxy(this.dblclick, this));
                this.selector.on('mousedown', $.proxy(this.mousedown, this));
                this.selector.on('mouseup', $.proxy(this.mouseup, this));
				this.selector.css('resize', this.opts.resize||'both');
            }
            this.rect(rect);       
            this.elm.trigger({
                type: 'load',
                value: this.rect(),
                relatedTarget:this.img
            });
    	},
        defRect:function() {
            return {w:this.img.width/2,h:this.img.height/2,
                    x:this.img.width/4,y:this.img.height/4};
        },
        url:function(url) {
          if(!!url) {            
            this.elm.css({'background': 'url('+url+') no-repeat'});
          }
          return this.opts.url;
        },
        option:function(option) {
            if(!!option) {
			  if(!!option.url) {
				var img = new Image();
				//img.crossOrigin = "Anonymous";
				img.src = option.url;
				$(img).on('load', $.proxy(this.imageload, this));
				this.img = img;
				this.elm.text('loading...');
			  }
			  this.opts = $.extend(this.opts, option);
            }
            return this.opts;
        },
    	mousedown:function(evt) {
            evt.stopPropagation();
            //evt.preventDefault();
            var e = evt.originalEvent;
            var sw = this.selector.width();
            var sh = this.selector.height();
            this.sw = sw;
            this.sh = sh;
            this.offsetDx = (e.clientX - this.elm.offset().left);
            this.offsetDy = (e.clientY - this.elm.offset().top);
            this.selector.on('mousemove', $.proxy(this.mousemove, this));
    	},
    	mousemove:function(evt) {
            evt.stopPropagation();
            //evt.preventDefault();
    		var e = evt.originalEvent;
            var sw = this.selector.width();
            var sh = this.selector.height();
            if(this.sw!==sw) return;
            if(this.sh!==sh) return;
            this.offsetMx = (e.clientX - this.elm.offset().left);
            this.offsetMy = (e.clientY - this.elm.offset().top);
    		this.move();
            this.offsetDx=this.offsetMx;
            this.offsetDy=this.offsetMy;
    	},
    	mouseup:function(evt) {
            this.selector.off('mousemove');
            var p = this.percent;
            var co = this.currOffset();
            var pw = this.selector.innerWidth();
            var ph = this.selector.innerHeight();
            $.extend(this.opts.rect, {x:co.left/p,y:co.top/p,w:pw/p,h:ph/p});
            this.elm.trigger({
                type: 'pick',
                value: this.rect()
            });
    	},
    	move:function() {
    		var dx = (this.offsetMx-this.offsetDx);
    		var dy = (this.offsetMy-this.offsetDy);
    		var offset = this.selector.offset();
    		var sx = offset.left;
    		var sy = offset.top;
    		this.selector.offset({top:sy+dy, left:sx+dx});
    	},
        dblclick:function(e) {
            e.stopPropagation();
            e.preventDefault();
            if(!this.opts.dblToggle) {
                this.opts.dblToggle = true;
                this.lastRect = this.rect();
                this.elm.trigger({
                    type: 'pick',
                    value: this.rect({x:0,y:0,w:this.img.width,h:this.img.height})
                });
            } else {
                this.opts.dblToggle = false;
                var l = this.lastRect||this.defRect();
				console.log(l);
                this.elm.trigger({
                    type: 'pick',
                    value: this.rect({x:l.x,y:l.y,w:l.w,h:l.h})
                });                
            }
        },
        currOffset:function() {
            var offset = this.selector.offset();
            var offset1 = this.elm.offset();
            var bw = (this.selector.outerWidth(true)-this.selector.innerWidth())/2;
            var bh = (this.selector.outerHeight(true)-this.selector.innerHeight())/2;
            //console.log(bw+'x'+bh);
            var px = offset.left-offset1.left+bw;
            var py = offset.top-offset1.top+bh;
            return {left:px, top:py};
        },
    	rect: function(rect) {
            var percent = this.percent;
            if(!!rect) {
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
                this.selector.width(sw);
                this.selector.height(sh);
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