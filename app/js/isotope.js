(function($) {
	"use strict";

	window.THB_Isotope = function( target, options ) {

		if( ! target.isotope ) {
			return;
		}

		var self = this;

		/**
		 * Target element.
		 *
		 * @type {jQuery}
		 */
		target = $(target);

		/**
		 * Isotope options.
		 *
		 * @type {Object}
		 */
		options = $.extend({
			/**
			 * Items removal callback.
			 *
			 * @type {Function}
			 */
			callbackRemove: null,

			/**
			 * Items insertion callback.
			 *
			 * @type {Function}
			 */
			callbackInsert: null,

			/**
			 * Style adjustments function.
			 *
			 * @return {Function}
			 */
			styleAdjust: function() {
				if ( $("body").hasClass("thb-desktop") ) {
					$( "html" ).css( 'overflow-y', 'scroll' );
				}
			},

			/**
			 * Items selector.
			 *
			 * @type {String}
			 */
			itemSelector: ".item",

			/**
			 * Filter.
			 *
			 * @type {THB_Filter|Boolean}
			 */
			filter: false
		}, options);

		/**
		 * Retrieve the list of items.
		 *
		 * @return {jQuery}
		 */
		this.getItems = function() {
			return target.find( options.itemSelector );
		};

		/**
		 * Filter the Isotope view.
		 *
		 * @param {String} filter
		 */
		this.filter = function( selector ) {
			target.isotope({
				filter: selector
			});
		};

		/**
		 * Inject new items into the Isotope view.
		 *
		 * @param {String} raw Raw HTML.
		 * @param {Function} callback
		 */
		this.insert = function( raw, callback ) {
			options.callbackInsert = callback;
			target.isotope( 'insert', $(raw) );
		};

		/**
		 * Remove all the items from the Isotope view.
		 *
		 * @param {Function} callback
		 */
		this.remove = function( callback ) {
			options.callbackRemove = callback;
			target.isotope( 'remove', this.getItems() );
		};

		/**
		 * Initialize the Isotope container.
		 */
		options.styleAdjust();
		$( "body.thb-desktop" ).css( 'overflow-x', 'hidden' );

		$( target ).imagesLoaded( function() {
			target.isotope({
				itemSelector: options.itemSelector
			});

			target.isotope( 'on', 'layoutComplete', function() {
				if ( options.callbackInsert ) {
					options.callbackInsert();
					options.callbackInsert = null;
				}
			} );

			target.isotope( 'on', 'removeComplete', function() {
				if ( options.callbackRemove ) {
					options.callbackRemove();
					options.callbackRemove = null;
				}
			} );
		} );

	};

})(jQuery);