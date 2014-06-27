(function($) {
	"use strict";

	window.THB_MagnificPopup = function( options ) {

		var self = this;

		/**
		 * Lightbox handler.
		 */
		var lightbox = new THB_Lightbox();

		/**
		 * Library handler.
		 *
		 * @type {string}
		 */
		var handler = "magnificPopup";

		/**
		 * Filter options.
		 *
		 * @type {Object}
		 */
		options = $.extend( {
			image: {
				titleSrc: function(item) {
					var caption = '';

					if ( item.el.next('.wp-caption-text').length ) {
						caption = item.el.next('.wp-caption-text').text();
					}
					else if ( item.el.attr("title") != "" ) {
						caption = item.el.attr("title");
					}

					return caption;
				}
			},
			removalDelay: 200,
			mainClass: 'thb-mfp-skin'
		}, options );

		/**
		 * Initialize the lightbox component.
		 */
		this.init = function() {
			lightbox.init();

			this.bindImages( lightbox["images"] );
			this.bindGalleries( lightbox["galleries"] );
		};

		/**
		 * Bind the lightbox event of the selected images.
		 *
		 * @param {jQuery} target
		 */
		this.bindImages = function( target ) {
			if ( target[handler] ) {
				target[handler]( options );
			}
		};

		/**
		 * Bind the lightbox event of the selected galleries.
		 *
		 * @param {jQuery} target
		 */
		this.bindGalleries = function( target ) {
			target.each( function() {
				self.bindGallery( $(this) );
			} );
		};

		/**
		 * Bind the lightbox event of the selected gallery images.
		 *
		 * @param {jQuery} target
		 */
		this.bindGallery = function( target ) {
			var galleriesOptions = $.extend( {
				delegate: "a[href$=jpg], a[href$=png], a[href$=gif], a[href$=jpeg], a.mfp-iframe",
				gallery:{
					enabled:true
				}
			}, options );

			if ( target[handler] ) {
				target[handler]( galleriesOptions );
			}
		};

	};

	$(document).ready(function() {
		window.thb_lightbox_handler = new THB_MagnificPopup( { type: 'image' } );

		window.thb_lightbox_handler.init();
	});
})(jQuery);