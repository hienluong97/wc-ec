(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.themegoal = global.themegoal || {}, global.themegoal.components_business = global.themegoal.components_business || {}, global.themegoal.components_business.product_variants = factory()));
  })(this, (function () { 'use strict';

  class ProductImageModal {
    constructor(element) {
      this.element = element;
      this.delegateElement = new themegoal.libs.Delegate(this.element);
  
      this.quiviewModalElement = document.getElementById('ProductMediaZoomModal');
      this.quiviewModal = null;
  
      this.activeMedia = null;
  
      this._bindEventsListeners();
    }
    
    destroy() {
      this.delegateElement.off('click');
    }
    
    _bindEventsListeners() {
      this.delegateElement.on('click', '.MediaModalOpener', this._openMediaModal.bind(this), true);
      this.quiviewModalElement.addEventListener('hidden.tg.Modal', function (event) {
        window.pauseAllMedia();
      });
      let _this = this;
      this.quiviewModalElement.addEventListener('shown.tg.Modal', function (event) {
        window.pauseAllMedia();
        _this.activeMedia.scrollIntoView({ behavior: 'smooth', block:"start"});
      });
    }
    
    _openMediaModal(event, target) {
      let imageBreakpoint = themegoal.helpers.Responsive.getCurrentBreakpoint();
  
      if ( imageBreakpoint == "small" ){
        event.stopImmediatePropagation();
        this._setActiveMeida(target);
        this.quiviewModal = new themegoal.components.Modal(this.quiviewModalElement);
        this.quiviewModal.show();  
      }else{
        if (target.classList.contains("MediaModalOpener--image")){
          this._setActiveMeida(target);
          this.quiviewModal = new themegoal.components.Modal(this.quiviewModalElement);
          this.quiviewModal.show();
        }
      }
    }
    
    _setActiveMeida(target){
      let openers = this.quiviewModalElement.querySelectorAll(".Product__MediaWrapper");
      let currentMediaId = target.getAttribute("data-media-id");
  
      if(openers){
        openers.forEach(function (item) {
          item.classList.remove("Active");
        });
  
        this.activeMedia = this.quiviewModalElement.querySelector('[data-media-id="'+ currentMediaId +'"]');
        if(this.activeMedia){
          this.activeMedia.classList.add("Active");
        }
      }
    }
  }
  
  class ProductPickupAvailability {
    constructor(element, productTitle) {
      this.element = element;
      this.productTitle = productTitle;
    }
  
    updateWithVariant(variant) {
      if (!this.element) {
        return; // If the element to inject the store availability does not exist, we return immediately
      }

      // If the variant is null (for instance unavailable variant), we clear the container
      if (!variant) {
        this.element.textContent = '';
        return;
      }

      // If we have a new variant we render the section
      this._renderAvailabilitySection(variant['id']);
    }
  
    _renderAvailabilitySection(id) {
      let _this = this;
  
      this.element.innerHTML = '';
  
      // If there is already an element with the given modal we remove it first
      var availabilityModal = document.getElementById('PickupAvailabilityModal-' + id);
      if (availabilityModal) {
        availabilityModal.remove();
      }
  
      return fetch(window.routes.rootUrlWithoutSlash + '/variants/' + id + '?section_id=pickup-availability').then(function (response) {
        return response.text().then(function (content) {
          _this.element.innerHTML = content;
          _this.element.innerHTML = _this.element.firstElementChild.innerHTML;
  
          // The product title is not rendered so we have to render it manually
          var productTitle = _this.element.querySelector('.Drawer__Title.Product__Title');
  
          if (productTitle) {
            productTitle.textContent = _this.productTitle;
          }
  
          // In order for our modal system to work we have to append the modal to the body instead
          let availabilityModal = document.getElementById('PickupAvailabilityModal-' + id);
  
          if(availabilityModal){
            document.body.appendChild(availabilityModal);
  
            // Create the drawer
            new themegoal.components.Drawer(availabilityModal);
          }
        });
      });
    }
  }
  class ProductVariants {
    constructor(container, options) {
      let _this = this;
  
      this.element = container;
      this.delegateElement = new themegoal.libs.Delegate(this.element);
      this.options = options;
  
      let jsonData = JSON.parse(this.element.querySelector('[data-product-json]').innerHTML);
  
      this.productData = jsonData['product'];
      this.variantsInventories = jsonData['inventories'] || {};
      this.sectionId = jsonData['section_id'];
      this.variantSelector = this.element.querySelector('#ProductSelect--' + this.sectionId);
  
      if(!this.productData['id']) return ;
      // We init value with the first selected variant
      this.productData['variants'].forEach(function (variant) {
        if (variant['id'] === jsonData['selected_variant_id']) {
          _this.currentVariant = variant;
          _this.option1 = variant['option1'];
          _this.option2 = variant['option2'];
          _this.option3 = variant['option3'];
        }
      });
  
      this.pickupAvailability = new ProductPickupAvailability(this.element.querySelector('.Product__StoreAvailabilityContainer'), this.productData['title']);
      this.pickupAvailability.updateWithVariant(this.currentVariant);
  
      this._bindEventsListeners();
    }
  
    destroy() {
      this.delegateElement.off('click');
    }
  
    _bindEventsListeners() {
      this.delegateElement.on('click', '[data-action="add-to-cart"]', this._addToCart.bind(this));
      this.delegateElement.on('click', '[data-action="decrease-quantity"]', this._decreaseQuantity.bind(this));
      this.delegateElement.on('click', '[data-action="increase-quantity"]', this._increaseQuantity.bind(this));
      this.delegateElement.on('change', '.ProductForm__QuantityNum', this._validateQuantity.bind(this));
  
      // Hook when a radio button change
      this.delegateElement.on('change', '.ProductForm__Option [type="radio"]', this._onOptionChanged.bind(this));
      this.delegateElement.on('keydown', '.ProductForm__Option [type="radio"]~label', this._labeEnerKeyEvent.bind(this));
  
      this.delegateElement.on('change', '.ProductForm__Option .Form__Select', this._onOptionChanged.bind(this));
  
      this.delegateElement.on('change', '.ProductForm__CustomProperty [type="radio"]', this._onChangeCustomPropertyRadio.bind(this));
      this.delegateElement.on('change', '.ProductForm__CustomProperty .Form__Select', this._onChangeCustomPropertySelect.bind(this));
      this.delegateElement.on('change', '.ProductForm__CustomProperty .Form__Input', this._onChangeCustomPropertyText.bind(this));
    }
  
    _labeEnerKeyEvent(event, target){
      if(event.keyCode == 13) {
        let inputId = target.getAttribute("for");
        let inputElement = document.getElementById(inputId);
        inputElement.click();
      }
    }

    _onVariantChanged(previousVariant, newVariant) {
      this._updateProductInfo(newVariant);

      // update the add to cart button
      this._updateAddToCartButton(newVariant, previousVariant);

      // pick availability
      this.pickupAvailability.updateWithVariant(newVariant);

      // Finally, we send an event so that other system could hook and do their own logic
      this.element.dispatchEvent(new CustomEvent('variant:changed', {
        bubbles: true,
        detail: { variant: newVariant, previousVariant: previousVariant }
      }));
    }
  
    _updateProductInfo(newVariant){
      let _this = this;
  
      let destinationPriceList = _this.element.querySelector(".Product__PriceList");
      let destinationSKU = _this.element.querySelector(".Product__Sku");
      let destinationUnitPrice = _this.element.querySelector(".Product__UnitPrice");
      let destinationInventory = _this.element.querySelector('.ProductForm__Inventory');
      let destinationPayInstallments = _this.element.querySelector(".Product__PayInstallments");
  
      if (!newVariant){
        if(destinationPriceList) destinationPriceList.innerHTML = "";
        if(destinationSKU) destinationSKU.innerHTML = "";
        if(destinationUnitPrice) destinationUnitPrice.innerHTML = "";
        if(destinationInventory) destinationInventory.innerHTML = "";
        if(destinationPayInstallments) destinationPayInstallments.innerHTML = "";
        return;
      } 
  
      fetch(window.routes.rootUrlWithoutSlash + '/variants/' + newVariant['id'] + '?section_id=product-info').then(function (response) {
        return response.text().then(function (content) {
          const html = new DOMParser().parseFromString(content, 'text/html');
  
          const sourcePriceList = html.querySelector(".Product__PriceList");
          if (sourcePriceList && destinationPriceList) destinationPriceList.innerHTML = sourcePriceList.innerHTML;
  
          if (_this.options['showSku']) {
            const sourceSKU = html.querySelector(".Product__Sku");
            if (sourceSKU && destinationSKU) {
              destinationSKU.innerHTML = sourceSKU.innerHTML;
              destinationSKU.style.display = sourceSKU.style.display;
            };
          }
    
          const sourceUnitPrice = html.querySelector(".Product__UnitPrice");
          if (sourceUnitPrice && destinationUnitPrice) {
            destinationUnitPrice.innerHTML = sourceUnitPrice.innerHTML;
            destinationUnitPrice.style.display = sourceUnitPrice.style.display;
          };
  
          if (_this.options['showInventoryQuantity']) {
  
            let variantInventory = newVariant ? _this.variantsInventories[newVariant['id']] : null;
        
            if(destinationInventory && variantInventory){
        
              if ( null === newVariant['inventory_management'] || variantInventory['inventory_quantity'] <= 0 || _this.options['inventoryQuantityThreshold'] > 0 && variantInventory['inventory_quantity'] > _this.options['inventoryQuantityThreshold']) {
                destinationInventory.style.display = 'none';
              } else {
                const sourceInventory = html.querySelector(".ProductForm__Inventory");
                if (sourceInventory) {
                  destinationInventory.innerHTML = sourceInventory.innerHTML;
                  destinationInventory.style.display = '';
                }
              }
            }
          }
  
          const sourcePayInstallments = html.querySelector(".Product__PayInstallments");
          if (sourcePayInstallments && destinationPayInstallments) destinationPayInstallments.innerHTML = sourcePayInstallments.innerHTML;
  
        });
      });
        

         let varianDescHash = document.querySelectorAll("[VarianDescription]");
         console.log(varianDescHash);
         if (newVariant) {
           Array.from(varianDescHash).forEach((Selectedvariant) => {
             if (Selectedvariant.dataset.id == newVariant.id) {
               const varian_description = document.querySelector(
                 `[data-id="${newVariant.id}"]`
               );
               varian_description.style.display = "block";
               varian_description.innerHTML =
                 Selectedvariant.dataset.variandescription;
             } else {
               const other_varian_description = document.querySelector(
                 `[data-id="${Selectedvariant.dataset.id}"]`
               );
               other_varian_description.style.display = "none";
             }
           });
    }}
  
    _updateAddToCartButton(newVariant) {
      let addToCartButton = this.element.querySelector('.ProductForm__AddToCart'),
        shopifyPaymentButton = this.element.querySelector('.shopify-payment-button'),
        newButton = document.createElement('button');
  
      if(addToCartButton){
        newButton.setAttribute('type', 'submit');
        newButton.className = 'ProductForm__AddToCart Button Button--full';
  
        if (!newVariant) {
          newButton.setAttribute('disabled', 'disabled');
          newButton.removeAttribute('data-action');
          newButton.classList.add('Button--outline');
          newButton.innerHTML = window.languages.productFormUnavailable;
        } else {
          if (newVariant['available']) {
            newButton.removeAttribute('disabled');
            newButton.classList.add(this.options['showPaymentButton'] ? 'Button--outline' : 'Button--primary');
            newButton.setAttribute('data-action', 'add-to-cart');
            
            newButton.innerHTML = '<span>' + window.languages.productFormAddToCart + '</span>';
            
          } else {
            newButton.setAttribute('disabled', 'disabled');
            newButton.classList.add('Button--outline');
            newButton.removeAttribute('data-action');
            newButton.innerHTML = window.languages.productFormSoldOut;
          }
        }
  
        if (this.options['showPaymentButton'] && shopifyPaymentButton) {
          if (!newVariant || !newVariant['available']) {
            shopifyPaymentButton.style.display = 'none';
          } else {
            shopifyPaymentButton.style.display = 'block';
          }
        }
  
        // We replace the HTML instead of editing as it prevents for the CSS transition to show up
        addToCartButton.parentNode.replaceChild(newButton, addToCartButton);
      }
    }
  
    _onChangeCustomPropertyRadio(event, target){
      let selectedValue = target.closest('.ProductForm__CustomProperty').querySelector('.ProductForm__SelectedValue');
  
      let invalidFeedbackElment = target.closest('.ProductForm__CustomProperty').querySelector('.InvalidFeedback');
  
      if (selectedValue) {
        selectedValue.innerHTML = target.value;
      }
  
      if (invalidFeedbackElment) {
        invalidFeedbackElment.classList.add("Valided");
      }
    }
  
    _onChangeCustomPropertySelect(event, target){
      let invalidFeedbackElment = target.closest('.ProductForm__CustomProperty').querySelector('.InvalidFeedback');
      if (invalidFeedbackElment) {
        if(target.value != ""){
          invalidFeedbackElment.classList.add("Valided");
        }else{
          invalidFeedbackElment.classList.remove("Valided");
        }
      }
    }
  
    _onChangeCustomPropertyText(event, target){
      let invalidFeedbackElment = target.closest('.ProductForm__CustomProperty').querySelector('.InvalidFeedback');
  
      if (invalidFeedbackElment) {
        if(target.value != ""){
          invalidFeedbackElment.classList.add("Valided");
        }else{
          invalidFeedbackElment.classList.remove("Valided");
        }
      }
    }
  
    _onOptionChanged(event, target) {
      //block
      if(target.getAttribute('data-option-position')){
        this['option' + target.getAttribute('data-option-position')] = target.value;
      }else{//select
        let selectedOption = target.options[target.selectedIndex];
        this['option' + selectedOption.getAttribute('data-option-position')] = target.value;
      }
      //label //closest 
      let selectedValue = target.closest('.ProductForm__Option').querySelector('.ProductForm__SelectedValue');

      if (selectedValue) {
        selectedValue.innerHTML = target.value;
      }
      
      // Finally, we get the new variant
      let previousVariant = this.currentVariant;
      this.currentVariant = this._getCurrentVariantFromOptions();

      this._onVariantChanged(previousVariant, this.currentVariant);

      if (this.currentVariant) {
        if (this.options['enableHistoryState']) {
          this._updateHistoryState(this.currentVariant);
        }

        // We need to modify the hidden select that contain the id attribute as well
        // change variant id
        if (this.variantSelector) {
          this.variantSelector.querySelector('[selected]').removeAttribute('selected');
          this.variantSelector.querySelector('[value="' + this.currentVariant['id'] + '"]').setAttribute('selected', 'selected');
        }
      }
    }
  
    _getCurrentVariantFromOptions() {
      let _this = this;
      let found = false;
  
      this.productData['variants'].forEach(function (variant) {
        if (variant['option1'] === _this.option1 && variant['option2'] === _this.option2 && variant['option3'] === _this.option3) {
          found = variant;
        }
      });
  
      return found || null;
    }
  
    _updateHistoryState(variant) {
      if (!history.replaceState) {
        return;
      }
  
      let newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
  
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  
    _addToCart(event) {
      let _this = this;
  
      // if (!this.options['useAjaxCart']) {
      //   return; // When using a cart type of page, we just simply redirect to the cart page
      // }
  
      event.preventDefault(); // Prevent form to be submitted
  
      let formElement = this.element.querySelector('form.ProductForm');
  
      if (!formElement.checkValidity()) {
        if(!this.element.classList.contains(".ProductFormValidated")){
          this.element.classList.add('ProductFormValidated');
        }
        return;
      }else{
        this.element.classList.remove('ProductFormValidated')
      }
  
      let addToCartButton = this.element.querySelector('.ProductForm__AddToCart');
  
      // First, we switch the status of the button
      addToCartButton.setAttribute('disabled', 'disabled');
      document.dispatchEvent(new CustomEvent('theme:loading:start'));
  
      // // Then we add the product in Ajax
      // let formElement = this.element.querySelector('form.ProductForm');
  
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
          if (!_this.options['useAjaxCart']) {
            window.location.href = window.routes.cartUrl;
            // return; // When using a cart type of page, we just simply redirect to the cart page
          }else{
            addToCartButton.removeAttribute('disabled');
            // We simply trigger an event so the mini-cart can re-render
            _this.element.dispatchEvent(new CustomEvent('product:added', {
              bubbles: true,
              detail: {
                variant: _this.currentVariant,
                quantity: parseInt(_this.element.querySelector('[name="quantity"]').value)
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
  
    _decreaseQuantity(event, target) {
      let qty = Math.max(parseInt(this.element.querySelector(".ProductForm__QuantityNum").value) - 1, 1);
      this.element.querySelector(".ProductForm__QuantityNum").value = qty;
      this.element.querySelector('[name="quantity"]').value = qty;
    }
  
    _increaseQuantity(event, target) {
      let qty = parseInt(this.element.querySelector(".ProductForm__QuantityNum").value) + 1;
      this.element.querySelector(".ProductForm__QuantityNum").value = qty;
      this.element.querySelector('[name="quantity"]').value = qty;
    }
  
    
    _validateQuantity(event, target) {
      target.value = Math.max(parseInt(target.value) || 1, 1);
    }
    
  }

  const components_business = {
      ProductImageModal,
      ProductVariants
  };

  return components_business;

}));
  