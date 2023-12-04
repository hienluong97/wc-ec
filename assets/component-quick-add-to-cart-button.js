
if (!customElements.get('quick-add-to-cart-button')) {
    class TG_QuickAddToCartButton extends HTMLElement {
        constructor() {
          super();
        }
  
        connectedCallback() {
          this.delegateElement = new themegoal.libs.Delegate(this);
          this.delegateElement.on('click', '[data-action="quick-add-to-cart"]', this._addToCart.bind(this));
        }

        disconnectedCallback(){
          if(this.delegateElement)this.delegateElement.destroy();
        }
  
        _addToCart(event) {
          let _this = this;
      
          event.preventDefault(); // Prevent form to be submitted
      
          let formElement = this.querySelector('form.ProductQuickAddToCardForm');
      
          let addToCartButton = this.querySelector('.ProductQuickAddToCardForm__AddToCart');
      
          // First, we switch the status of the button
          addToCartButton.setAttribute('disabled', 'disabled');
          document.dispatchEvent(new CustomEvent('theme:loading:start'));
      
          fetch(window.routes.cartAddUrl + '.js', {
            body: JSON.stringify(themegoal.components.Form.serialize(formElement)),
            credentials: 'same-origin',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest' // This is needed as currently there is a bug in Shopify that assumes this header
            }
          }).then(function (response) {
            document.dispatchEvent(new CustomEvent('theme:loading:end'));
      
            if (response.ok) {
              if (!window.theme.useAjaxCart) {
                window.location.href = window.routes.cartUrl;
                // return; // When using a cart type of page, we just simply redirect to the cart page
              }else{
                addToCartButton.removeAttribute('disabled');
                // We simply trigger an event so the mini-cart can re-render
                _this.dispatchEvent(new CustomEvent('product:added', {
                  bubbles: true,
                  detail: {
                    variant: _this.currentVariant,
                    quantity: parseInt(_this.querySelector('[name="quantity"]').value)
                  }
                }));
              }
            } else {
              response.json().then(function (content) {
                var errorMessageElement = document.createElement('div');
                errorMessageElement.className = 'Alert Alert--danger';
                if (typeof content['description'] === 'object') {
                  errorMessageElement.innerHTML = content['message'];
                }else{
                  errorMessageElement.innerHTML = content['description'];
                }
                addToCartButton.removeAttribute('disabled');
                addToCartButton.insertAdjacentElement('beforeBegin', errorMessageElement);
                setTimeout(function () {
                  errorMessageElement.remove();
                }, 8000);
              });
            }
          });
      
          event.preventDefault();
        }
    }
    
    customElements.define('quick-add-to-cart-button', TG_QuickAddToCartButton);
  }