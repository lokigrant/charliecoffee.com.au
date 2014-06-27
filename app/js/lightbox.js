(function($) {
	"use strict";

	window.THB_Lightbox = function() {

		/**
		 * Images in galleries.
		 *
		 * @type {string}
		 */
		this.galleriesSelector = ".thb-gallery, .gallery, .thb-images-container";

		/**
		 * Images.
		 *
		 * @type {string}
		 */
		this.imagesSelector = ".thb-lightbox, .hentry a[href$=jpg], .hentry a[href$=png], .hentry a[href$=gif], .hentry a[href$=jpeg]";

		/**
		 * Initialize the lightbox component.
		 */
		this.init = function() {
			this["galleries"] = $( this.galleriesSelector );
			this["images"] = $( this.imagesSelector ).not( this.galleries.find("a") );
		};

		/**
		 * Add new elements to the target set.
		 *
		 * @param {jQuery|string} new_elements
		 */
		this.add = function( new_elements ) {
			new_elements = $(new_elements);

			this["images"] = this["images"].add( new_elements );
		};

	};
})(jQuery);