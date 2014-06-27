/**
 * Frontend controller.
 *
 * This file is entitled to manage all the interactions in the frontend.
 *
 * ---
 *
 * The Happy Framework: WordPress Development Framework
 * Copyright 2014, Andrea Gandino & Simone Maranzana
 *
 * Licensed under The MIT License
 * Redistribuitions of files must retain the above copyright notice.
 *
 * @package Assets\Frontend\JS
 * @author The Happy Bit <thehappybit@gmail.com>
 * @copyright Copyright 2014, Andrea Gandino & Simone Maranzana
 * @link http://
 * @since The Happy Framework v 2.0
 * @license MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

/**
 * Video shortcodes
 * -----------------------------------------------------------------------------
 */
 window.thb_loaded_videos = 0;

(function($) {
	"use strict";

	window.thb_video_holder = function( holder ) {
		var context = holder.parent(),
			context_height = context.outerHeight(),
			context_width = context.outerWidth(),
			ratio_x = holder.data( "ratio-x" ) !== undefined ? holder.data( "ratio-x" ) : 16,
			ratio_y = holder.data( "ratio-y" ) !== undefined ? holder.data( "ratio-y" ) : 9,
			y_alignment = holder.data( "y-alignment" ) !== undefined ? holder.data( "y-alignment" ) : "middle",
			projected_width = 0,
			projected_height = 0;

		if ( context_height < ( context_width * ratio_y / ratio_x ) ) {
			projected_height = context_width * ratio_y / ratio_x;

			holder.css( "width", context_width );
			holder.css( "height", projected_height );
			holder.css( "margin-left", 0 );
			holder.css( "margin-top", 0 );

			if ( y_alignment == "middle" ) {
				holder.css( "margin-top", ( context_height - projected_height ) / 2 );
			}
		}
		else {
			projected_width = context_height * ratio_x / ratio_y;

			holder.css( "width", projected_width );
			holder.css( "height", context_height );
			holder.css( "margin-top", 0 );
			holder.css( "margin-left", ( context_width - projected_width ) / 2 );
		}
	};

	window.thb_video_holders = function( context, holder_selector ) {
		if ( holder_selector === undefined ) {
			holder_selector = '.thb-video-holder[data-fill="1"]';
		}

		$( holder_selector, context ).each(function(){
			thb_video_holder( $( this ) );
		});

		$(window).on( "resize.thb_video_holders", function() {
			$( holder_selector, context ).each(function(){
				thb_video_holder( $( this ) );
			});
		}.debounce(100) );
	};

	window.thb_video_holders_off = function( context, holder_selector ) {
		if ( holder_selector === undefined ) {
			holder_selector = '.thb-video-holder[data-fill="1"]';
		}

		$( window ).off( ".thb_video_holders" );

		$( holder_selector, context ).each(function(){
			$( this ).removeAttr( "style" );
		});
	};

	window.THB_Video = function( id, obj, type ) {
		var self = this;

		this.id = id;
		this.obj = obj;
		this.type = type;

		/**
		 * State
		 */
		this.state = function( code ) {
			var state = "";

			switch( code ) {
				case 0:
					state = "finished";
					break;
				case 1:
					state = "playing";
					break;
				default:
					state = "paused";
					break;
			}

			return state;
		};

		/**
		 * Videos loaded callback
		 */
		this.callbackCheck = function() {
			window.thb_loaded_videos++;

			this.obj.addClass("thb-video-loaded");

			if ( window.thb_loaded_videos === window.thb_total_videos ) {
				$(window).trigger("thb-loaded-videos");
			}
		};

		/**
		 * Init
		 */
		this.init = function() {
			var self = this;

			switch( this.type ) {
				case "youtube":
					this.api = new YT.Player("youtube-" + this.id, {
						events: {
							onStateChange: function(state) {
								self.obj.trigger("change", [self.state(state.data)]);
							},
							onReady: function() {
								self.callbackCheck();
							}
						}
					});

					this.play = function() { this.api.playVideo(); };
					this.pause = function() { this.api.pauseVideo(); };
					this.stop = function() { this.api.stopVideo(); };

					break;
				case "vimeo":
					this.api = new Froogaloop(this.obj.get(0));

					this.api.addEvent("ready", function(player_id) {
						self.api.addEvent("play", function() {
							self.obj.trigger("change", [self.state(1)]);
						});
						self.api.addEvent("pause", function() {
							self.obj.trigger("change", [self.state(2)]);
						});
						self.api.addEvent("finish", function() {
							self.obj.trigger("change", [self.state(0)]);
						});

						self.callbackCheck();
					});

					this.play = function() { this.api.api("play"); };
					this.pause = function() { this.api.api("pause"); };
					this.stop = function() { this.api.api("pause"); };

					break;
				default:
					this.api = this.obj.get(0);

					this.api.addEventListener("loadedmetadata", function() {
						self.obj.data('width', self.obj.get(0).videoWidth);
						self.obj.data('height', self.obj.get(0).videoHeight);

						if( self.obj.attr("autoplay") ) {
							self.play();
						}

						self.callbackCheck();
					}, false);
					this.api.addEventListener("play", function() {
						self.obj.trigger("change", [self.state(1)]);
					}, false);
					this.api.addEventListener("pause", function() {
						self.obj.trigger("change", [self.state(2)]);
					}, false);
					this.api.addEventListener("ended", function() {
						self.obj.trigger("change", [self.state(0)]);
					}, false);

					this.play = function() { this.api.play(); };
					this.pause = function() { this.api.pause(); };
					this.stop = function() { this.api.pause(); };

					break;
			}
		};

		/**
		 * Change
		 */
		this.change = function(state) {};

		this.init();
	};

	window.thb_total_videos = 0;
	window.thb_video_ids = 0;

	$(document).ready(function() {
		window.thb_total_videos = $("iframe.thb-video-api, video.wp-video-shortcode").length;

		if ( window.thb_total_videos == 0 ) {
			$( window ).trigger( "thb-loaded-videos" );
		}

		$("iframe[src^='//player.vimeo'].thb-video-api").each(function() {
			$(this).data( "player", new THB_Video( window.thb_video_ids++, $(this), 'vimeo' ) );
		});

		if( $("iframe[src*='youtu'].thb-video-api").length ) {
			var tag = document.createElement("script");
			tag.src = "http://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}

		$("video.wp-video-shortcode").each(function() {
			$(this).data( "player", new THB_Video( window.thb_video_ids++, $(this), 'selfhosted' ) );
		});
	});

	window.onYouTubeIframeAPIReady = function() {
		$( window ).trigger( "thb-youtube-ready" );

		$("iframe[src*='youtu'].thb-video-api").each(function() {
			var id = window.thb_video_ids++;

			$(this).attr( "id", "youtube-" + id );
			$(this).data( "player", new THB_Video( id, $(this), 'youtube' ) );
		});
	};
})(jQuery);

/**
 * Translations
 * -----------------------------------------------------------------------------
 */
(function($) {
	"use strict";

	$.thb.translate = function( key ) {
		if( $.thb.translations[key] ) {
			return $.thb.translations[key];
		}

		return key;
	};
})(jQuery);

/**
 * Remove empty paragraphs
 * -----------------------------------------------------------------------------
 */
(function($) {
	"use strict";

	$( document ).ready( function() {
		$('p')
			.filter(function() {
				return $.trim($(this).html()) === '';
			})
			.remove();
	} );
})(jQuery);

/**
 * ****************************************************************************
 * THB menu
 *
 * $("#menu-container").menu();
 * ****************************************************************************
 */
(function($) {
	"use strict";

	$.fn.menu = function(params) {

		// Parameters
		// --------------------------------------------------------------------
		var settings = {
			speed: 350,
			display: 'block',
			easing: 'linear',
			openClass: 'current-menu-item',
			'showCallback': function() {},
			'hideCallback': function() {}
		};

		// Parameters
		$.extend(settings, params);

		// Menu instance
		// --------------------------------------------------------------------
		var instance = {

			showSubMenu: function(subMenu) {
				subMenu
					.stop(true, true)
					.css({
						opacity: 0,
						display: settings.display
					})
					.animate({
						opacity: 1
					}, settings.speed, settings.easing, function() {
						settings.showCallback();
					});
			},

			hideSubMenu: function(subMenu) {
				subMenu
					.stop(true, true)
					.animate({
						opacity: 0
					}, settings.speed / 2, settings.easing, function() {
						$(this).hide();
						settings.hideCallback();
					});
			}

		};

		return this.each(function() {
			var menuContainer = $(this),
				menu = menuContainer.find("> ul"),
				menuItems = menu.find("> li"),
				subMenuItems = menuItems.find('li').andSelf();

			menuItems.each(function() {
				$(this).find('> a').addClass('needsclick');

				var subMenu = $(this).find('> ul');

				if( subMenu.length ) {
					subMenu.css({
						display: 'none'
					});
				}
			});

			// Binding events
			subMenuItems.each(function() {
				var item = $(this),
					subMenu = item.find("> ul");

				if( subMenu.length ) {
					item
						.find('> a')
						.addClass('w-sub needsclick');

					item
						.mouseenter(function() {
							$(this).addClass(settings.openClass);
							instance.showSubMenu(subMenu);
						})
						.mouseleave(function() {
							$(this).removeClass(settings.openClass);
							instance.hideSubMenu(subMenu);
						});
				}
			});
		});

	};

})(jQuery);