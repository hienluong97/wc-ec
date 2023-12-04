if (!customElements.get('section-slideshow')) {
  class TG_SectionSlideshow extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.element = this;
      this.delegateElement = new themegoal.libs.Delegate(this.element);
  
      this.carousel = new themegoal.components.Carousel(this.element.querySelector(".Carousel"), { onSelect: this._onSlideChanged.bind(this) });
      this.selectedSlide = null;
      this.preEnterSlide =null;
  
      this.enableAnimate = true;
  
      this.timeline = themegoal.libs.anime.timeline();
      this.timeoffsets = 0;
  
      this.imageBreakpoint = themegoal.helpers.Responsive.getCurrentBreakpoint();
      if (this.imageBreakpoint != "small"){
        this.imageBreakpoint = "medium-up";
      }
  
      if (this.carousel.flickityInstance.cells.length > 0) {
        this._transitionSlide(this.carousel.flickityInstance.selectedCell.element);
      }
  
      this._bindEventsListeners();
    }

    disconnectedCallback(){
      if(this.delegateElement)this.delegateElement.destroy();
      if(this.carousel)this.carousel.destroy();
    }

    _bindEventsListeners() {
      this._onBreakpointChangedListener = this._onBreakpointChanged.bind(this);
  
      this.delegateElement.on('mouseenter', '.Button', this._pauseSlideshow.bind(this), true);
      this.delegateElement.on('mouseleave', '.Button', this._resumeSlideshow.bind(this), true);
  
      document.addEventListener('breakpoint:changed', this._onBreakpointChangedListener);
    }
  
    _pauseSlideshow() {
      if (this.carousel.flickityInstance.options.autoPlay) {
        this.carousel.flickityInstance.pausePlayer();
      }
    }
  
    _resumeSlideshow() {
      if (this.carousel.flickityInstance.options.autoPlay) {
        this.carousel.flickityInstance.unpausePlayer();
      }
    }
  
    _onSlideChanged(index, element) {
      this._transitionSlide(element);
    }
  
    _transitionSlide(slide) {
      var _this = this;
  
      this.timeline = themegoal.libs.anime.timeline(); 
  
      if (this.selectedSlide) {
        this.timeoffsets = this.enableAnimate ? '-=400' : 0;
      }
  
      this.timeline.add({
        targets: slide,
        opacity: [0, 1],
        duration: _this.selectedSlide && _this.enableAnimate ? 300 : 0,
        easing: 'easeInOutCubic'
      }, _this.timeoffsets);
  
  
      if (this.carousel.flickityInstance.options.autoPlay && this.carousel.flickityInstance.player.state === 'playing') {
        this.carousel.flickityInstance.pausePlayer();
      }
  
      let image = slide.querySelector('.Slideshow__Image.Slideshow__Image--'+_this.imageBreakpoint);
      if(image) {
          _this._transitionSlideContent(slide);
      };
  
      this.selectedSlide = slide;
    }
  
    _transitionSlideContent(slide) {
      if (this.preEnterSlide!=null && this.preEnterSlide == slide)return;
  
      this.preEnterSlide = slide;
  
      var _this = this;
      var images = slide.querySelectorAll('.Slideshow__Image'),
          content = slide.querySelector('.SectionHeader'),
          buttonWrapper = slide.querySelector('.SectionHeader__ButtonWrapper');
  
      if (this.carousel.flickityInstance.options.autoPlay && this.carousel.flickityInstance.player.state === 'paused') {
        this.carousel.flickityInstance.unpausePlayer();
      }
  
      this.timeline.add({
        targets: images,
        opacity: [0, 1],
        scale: [1.2, 1],
        duration: _this.enableAnimate ? 1200 : 0,
        easing: 'easeOutQuad'
      }, _this.timeoffsets);
  
  
      if (content) {
        this.timeline.add({
          targets: content,
          opacity: [0, 1],
          translateY: [30, 0],
          duration: _this.enableAnimate ? 800 : 0,
          delay: _this.enableAnimate ? 800 : 0,
          easing: 'easeOutCubic'
        }, _this.timeoffsets);
      }
  
      if (buttonWrapper) {
        this.timeline.add({
          targets: buttonWrapper,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: _this.enableAnimate ? 800 : 0,
          delay: _this.enableAnimate ? 800 : 0,
          easing: 'easeOutCubic'
        }, _this.timeoffsets);
      }
    }
  
    _onBreakpointChanged(event) {
      this.imageBreakpoint = themegoal.helpers.Responsive.getCurrentBreakpoint();
      if (this.imageBreakpoint != "small"){
        this.imageBreakpoint = "medium-up";
      }
  
      if ((event.detail.previousBreakpoint === 'small' && event.detail.currentBreakpoint !== 'small') || (event.detail.previousBreakpoint !== 'small' && event.detail.currentBreakpoint === 'small')) {
        this.selectedSlide = null;
        if (this.carousel.flickityInstance.cells.length > 0) {
          this._transitionSlide(this.carousel.flickityInstance.selectedElement);
        }
      }
    }  
  }
        
  customElements.define('section-slideshow', TG_SectionSlideshow);
}