if (!customElements.get('section-cart-drawer')) {
  class TG_SectionCartDrawer extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
          this.element = this;
          this.delegateElement = new themegoal.libs.Delegate(this.element);
          this.documentDelegate = new themegoal.libs.Delegate(document.documentElement);
          this.options = JSON.parse(this.element.getAttribute('data-section-settings'));
          this.itemCount = this.options['itemCount'];
      
          this.sidebarDrawer = new themegoal.components.Drawer(this);
          this.element.addEventListener('hidden.tg.Drawer', this._onDrawerClosed.bind(this));
      
          this._bindEventsListeners();
        }

        disconnectedCallback(){
          if(this.delegateElement)this.delegateElement.destroy();
          if(this.documentDelegate)this.documentDelegate.destroy();
        }
      
        _bindEventsListeners() {
        
          this.delegateElement.on('change', '#CartNote', this._updateCartNote.bind(this));
      
          this.delegateElement.on('click', '[data-action="update-item-quantity"], [data-action="remove-item"]', this._updateItemQuantity.bind(this));
          this.delegateElement.on('change', '.CartItem__QuantityNum', this._updateItemQuantity.bind(this));
      
          document.addEventListener('product:added', this._onProductAdded.bind(this));
      
          // re-render the drawer cart with event cart:refresh
          this.documentDelegate.on('cart:refresh', this._rerenderCart.bind(this, false));
        }
      
        _updateCartNote(event, target) {
          fetch(window.routes.cartUrl + '/update.js', {
            body: JSON.stringify({ note: target.value }),
            credentials: 'same-origin',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest' // This is needed as currently there is a bug in Shopify that assumes this header
            }
          });
        }
      
        _updateItemQuantity(event, target) {
          var _this = this;
      
          document.dispatchEvent(new CustomEvent('theme:loading:start'));
      
          var quantity = null,
              elementToAnimate = null;
      
          if (target.tagName === 'INPUT') {
            quantity = parseInt(Math.max(parseInt(target.value) || 1, 1));
          } else {
            //+ - button
            quantity = parseInt(target.getAttribute('data-quantity'));
          }
      
          // If the quantity is 0, then we will animate the product with a removal effect
          if (quantity === 0) {
            elementToAnimate = target.closest('.CartItem__Wrapper');
          }
      
          fetch(window.routes.cartChangeUrl + '.js', {
            body: JSON.stringify({ id: target.getAttribute('data-line-id'), quantity: quantity }),
            credentials: 'same-origin',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest' // This is needed as currently there is a bug in Shopify that assumes this header
            }
          }).then(function (cart) {
            cart.json().then(function (content) {
              _this.itemCount = content['item_count'];
              _this._rerenderCart(elementToAnimate);
      
              document.dispatchEvent(new CustomEvent('theme:loading:end'));
            });
          });
      
          event.preventDefault();
        }
      
        _onProductAdded(event) {
          var _this = this;
      
          this.itemCount += event.detail.quantity;
      
          this._rerenderCart().then(function () {
            _this.sidebarDrawer.show();
          });
        }
      
        _onDrawerClosed() {
          let cartDrawerNoteElement = document.getElementById('CartDrawerNoteCollapse');
          if(cartDrawerNoteElement){
            let cartDrawerNoteCollapse = new themegoal.components.Collapse(cartDrawerNoteElement, { toggle: false });
            cartDrawerNoteCollapse.hide();
          }
        }
      
        _rerenderCart(elementToAnimate) {
          var _this = this;
      
          // Note: appending a timestamp is necessary as the polyfill on IE11 and lower does not support the "cache" property
          return fetch(window.routes.cartUrl + '?section_id=' + this.options['sectionId'] + '&timestamp=' + Date.now(), {
            credentials: 'same-origin',
            method: 'GET'
          }).then(function (content) {
            // If there is an element to animate, we animate it using a transition
            if ( elementToAnimate ) {
              themegoal.libs.anime({
                targets: elementToAnimate,
                opacity: 0,
                height: 0,
                duration: 500,
                easing: 'easeOutCubic',
                complete: function(anim) {
                  content.text().then(function (html) {
                    _this._replaceContent(html);
                  });
                }
              });
            } else {
              content.text().then(function (html) {
                _this._replaceContent(html);
              });
            }
          });
        }
      
        _replaceContent(html) {
          let _this = this;
      
          let tempElement = document.createElement('div');
          tempElement.innerHTML = html;
      
          let cartNodeParent = this.element.querySelector('.Form--cart').parentNode;
      
          let currentScrollPosition = this.element.querySelector('.Drawer__Body').scrollTop;
          cartNodeParent.replaceChild(tempElement.querySelector('.Form--cart'), this.element.querySelector('.Form--cart'));
          this.element.querySelector('.Drawer__Body').scrollTop = currentScrollPosition;
      
          // We can also update the dot and the quantity of header icon
          let cartResult = JSON.parse(tempElement.querySelector('.CartDrawer').getAttribute('data-section-settings'));
      
          let cartCount = themegoal.helpers.Dom.nodeListToArray(document.querySelectorAll('.CartCountBubble')),
          cartText = themegoal.helpers.Dom.nodeListToArray(document.querySelectorAll('.CartCountText')),
          cartQuantity = themegoal.helpers.Dom.nodeListToArray(document.querySelectorAll('.CartCountBubble__Count'));
      
          this.itemCount = cartResult['itemCount'];
      
          cartCount.forEach(function (item) {
            if (_this.itemCount === 0) {
              item.classList.remove('Visible'); 
            } else {
              item.classList.add('Visible');
            }
          });
      
          cartText.forEach(function (item) {
            if (_this.itemCount === 0) {
              item.classList.add('Visible'); 
            } else {
              item.classList.remove('Visible');
            }
          });
      
          cartQuantity.forEach(function (item) {
            item.textContent = _this.itemCount;
          });


          if(this.options["freeShippingThreshold"]){
            let freeShippingElement = cartNodeParent.querySelector(".CartDrawer__ShippingAmountNotice");
            
      
            if(freeShippingElement){
              let cartTotalPrice = freeShippingElement.getAttribute("data-cart-total-price");
              let cartCurrencySymbol = freeShippingElement.getAttribute("data-cart-currency-symbol");
      
              cartTotalPrice = parseInt(cartTotalPrice);
      
              let freeShippingAmount = Math.round(this.options["freeShippingAmount"] * (Shopify.currency.rate || 1));
      
              if(cartTotalPrice >= freeShippingAmount){
                freeShippingElement.innerHTML = this.options["freeShippingString"];
              }else{
                let freeShippingAmountString = this.options["freeShippingAmountString"];
                freeShippingAmountString = freeShippingAmountString.replace("remaining__amount", "" + cartCurrencySymbol + (freeShippingAmount - cartTotalPrice)/100);
                freeShippingElement.innerHTML = freeShippingAmountString;
              }
            }
          }
        
        }
        
    
  }
        
  customElements.define('section-cart-drawer', TG_SectionCartDrawer);
}