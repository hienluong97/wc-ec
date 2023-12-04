(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.themegoal = global.themegoal || {}, global.themegoal.components_business = global.themegoal.components_business || {}, global.themegoal.components_business.filter_products = factory()));
  })(this, (function () { 'use strict';

  class FilterProducts {
    constructor(element) {
      this.element = element;
      this.delegateElement = new themegoal.libs.Delegate(this.element);
      //replace conent, layout switch srcoll
      this.filterProductsElement = this.element.querySelector('.FilterProducts');
      this.filterProductsContentElement = this.element.querySelector('.FilterProducts__Content');
  
      this.settings = JSON.parse(this.element.getAttribute('data-section-settings'));
      this.currentSortBy = this.settings['sortBy'];
  
      // Setup product item color swatch
      new TG_ProductCardColorSwatch();
  
      // Setup animation
      this._setupAnimation();
  
      this._initPriceRangeAsideSlider();
      this._initPriceRangeDrawerSlider();
  
      this._bindEventsListeners();
    }
  
    _debounce(fn, wait) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    }
  
    _bindEventsListeners() {
      this._onInputListener = this._debounce(this._toggleFilter.bind(this), 500);
  
      this.delegateElement.on('click', '[data-tg-action="change-sort"]', this._sortByChanged.bind(this));
  
      this.delegateElement.on('click', '.FilterProducts__Form .ProductFilters__Item', this._onInputListener);
  
      this.delegateElement.on('click', '[data-tg-action="apply-price"]', this._onInputListener);//price toogle by button, not input
  
      //The popstate event of the Window interface is fired when the active history entry changes while the user navigates the session history
      window.addEventListener('popstate', function (event) {
        if (event.state.path) {
          window.location.href = event.state.path;
        }
      });
    }
  
    _setupAnimation() {
      var _this = this;
  
      //_setupAnimation(true),ajax 
      var forceLoadFromTop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  
      // If there is already an observer set up, we remove it first
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
  
      //ajax loaded
      if (forceLoadFromTop) {
  
        themegoal.libs.anime({
          targets: this.filterProductsContentElement.querySelectorAll('.ProductCard'),
          opacity: [0, 1],
          translateY: [30,0],
          duration: 500,
          easing: 'cubicBezier(.5, .05, .1, .3)',
          delay: themegoal.libs.anime.stagger(300)
        });
        
      } else {
        
        this.intersectionObserver = new IntersectionObserver(this._reveal.bind(this), {
          threshold: 0.3
        });
  
        themegoal.helpers.Dom.nodeListToArray(this.filterProductsContentElement.querySelectorAll('.ProductCard')).forEach(function (item) {
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
        duration: 500,
        easing: 'cubicBezier(.5, .05, .1, .3)',
        delay: themegoal.libs.anime.stagger(300)
      });
    }
  
    _sortByChanged(event, target) {
      let sortBy = target.getAttribute("data-value");
      if (this.currentSortBy === sortBy) {
        return;
      }
  
      let eleP = target.closest('ul');
      let eles = eleP.querySelectorAll("li");
  
      eles.forEach(function(item){
        item.classList.remove("Active");
      });
  
      // target.classList.add("Active");// toogleFilter will removed again
  
      this.currentSortBy = sortBy;
  
      this._toggleFilter(event, target);
    }
  
    _toggleFilter(event, target){
      
      let filterFrom = target.getAttribute("data-filter-from");
  
      if(target.classList.contains("Active")){
        target.classList.remove("Active");
      }else{
        target.classList.add("Active");
      }
  
      let formData;
      if(filterFrom != undefined && filterFrom == 'aside'){
        formData = new FormData(this.element.querySelector('.FilterProducts__Form--aside'));
      }else{
        formData = new FormData(this.element.querySelector('.FilterProducts__Form--drawer'));
      }
  
      const searchParams = new URLSearchParams(formData).toString();
  
      this._reloadProducts(searchParams, filterFrom);
    }
  
  
    _reloadProducts(searchParams, filterFrom) {
      
      let _this = this;
  
      document.dispatchEvent(new CustomEvent('theme:loading:start'));
  
      var newUrl = window.location.protocol + '//' + window.location.host + this.settings['url'] +  '?sort_by=' + this.currentSortBy+ '&options[prefix]=last&' + searchParams;
      // We also rewrite the URL if browser supports it
      if (history.replaceState) {
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
  
      fetch(newUrl, {
        credentials: 'same-origin',
        method: 'GET'
      }).then(function (response) {
        response.text().then(function (content) {
          var tempElement = document.createElement('div');
          tempElement.innerHTML = content;
  
          _this.filterProductsContentElement.innerHTML = tempElement.querySelector('.FilterProducts__Content').innerHTML;
          document.dispatchEvent(new CustomEvent('theme:loading:end'));
  
          let itemsCountElement = tempElement.querySelector('.CollectionToolBar__ResultCount');
  
          if(itemsCountElement){
            let itemsCountNumber = itemsCountElement.getAttribute("data-items-count");
  
            let targetCountEle = _this.element.querySelector(".CollectionAside__ProductCount strong");
            if(targetCountEle && itemsCountNumber){
              targetCountEle.innerHTML = itemsCountNumber;
            }
          }
          
  
          let itemCounts = tempElement.querySelectorAll(".ProductFilters__ItemCount");
  
          itemCounts.forEach(function (item) {
            let itemCountId = item.getAttribute("id");
            _this.element.querySelector("#"+itemCountId).innerHTML = item.innerHTML;
          });
          _this._setupAnimation(true);
  
          
          // We scroll to the top 
          var elementOffset = _this.filterProductsElement.getBoundingClientRect().top - parseInt(document.documentElement.style.getPropertyValue('--tg-header-height'))  - parseInt(document.documentElement.style.getPropertyValue('--tg-announcement-bar-height'));
  
  
          if (elementOffset < 0) {
            window.scrollBy({ top: elementOffset, behavior: 'smooth' });
          }
        });
      });
    }
  
    _initPriceRangeAsideSlider(){
      let asidePriceSlider = document.getElementById('Aside-Price-Slider');
  
      if(!(window.noUiSlider && asidePriceSlider)){
        return;
      }
  
      let maxRangeValue = asidePriceSlider.getAttribute("data-tg-max-price");
  
      let drawerPriceMin = document.getElementById('Filter-Aside-Min-Price');
      let drawerPriceMax = document.getElementById('Filter-Aside-Max-Price');
  
      drawerPriceMin.setAttribute("readonly", "true");
      drawerPriceMax.setAttribute("readonly", "true");
  
      let handleMin = 0;
      let handleMax = parseFloat(maxRangeValue);
  
      if(drawerPriceMin.value != ""){
        handleMin = parseFloat(drawerPriceMin.value);
      }
  
      if(drawerPriceMax.value != ""){
        handleMax = parseFloat(drawerPriceMax.value);
      }
  
      noUiSlider.create(asidePriceSlider, {
          start: [handleMin, handleMax],
          tooltips: [
            true, 
            true 
          ],
          connect: true,
          range: {
              'min': 0,
              'max': parseFloat(maxRangeValue)
          }
      });
  
      asidePriceSlider.noUiSlider.on('update', function (values, handle) {
          if(handle == 0){
              drawerPriceMin.value = values[handle];
          }
          if(handle == 1){
              drawerPriceMax.value = values[handle];
          }
      });
    
    }
  
    _initPriceRangeDrawerSlider(){
      let drawerPriceSlider = document.getElementById('Drawer-Price-Slider');
  
      if(!(window.noUiSlider && drawerPriceSlider)){
        return;
      }
  
      let maxRangeValue = drawerPriceSlider.getAttribute("data-tg-max-price");
  
      let drawerPriceMin = document.getElementById('Filter-Drawer-Min-Price');
      let drawerPriceMax = document.getElementById('Filter-Drawer-Max-Price');
  
      drawerPriceMin.setAttribute("readonly", "true");
      drawerPriceMax.setAttribute("readonly", "true");
  
      let handleMin = 0;
      let handleMax = parseFloat(maxRangeValue);
  
      if(drawerPriceMin.value != ""){
        handleMin = parseFloat(drawerPriceMin.value);
      }
  
      if(drawerPriceMax.value != ""){
        handleMax = parseFloat(drawerPriceMax.value);
      }
  
      noUiSlider.create(drawerPriceSlider, {
          start: [handleMin, handleMax],
          tooltips: [
            true, 
            true 
          ],
          connect: true,
          range: {
              'min': 0,
              'max': parseFloat(maxRangeValue)
          }
      });
  
      drawerPriceSlider.noUiSlider.on('update', function (values, handle) {
          if(handle == 0){
              drawerPriceMin.value = values[handle];
          }
          if(handle == 1){
              drawerPriceMax.value = values[handle];
          }
      });
    }
  
  }


    const components_business = {
        FilterProducts
    };

    return components_business;

}));
