/**
 * Owl Carousel multirow plugin v1.0
 * by Taglive 2019
 */
!function(o,t,n,w){OwlMrow=function(t){this.owl=t,this.owl.options=o.extend({},OwlMrow.Defaults,this.owl.options),this.handlers={"initialize.owl.carousel":o.proxy(function(o){this.owl.settings.owlMrow&&this.build2row(this)},this)},this.owl.$element.on(this.handlers)},OwlMrow.Defaults={owlMrow:!1,Owlrowcnt:2,owlMrowTarget:"fennec-item",owlMrowContainer:"owlMrow-item"},OwlMrow.prototype.build2row=function(t){var n=o(t.owl.$element),w=n.find("."+t.owl.options.owlMrowTarget),i=[],l=t.owl.options.Owlrowcnt;void 0===l&&(l=2),o.each(w,function(o,t){var n=o%l;null==i[n]?(i[n]=[]).push(t):i[n].push(t)}),n.empty(),t.upTodown(t,i,n)},OwlMrow.prototype.upTodown=function(t,n,w){var i=t.owl.options.owlMrowContainer,l=t.owl.options.margin;o.each(n[0],function(t,r){var e=o('<div class="'+i+'"/>'),s=n[0][t];s.style.marginBottom=l+"px",e.append(s),n.forEach(function(o,n){null!=o[t]&&(o[t].style.marginBottom=l+"px",e.append(o[t]))}),w.append(e)})},OwlMrow.prototype.destroy=function(){var o,t;for(o in this.handlers)this.owl.$element.off(o,this.handlers[o]);for(t in Object.getOwnPropertyNames(this))"function"!=typeof this[t]&&(this[t]=null)},o.fn.owlCarousel.Constructor.Plugins.owlMrow=OwlMrow}(window.Zepto||window.jQuery,window,document);