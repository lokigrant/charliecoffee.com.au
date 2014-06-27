(function($) {
	"use strict";

	/**
	 * Main nav toggle
	 */
	function menuToggle() {
		var triggerOpen = $('#main-nav-trigger-open'),
			triggerClose = $('#main-nav-trigger-close');

		function openMenu() {
			$('#menu-container').css("visibility", "visible");
			$('body').addClass('menu-open');
		}

		function closeMenu() {
			$('body').removeClass('menu-open');
			$.thb.transition('.wrapper', function() {
				$('#menu-container').css("visibility", "hidden");
			});
		}

		triggerOpen.bind('click', function(){
			openMenu();
			return false;
		});

		triggerClose.bind('click', function(){
			closeMenu();
			return false;
		});

		$.thb.key("esc", function() {
			if( $("body").hasClass("menu-open") ) {
				closeMenu();
			}
		});

	}

	/**
	 * Footer sidebar toggle
	 */
	function footer_sidebarToggle() {
		var thb_toggling_menu = false;

		$("#footer-sidebar-trigger").on("click", function() {
			if( thb_toggling_menu ) {
				return false;
			}

			thb_toggling_menu = true;

			var nav_active = $("body").hasClass("footer-sidebar-open");

			if( nav_active ) {
				$.thb.transition('#footer-sidebar', function() {
					$("#footer-sidebar").css("visibility", "hidden");
					thb_toggling_menu = false;
				});

				$("body").removeClass("footer-sidebar-open");
			}
			else {
				$("#footer-sidebar").css("visibility", "visible");

				$.thb.transition('#footer-sidebar', function() {
					thb_toggling_menu = false;
				});

				setTimeout(function() {
					$("body").addClass("footer-sidebar-open");
				}, 1);
			}

			return false;
		});
	}

	$(document).ready(function() {
		/**
		 * Featured video
		 */
		if ( $(".thb-featured-video").length ) {
			thb_video_holders( $(".thb-featured-video") );
			$(window).trigger('resize');

			var holder = $(".thb-featured-video").find(".thb-video-holder"),
				autoplay = holder.data("autoplay"),
				player = holder.find("iframe,video").data("player");

			if ( autoplay && player ) {
				player.play();
			}
		}

		menuToggle();
		footer_sidebarToggle();

		$(".thb-gallery").owlCarousel({
			navigation : true,
			slideSpeed : 300,
			paginationSpeed : 400,
			singleItem : false,
			items : 1,
			lazyLoad : true,
			theme : 'thb-theme'
		});

		/**
		 * Photogallery.
		 */
		if( $("body.page-template-template-photogallery-php").length ) {

			if( !$("body.thb-password-protected").length ) { // Check if page is not password protected

				var photogallery = $("#thb-grid-layout"),
					button = $("#thb-infinite-scroll-button"),
					photogallery_isotope = new THB_Isotope( photogallery, {
						styleAdjust: function() {}
					} );

				button.on("click", function() {
					$.thb.loadUrl(photogallery.attr("data-url"), {
						complete: function( data ) {
							var items = $(data).find("#thb-grid-layout .item"),
								new_data_url = $(data).find("#thb-grid-layout").data("url");

							if( ! $(data).find("#thb-infinite-scroll-nav").length ) {
								$("#thb-infinite-scroll-nav").remove();
							}
							else {
								photogallery.attr("data-url", new_data_url);
							}

							photogallery_isotope.insert(items, function() {
								$("#page-content-wrapper").getNiceScroll().resize();
							});
							window.thb_lightbox_handler.init();
						}
					});

					return false;
				});

			}
		}

		/**
		 * Portfolio.
		 */
		if( $("body.page-template-template-portfolio-php").length && typeof thb_portfolio != 'undefined' ) {
			if( !$("body.thb-password-protected").length ) { // Check if page is not password protected

				var useAjax = thb_portfolio.use_ajax === "1",
					isotopeContainer = $("#thb-grid-layout"),
					thb_portfolio_filtering = false;

				if( ! useAjax ) {
					$("#filterlist li").each(function() {
						var data = $(this).data("filter");

						if( data !== "" ) {
							if( ! isotopeContainer.find("[data-filter-" + data + "]").length ) {
								$(this).remove();
							}
						}
					});
				}

				var filter_controls = useAjax ? false : "#filterlist";

				var portfolio_isotope = new THB_Isotope( isotopeContainer, {
					styleAdjust: function() {},
					filter: new THB_Filter(isotopeContainer, {
						controls: filter_controls,
						controlsOnClass: "active",
						filter: function( selector ) {
							portfolio_isotope.filter(selector);
						}
					})
				});

				window.thb_portfolio_reload = function( url, callback ) {
					portfolio_isotope.remove(function() {
						$.thb.pageChange(url, {
							filter: false,
							complete: function( data ) {
								var items = $(data).find("#thb-grid-layout .item");

								if( $(".thb-navigation").length ) {
									if ( $(data).find(".thb-navigation").length ) {
										$(".thb-navigation").replaceWith( $(data).find(".thb-navigation") );
									} else {
										$(".thb-navigation").html('');
									}
								}
								else {
									isotopeContainer.after( $(data).find(".thb-navigation") );
								}

								portfolio_isotope.insert(items, function() {
									thb_portfolio_bind_pagination();

									if( callback !== undefined ) {
										callback();
									}
								});
							}
						});
					});
				};

				window.thb_portfolio_bind_pagination = function() {
					$(".thb-navigation a").on("click", function() {
						thb_portfolio_reload( $(this).attr("href") );
						return false;
					});
				};

				window.thb_portfolio_bind_filter = function() {
					$("#filterlist li").on("click", function() {
						if( thb_portfolio_filtering ) {
							return false;
						}

						thb_portfolio_filtering = true;

						thb_portfolio_reload( $(this).data("href"), function() {
							thb_portfolio_filtering = false;
						} );

						$("#filterlist li").removeClass("active");
						$(this).addClass("active");
						return false;
					});
				};

				if( useAjax ) {
					thb_portfolio_bind_filter();
					thb_portfolio_bind_pagination();
				}

			}
		}

		/**
		 * Showcase
		 */
		if( $("body.page-template-template-showcase-php").length || $("body.single-works").length ) {

			if( !$("body.thb-password-protected").length ) { // Check if page is not password protected

				$(".thb-slideshow-container")
					.thb_stretcher({
						adapt: false
					});

				var thb_slideshow_container = $('.thb-slideshow-container');
				var thb_slideshow_caption_container = $('.caption-container');

				window.slide_next = function() {
					thb_slideshow_container.cycle('next');
					thb_slideshow_caption_container.cycle('next');

					$(".thb-slideshow-container iframe, .thb-slideshow-container video").data("player").pause();

					var slide = thb_slideshow_container.find(".slide").eq(thb_cycle_current_slide_index),
						holder = slide.find(".thb-video-holder"),
						autoplay = holder.data("autoplay"),
						player = holder.find("iframe,video").data("player");

					if ( autoplay && player ) {
						player.play();
						slideshow_pause();
					}
				};

				window.slide_prev = function() {
					thb_slideshow_container.cycle('prev');
					thb_slideshow_caption_container.cycle('prev');

					$(".thb-slideshow-container iframe, .thb-slideshow-container video").data("player").pause();

					var slide = thb_slideshow_container.find(".slide").eq(thb_cycle_current_slide_index),
						holder = slide.find(".thb-video-holder"),
						autoplay = holder.data("autoplay"),
						player = holder.find("iframe,video").data("player");

					if ( autoplay && player ) {
						player.play();
						slideshow_pause();
					}
				};

				var ctn = $( ".thb-slideshow-container" ).get(0);

				Hammer( ctn ).on( "swipeleft", function() {
					slide_next();
				} );

				Hammer( ctn ).on( "swiperight", function() {
					slide_prev();
				} );

				window.slideshow_pause = function() {
					thb_slideshow_container.cycle("pause");
					thb_slideshow_caption_container.cycle("pause");
				};

				window.thb_cycle_current_slide_index = 0;

				if ( ! $( "body.thb-fitted-images" ).length ) {
					thb_video_holders( $(".slide") );
				}

				thb_slideshow_container
					.cycle({
						speed: 350,
						timeout: slideshow_timeout
					})
					.on("cycle-before", function( e, o) {
						window.thb_cycle_current_slide_index = o.nextSlide;
					})
					.on("cycle-after", function( e, o ) {
						var index = o.nextSlide + 1,
							str = index < 10 ? "0" + index : index;

						$(".thb-ui-control.thb-numbers span").html( str );
					});

				thb_slideshow_caption_container.cycle({
					speed: 350,
					timeout: slideshow_timeout
				});

				if ( ! slideshow_autoplay ) {
					slideshow_pause();
				}

				// Embed/selfhosted video slides

				$(window).on("thb-loaded-videos", function() {
					var first_slide = $(".thb-slideshow-container .slide").first();

					first_slide.find("iframe, video").each(function() {
						var holder = $(this).parent(),
							autoplay = holder.data("autoplay"),
							loop = holder.data("loop"),
							player = $(this).data("player");

						if ( autoplay && player ) {
							player.play();
							slideshow_pause();
						}
					});
				});

				$('.thb-next').on('click', function() {
					slide_next();

					return false;
				});

				$('.thb-prev').on('click', function() {
					slide_prev();

					return false;
				});

				$.thb.key("left", function() {
					slide_prev();

					return false;
				});

				$.thb.key("right", function() {
					slide_next();

					return false;
				});

				// Hide/Show image overlay

				var thb_slideshow_overlay_toggle = new THB_Toggle({
					target: $(".thb-container.top"),
					on: function() {
						$("body").addClass( 'overlay-disabled' );
					},
					off: function() {
						$('.thb-featuredimage-overlay, .thb-container.top').css("visibility", "visible");
						$("body").removeClass( 'overlay-disabled' );
					},
					onTransitionEnd: function() {
						$('.thb-featuredimage-overlay, .thb-container.top').css("visibility", "hidden");
					}
				});

				$.thb.key("esc", thb_slideshow_overlay_toggle.off);
				$.thb.key("space", thb_slideshow_overlay_toggle.toggle);
				$('.thb-hide-overlay').on('click', thb_slideshow_overlay_toggle.toggle);

				// Show the image info caption

				$('.thb-info').on('click', function() {
					$(this).prev().show();

					return false;
				});

				// Hide the image info caption

				$('.thb-info-close').on('click', function() {
					$('.thb-info-container').hide();

					return false;
				});

				// Fit the images

				if( $("body.thb-fitted-images").length ) {

					thb_slideshow_container.thb_stretcher({
						adapt: true
					});

				} else {

					$.thb.toggle( $('.thb-fit'), {
						on: function( el ) {
							thb_video_holders_off( $(".slide") );
							thb_slideshow_container.thb_stretcher({
								adapt: true
							});
							$('.thb-fit').addClass('thb-fitted');
						},
						off: function( el ) {
							thb_video_holders( $(".slide") );
							thb_slideshow_container.thb_stretcher({
								adapt: false
							});
							$('.thb-fit').removeClass('thb-fitted');
						}
					});

				}

			}
		}

		if( $("body.thb-header-fixed").length ) {
			$('#page-content-wrapper').css('padding-top', $('#header').outerHeight() );
			$('#header').on('click', function(){
				$('#page-content-wrapper').scrollTo( 0, 250 );
			} );

			$('#page-content-wrapper').on('scroll', function() {
				if( $(this).scrollTop() > 0 ) {
					$('#header').addClass('thb-scroll');
				} else {
					$('#header').removeClass('thb-scroll');
				}
			});
		}

		$(".thb-container").fitVids();

		$(".page-header-detail").on("click", function() {
			$("#page-content-wrapper").scrollTo( $(this).attr("href"), 500 );

			return false;
		});

		$("#page-content-wrapper, .thb-extra-description, #footer-sidebar").niceScroll({
			cursorborder: "1px solid #000",
			cursorborderradius: "0",
			horizrailenabled: false
		});

		$("#menu-container").niceScroll({
			cursorcolor: "#999",
			cursorborder: "1px solid #000",
			cursorborderradius: "0"
		});

		/**
		 * Making elements appear as soon as they're in the viewport.
		 */
		$(".inner-wrapper, .post").on("inview", function( event, isVisible ) {
			if( ! isVisible || $(this).hasClass("visible") ) {
				return;
			}

			$(this).addClass("visible");
		});
	});

	if( $('body').hasClass('thb-mobile') ) {
		FastClick.attach(document.body);
	}

})(jQuery);

/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms-csstransforms3d-csstransitions-shiv-cssclasses-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.7.1",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e}),q.csstransforms=function(){return!!F("transform")},q.csstransforms3d=function(){var a=!!F("perspective");return a&&"webkitPerspective"in g.style&&w("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},q.csstransitions=function(){return F("transition")};for(var G in q)y(q,G)&&(v=G.toLowerCase(),e[v]=q[G](),t.push((e[v]?"":"no-")+v));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
