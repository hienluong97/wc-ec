if (!customElements.get('section-product-recently-viewed')) {
  class TG_SectionProductRecentlyViewed extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
          this.element = this;
          this.options = JSON.parse(this.element.getAttribute('data-section-settings'));

          if (this.options['productId']) {
          this._saveProduct(this.options['productId']);
          }

          // this._fetchProducts();

          if (Shopify.designMode) {
              setTimeout(this._fetchProducts.bind(this), 1000);
          }else{
              this._fetchProducts();
          }
      }


    _saveProduct(productId) {
      var items = JSON.parse(localStorage.getItem('recentlyViewedProducts') || '[]');

      // We check if the current product already exists, and if it does not, we add it at the start
      if (!items.includes(productId)) {
        items.unshift(productId);
      }

      // Then, we save the current product into the local storage, by keeping only the viewedCount most recent
      try {
        localStorage.setItem('recentlyViewedProducts', JSON.stringify(items.slice(0, this.options['viewedCount'])));
      } catch (error) {
        // Do nothing, this may happen in Safari in incognito mode
      }
    }

    _fetchProducts() {
      var _this = this;

      var queryString = this._getSearchQueryString();

      if (queryString === '') {
        return;
      }

      // If we have a non empty query string we do a search query
      fetch(window.routes.searchUrl + '?section_id=' + this.options['sectionId'] + '&type=product&q=' + queryString, {
        credentials: 'same-origin',
        method: 'GET'
      }).then(function (response) {
        response.text().then(function (content) {
          var tempElement = document.createElement('div');
          tempElement.innerHTML = content;

          // Set the content
          _this.element.querySelector('.ProductRecentlyViewed__Body').innerHTML = tempElement.querySelector('.ProductRecentlyViewed__Body').innerHTML;

          // Show the section
          _this.element.parentNode.style.display = 'block';

          if (_this.options['layout'] === 'carousel' ) {
            // And finally let's create the carousel !
            _this.carousel = new themegoal.components.Carousel(_this.element.querySelector('[data-flickity-config]'));
          }
        });
      });
    }

    _getSearchQueryString() {
      var items = JSON.parse(localStorage.getItem('recentlyViewedProducts') || '[]');

      // If we are on a product template, we make sure to remove the main product from the related product
      if (items.includes(this.options['productId'])) {
        items.splice(items.indexOf(this.options['productId']), 1);
      }

      return items.map(function (item) {
        return 'id:' + item;
      }).join(' OR ');
    }
    
  }
    
  customElements.define('section-product-recently-viewed', TG_SectionProductRecentlyViewed);
}