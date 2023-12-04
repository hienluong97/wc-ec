if (!customElements.get('section-product')) {
  class TG_SectionProduct extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.element = this;
      this.delegateElement = new themegoal.libs.Delegate(this.element);
      this.options = JSON.parse(this.element.getAttribute('data-section-settings'));

      this.productVariants = new themegoal.components_business.product_variants.ProductVariants(this.element, this.options);

      this._initStackGalleryCurrentImageStatus();
    
      let productSlideshowElement = this.element.querySelector('.ProductGallery__Carousel');
      let productSlideshowNavElement = this.element.querySelector('.ProductGallery__Thumbs');

      if (productSlideshowElement) {
        this.productSlideshow = new themegoal.components.Carousel(productSlideshowElement);
      }

      if (productSlideshowNavElement) {
        this.productSlideshowNav = new themegoal.components.Carousel(productSlideshowNavElement);
      }

      if (this.options['enableImageZoom']) {
        this.imageZoomInstance = new themegoal.components_business.product_variants.ProductImageModal(this.element);
      }

      let styleWithCarouselEle = this.element.querySelectorAll(".ProductStyleWith__Body .ProductList--carousel");

      this.styleWithCarousels = [];
      if (styleWithCarouselEle){
        let _this = this;
        styleWithCarouselEle.forEach(function (ele) {
          _this.styleWithCarousels.push(new themegoal.components.Carousel(ele));
        });
      }

      let offscreenElement = this.element.querySelector('.Site__TopLevelElment');

      if (offscreenElement) {
        document.body.appendChild(offscreenElement);
      }

      this.blockRecommendationsElementRelated = this.element.querySelector('.ProductBlockRecommendations--related');

      if (this.blockRecommendationsElementRelated) {
        this._loadRecommendations();
      }

      this.blockRecommendationsElementComplementary = this.element.querySelector('.ProductBlockRecommendations--complementary');

      if (this.blockRecommendationsElementComplementary) {
        this._loadRecommendationsComplementary();
      }

      this._bindEventsListeners();
    }

    disconnectedCallback(){
      if(this.delegateElement)this.delegateElement.destroy();
      if(this.productSlideshow)this.productSlideshow.destroy();
      if(this.productSlideshowNav)this.productSlideshowNav.destroy();
      if(this.styleWithCarousels){
        this.styleWithCarousels.forEach(function (carousel) {
          carousel.destroy();
        });
      }
    }
  
    _bindEventsListeners() {
      this.delegateElement.on('variant:changed', this._updateSlideshowImage.bind(this));
    }
  
    _loadRecommendations() {
      var _this = this;
  
      var url = window.routes.productRecommendationsUrl + '?section_id=product-block-recommendations&intent=related&product_id=' + this.options['productId'] + '&limit=' + this.options['recommendationsRelatedCount'];
  
      return fetch(url).then(function (response) {
        return response.text().then(function (content) {
          var container = document.createElement('div');
          container.innerHTML = content;
  
          let recommendationsElement = _this.element.querySelector('.ProductBlockRecommendations--related .ProductBlockRecommendations__Body');
          
          //has recommend product
          if(container.querySelector('.Carousel__Item')){
            recommendationsElement.querySelector('.ProductList--carousel').innerHTML = container.querySelector(".ProductBlockRecommendations__Body").innerHTML;
            new themegoal.components.Carousel(recommendationsElement.querySelector('[data-flickity-config]'));
  
          }else{
            // Show the section
            _this.blockRecommendationsElementRelated.style.display = 'none';
          }
  
        });
      });
    }
  
    _loadRecommendationsComplementary() {
      var _this = this;
  
      var url = window.routes.productRecommendationsUrl + '?section_id=product-block-recommendations&intent=complementary&product_id=' + this.options['productId'] + '&limit=' + this.options['recommendationsComplementaryCount'];
  
      return fetch(url).then(function (response) {
        return response.text().then(function (content) {
          var container = document.createElement('div');
          container.innerHTML = content;
  
          let recommendationsElement = _this.element.querySelector('.ProductBlockRecommendations--complementary .ProductBlockRecommendations__Body');
          
          //has recommend product
          if(container.querySelector('.Carousel__Item')){
            recommendationsElement.querySelector('.ProductList--carousel').innerHTML = container.querySelector(".ProductBlockRecommendations__Body").innerHTML;
            new themegoal.components.Carousel(recommendationsElement.querySelector('[data-flickity-config]'));
  
          }else{
            // Show the section
            _this.blockRecommendationsElementComplementary.style.display = 'none';
          }
  
        });
      });
    }
  
    /**
     * Update the main carousel image
     */
    _updateSlideshowImage(event) {
      var variant = event.detail.variant,
          previousVariant = event.detail.previousVariant;
  
      if (!variant || !variant['featured_media'] || previousVariant && previousVariant['featured_media'] && previousVariant['featured_media']['id'] === variant['featured_media']['id']) {
        return;
      }
  
      if (this.options['galleryDesign'] == 'carousel') {
        for (var i = 0; i !== this.productSlideshow.flickityInstance.cells.length; ++i) {
          var cellElement = this.productSlideshow.flickityInstance.cells[i].element,
              mediaId = parseInt(cellElement.getAttribute('data-media-id'));
  
          if (mediaId === variant['featured_media']['id']) {
            this.productSlideshow.selectCell(parseInt(cellElement.getAttribute('data-media-position')) - 1);
          }
        }
      } else if (this.options['galleryDesign'] == 'stack_images'){
        let stackElement = this.element.querySelector(".ProductGallery--stack");
  
        if(stackElement){
          let stackItems = stackElement.querySelectorAll('.Product__MediaWrapper');
          stackItems.forEach(function (item) {
            item.classList.remove("Product__MediaWrapper--currentVariantImage");
          });
  
          let stackItem = stackElement.querySelector('[data-media-id="'+ variant['featured_media']['id'] +'"]');
          stackItem.classList.add("Product__MediaWrapper--currentVariantImage");
  
          stackItem.scrollIntoView({ behavior: 'smooth', block:"start"}); 
        }
        
      } else if (this.options['galleryDesign'] == 'stack_carousel'){
        if (themegoal.helpers.Responsive.matchesBreakpoint('large')) {
          let stackElement = this.element.querySelector(".ProductGallery--stackCarousel");
  
          if(stackElement){
            let stackItems = stackElement.querySelectorAll('.MediaModalOpener');
            stackItems.forEach(function (item) {
              item.classList.remove("MediaModalOpener--currentVariantImage");
            });
  
            let stackItem = stackElement.querySelector('[data-media-id="'+ variant['featured_media']['id'] +'"]');
            stackItem.classList.add("MediaModalOpener--currentVariantImage");
  
            stackItem.scrollIntoView({ behavior: 'smooth', block:"start"}); 
          }
        }else{
          for (var i = 0; i !== this.productSlideshow.flickityInstance.cells.length; ++i) {
            var cellElement = this.productSlideshow.flickityInstance.cells[i].element,
                mediaId = parseInt(cellElement.getAttribute('data-media-id'));
    
            if (mediaId === variant['featured_media']['id']) {
              this.productSlideshow.selectCell(parseInt(cellElement.getAttribute('data-media-position')) - 1);
            }
          }
        }
        
      } 
     
    }
  
    _initStackGalleryCurrentImageStatus(){
      if (this.options['galleryDesign'] == 'stack_images'){
        let stackElement = this.element.querySelector(".ProductGallery--stack");
  
        if(stackElement){
          let stackItems = stackElement.querySelectorAll('.Product__MediaWrapper');
          stackItems.forEach(function (item) {
            item.classList.remove("Product__MediaWrapper--currentVariantImage");
          });
  
          let stackItem = stackElement.querySelector('[data-media-id="'+ this.options['initCurrentVariantImageId'] +'"]');
  
          if(stackItem){
            stackItem.classList.add("Product__MediaWrapper--currentVariantImage");
            // do not scroll when page loading
            // stackItem.scrollIntoView({ behavior: 'smooth', block:"start"});
          }
        }
        
      } 
    }
    
  }
    
  customElements.define('section-product', TG_SectionProduct);
}