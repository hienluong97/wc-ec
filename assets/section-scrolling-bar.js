if (!customElements.get('section-scrolling-bar')) {
    class TG_SectionScrollingBar extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.animationId = 0;
            
            this.scrollingBar = this.querySelector('.ScrollingBar');

            if (! this.scrollingBar || this.scrollingBar.children.length === 0) {
                return;
            }
            
            this.scrollingBarInner = this.scrollingBar.querySelector('.ScrollingBar__Inner');
            this.scrollingBarItem = this.scrollingBar.querySelector('.ScrollingBar__Item');
            
            this.speed = this.scrollingBar.dataset.speed || 0.20;
            this.pausable = this.scrollingBar.dataset.pausable === 'true' ? true : false;
            this.reverse = this.scrollingBar.dataset.reverse === 'true' ? true : false;
            this.paused = false;
            this.parent = this.scrollingBar.parentElement;
            this.parentProps = this.parent.getBoundingClientRect();
            
            this.offset = 0;
            this.preTimestamp = 0;
      
            this._setupContent();
            this._setupEvents();

            this._startScroll();
        }
    
        _setupContent() {

            this.contentWidth = this.scrollingBarItem.offsetWidth;
        
            this.requiredReps = this.contentWidth > this.parentProps.width ? 2 : Math.ceil((this.parentProps.width - this.contentWidth) / this.contentWidth) + 1;
        
            for (let i = 0; i < this.requiredReps; i++) {
                this._cloneItemElement();
            }
        
            if (this.reverse) {
                this.offset = this.contentWidth * -1;
            }
        }

        _cloneItemElement(){
            const clone = this.scrollingBarItem.cloneNode(true);
            this.scrollingBarInner.appendChild(clone);
        }
    
        _setupEvents() {
            this.scrollingBar.addEventListener('mouseenter', () => {
                if (this.pausable) this.paused = true;
            });
        
            this.scrollingBar.addEventListener('mouseleave', () => {
                if (this.pausable) this.paused = false;
            });
        }
    
        _animate(timestamp) {
            if(this.preTimestamp == 0) this.preTimestamp = timestamp;
            if (!this.paused && this.preTimestamp != timestamp ) {
                const isScrolled = this.reverse ? this.offset < 0 : this.offset > this.contentWidth * -1;
                const direction = this.reverse ? -1 : 1;
                const reset = this.reverse ? this.contentWidth * -1 : 0;
        
                if (isScrolled) 
                    this.offset -= this.speed * direction;
                else 
                    this.offset = reset;
        
                this.scrollingBarInner.style.transform = `translate(${this.offset}px, 0) translateZ(0)`;

                this.preTimestamp = timestamp;
            }
        }
    
        _repopulate(difference, isLarger) {
            this.contentWidth = this.scrollingBarItem.offsetWidth;
        
            if (isLarger) {
                const amount = Math.ceil(difference / this.contentWidth) + 1;
        
                for (let i = 0; i < amount; i++) {
                    this._cloneItemElement();
                }
            }
        }

        _startScroll() {
            let _this = this;
            if (this.animationId) window.cancelAnimationFrame(this.animationId);
            let previousWidth = window.innerWidth;
            let timer;


            animateLoop();
  
            function animateLoop(timestamp) {
                _this._animate(timestamp);
                _this.animationId = window.requestAnimationFrame(animateLoop);
            }
        
            window.addEventListener('resize', () => {
                clearTimeout(timer);
        
                timer = setTimeout(() => {
                    const isLarger = previousWidth < window.innerWidth;
                    const difference = window.innerWidth - previousWidth;
                    _this._repopulate(difference, isLarger);

                    previousWidth = this.innerWidth;
                }, 350);
            });
        }
      
    }
          
    customElements.define('section-scrolling-bar', TG_SectionScrollingBar);
  }