function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
    document.querySelectorAll('.js-youtube').forEach(video => {
      video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    });
    document.querySelectorAll('.js-vimeo').forEach(video => {
      video.contentWindow.postMessage('{"method":"pause"}', '*');
    });
    document.querySelectorAll('video').forEach(video => video.pause());
    document.querySelectorAll('product-model').forEach(model => {
      if (model.modelViewerUI) model.modelViewerUI.pause();
    });
}

class TG_DeferredMedia extends HTMLElement {
  constructor() {
    super();
    this.poster = this.querySelector('[id^="Deferred-Cover-"]');
    this.autoplay = this.getAttribute('data-tg-video-auto');
    if (!this.poster) return;
    this.poster.addEventListener('click', this.loadContent.bind(this));
  }

  connectedCallback() {
    if(this.autoplay == "1"){
      // if (this.poster) this.poster.click();
      this.loadContent(false);
      var video = this.querySelector('.VideoSection__SelfVideo');
      if(video)video.play();
    }
  }

  loadContent(focus = true) {
    // window.pauseAllMedia();

    if (!this.getAttribute('loaded')) {
    const content = document.createElement('div');
    content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
    this.setAttribute('loaded', true);
    const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
    if (focus) deferredElement.focus();
    }
  }

}

if (!customElements.get('deferred-media')) {
  customElements.define('deferred-media', TG_DeferredMedia);
}

class TG_ProductCardColorSwatch {
  constructor() {
    this.element = document.body;
    this.delegateElement = new themegoal.libs.Delegate(this.element);

    this.delegateElement.on('change', '.ProductCard__ColorSwatchRadio', this._colorChanged.bind(this));
  }

  _colorChanged(event, target) {
    // We need to change the URL of the various links, and various id
    let productItem = target.closest('.ProductCard'),
        variantUrl = target.getAttribute('data-variant-url');
   

    productItem.querySelector('.ProductCard__ImageWrapper > a').setAttribute('href', variantUrl);
    productItem.querySelector('.ProductCard__Title > a').setAttribute('href', variantUrl);

    // If we have a custom image for the variant, we change it
    var originalImageElement = productItem.querySelector('.ProductCard__Image:not(.ProductCard__Image--alternate)');

    if (target.hasAttribute('data-image-url') && target.getAttribute('data-image-id') !== originalImageElement.getAttribute('data-image-id')) {
      var newImageElement = document.createElement('img');
      newImageElement.className = 'ProductCard__Image';
      newImageElement.setAttribute('data-image-id', target.getAttribute('data-image-id'));
      newImageElement.setAttribute('src', target.getAttribute('data-image-url'));
      newImageElement.setAttribute('srcset', target.getAttribute('data-image-srcset'));

      // Replace the original node
      if (window.theme.productImageSize === 'natural') {
        originalImageElement.parentNode.style.setProperty('--tg-aspect-ratio', target.getAttribute('data-image-aspect-ratio'));
      }

      originalImageElement.parentNode.replaceChild(newImageElement, originalImageElement);
    }

   
  }
}



class TG_SearchDrawer {
  constructor() {

      this.element = document.getElementById('SearchDrawer');;

      this.documentDelegate = new themegoal.libs.Delegate(document.body);

      this.sectionId = this.element.getAttribute('data-section-id');

      this.searchInputElement = this.element.querySelector('[name="q"]');
      this.searchDrawerResults = this.element.querySelector('.SearchDrawer__Results');
      this.searchResultsElement = this.element.querySelector('[data-predictive-search-drawer-results]');
      this.searchStatusElement = this.element.querySelector('[data-predictive-search-drawer-status]');
      this.searchSummaryElement = this.element.querySelector('[data-predictive-search-drawer-summary]');

      this._bindEventsListeners();
    }
  
    destroy() {
  
      this.searchInputElement.removeEventListener('input', this._onInputListener);
  
      this.documentDelegate.off();
    }
  
    _bindEventsListeners() {
      let _this = this;
      this.element.addEventListener('shown.tg.Drawer', event => {
        _this.searchInputElement.focus();
      });
  
      this._onInputListener = this._debounce(this._onInput.bind(this), 250);
  
  
      this.searchInputElement.addEventListener('input', this._onInputListener);
  
    
      this.documentDelegate.on('search:close', this._closeSearch.bind(this)); // Allow for third-party elements to close the bar
    }
  
    
    _closeSearch(){
      let searchDrawerElement = document.getElementById('SearchDrawer')
      let searchDrawer = new themegoal.components.Drawer(searchDrawerElement);
      searchDrawer.hide();
    }
  
    _onInput(event) {
      let _this = this;
  
      if (event.keyCode === 13) {
        return;
      }
  
      this.lastInputValue = event.target.value;
  
      if (this.lastInputValue === '') {
        this._resetSearch();
        return;
      }
  
      var queryOptions = { method: 'GET', credentials: 'same-origin' };
  
      var queries = [fetch(window.routes.predictiveSearchUrl + '?section_id='+this.sectionId+'&q=' + encodeURIComponent(this.lastInputValue), queryOptions)];
  
  
      document.dispatchEvent(new CustomEvent('theme:loading:start'));
      this.searchStatusElement.style.display = 'block';
      this.searchDrawerResults.setAttribute('aria-hidden', 'false');
  
      Promise.all(queries).then(function (responses) {
        if (_this.lastInputValue !== event.target.value) {
          return;
        }
  
  
        Promise.all(responses.map(function (response) {
          return response.text();
        })).then(function (contents) {
          var tempElement = new DOMParser().parseFromString(contents, 'text/html');
  
          _this.searchResultsElement.innerHTML = tempElement.querySelector('[data-predictive-search-drawer-results]').innerHTML;
          if(tempElement.querySelector('[data-predictive-search-drawer-summary]')){
              _this.searchSummaryElement.innerHTML = tempElement.querySelector('[data-predictive-search-drawer-summary]').innerHTML;
          }
        });
  
        document.dispatchEvent(new CustomEvent('theme:loading:end'));
        _this.searchStatusElement.style.display = 'none';
      });
    }
  
    _resetSearch() {
      this.searchResultsElement.innerHTML = '';
      this.searchSummaryElement.innerHTML = '';
      this.searchDrawerResults.setAttribute('aria-hidden', 'true');
      document.dispatchEvent(new CustomEvent('theme:loading:end')); // Just in case
      this.searchStatusElement.style.display = 'none';
    }
  
    _debounce(fn, delay) {
      var _this = this;
  
      var timer = null;
  
      return function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
          }
      
          clearTimeout(timer);
      
          timer = setTimeout(function () {
              fn.apply(_this, args);
          }, delay);
      };
    }

}
