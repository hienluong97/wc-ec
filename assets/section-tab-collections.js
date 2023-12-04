if (!customElements.get('section-tab-collections')) {
    class TG_SectionTabCollections extends HTMLElement {
        constructor() {
          super();
        }
        connectedCallback() {
            var _this = this;

            this.element = this;
            this.delegateElement = new themegoal.libs.Delegate(this.element);
            this.options = JSON.parse(this.element.getAttribute('data-section-settings'));

            this.carousels = [];
            this.tabs = [];

            if (this.options['layout'] === 'carousel'){
                themegoal.helpers.Dom.nodeListToArray(this.element.querySelectorAll('[data-flickity-config]')).forEach(function (item) {
                    _this.carousels.push(new themegoal.components.Carousel(item));
                });
            }

            themegoal.helpers.Dom.nodeListToArray(this.element.querySelectorAll('.Nav--tabs .Button')).forEach(function (item) {
                let tab = new themegoal.components.Tab(item);
                _this.tabs.push(tab);
                if (_this.options['layout'] === 'carousel'){
                item.addEventListener('shown.tg.Tab', event => {
                    // console.log(event.target); // newly activated tab
                    // console.log(event.relatedTarget) // previous active tab
                    let contentId = event.target.getAttribute("data-tg-target");
                    if(contentId){
                    let contentElement = _this.element.querySelector(contentId);
                    if(contentElement){
                        let tagetCarousel = contentElement.querySelector('[data-flickity-config]');
                        if(tagetCarousel){
                          let flkty = Flickity.data( tagetCarousel );
                          flkty.resize();
                        }
                    }
                    }  
                })
                }
            });

            this.allReveal = [];

            this._setupAnimation();
        }

        disconnectedCallback(){
          if(this.delegateElement)this.delegateElement.destroy();
          if(this.intersectionObserver)this.intersectionObserver.disconnect();
          if(this.carousels){
            this.carousels.forEach(function (carousel) {
              carousel.destroy();
            });
          }
        }


        _setupAnimation() {
            var _this = this;
        
            this.allReveal = [];
        
            if (this.intersectionObserver) {
              this.intersectionObserver.disconnect();
            }
        
            if (this.options['layout'] === 'grid') {
              this.intersectionObserver = new IntersectionObserver(this._reveal.bind(this));
        
              themegoal.helpers.Dom.nodeListToArray(this.element.querySelectorAll('.ProductList--grid .ProductCard')).forEach(function (item) {
                _this.intersectionObserver.observe(item);
              });
            } 
          }
        
          _reveal(results) {
            var _this = this;
        
            var toReveal = [];
        
            results.forEach(function (result) {
              if (result.isIntersecting || result.intersectionRatio > 0) {
                // isIntersecting does not exist on Samsung Android browser
                toReveal.push(result.target);
                _this.allReveal.push(result.target);
                _this.intersectionObserver.unobserve(result.target);
              }
            });
        
            if (toReveal.length === 0) {
              return;
            }
        
            themegoal.libs.anime({
              targets: toReveal,
              opacity: [0, 1],
              translateY: [30,0],
              delay: 500,
              duration: 500,
              easing: 'cubicBezier(.5, .05, .1, .3)',
              delay: themegoal.libs.anime.stagger(300)
            });    
          }
      
    }
          
    customElements.define('section-tab-collections', TG_SectionTabCollections);
  }