/*
 * Mandolin Theme Editor Section Event Function JS
 *
 */
if ((typeof window.MandolinThemeEditor) == 'undefined') {
    window.MandolinThemeEditor = {};
}

// Section
document.addEventListener('shopify:section:select', function(event) {
    MandolinThemeEditor.selectSectionAnnouncementBar(event);
    MandolinThemeEditor.selectSectionMenuDrawer(event);
    MandolinThemeEditor.selectSectionCartDrawer(event);
    MandolinThemeEditor.selectSectionMainCart(event);
    MandolinThemeEditor.selectSectionSearchDrawer (event);

    MandolinThemeEditor.selectSectionQuickviewModal(event);

});

document.addEventListener('shopify:section:deselect', function(event) {
    MandolinThemeEditor.deselectSectionMenuDrawer(event);
    MandolinThemeEditor.deselectSectionCartDrawer(event);
    MandolinThemeEditor.deselectSectionSearchDrawer(event);
    MandolinThemeEditor.deselectSectionQuickviewModal(event);
});

// Block
document.addEventListener('shopify:block:select', function(event) {
    MandolinThemeEditor.selectBlockProductInfoTitle(event);
    MandolinThemeEditor.selectBlockMegaMenuImage(event);
    MandolinThemeEditor.selectBlocDropdownMenu(event);
    MandolinThemeEditor.selectBlockSlideshow(event);
    MandolinThemeEditor.selectBlockTestimonials(event);
});

document.addEventListener('shopify:block:deselect', function(event) {
    MandolinThemeEditor.deselectBlockProductInfoTitle(event);
    MandolinThemeEditor.deselectBlockMegaMenuImage(event);
    MandolinThemeEditor.deselectBlocDropdownMenu(event);
    MandolinThemeEditor.deselectBlockSlideshow(event);
    MandolinThemeEditor.deselectBlockTestimonials(event);
});

MandolinThemeEditor.selectSectionAnnouncementBar = function(event){
    const announcementBarSectionContainerSelected = event.target.classList.contains('shopify-section--announcement-bar');
    if (!announcementBarSectionContainerSelected) return;
    
    const announcementBarSectionSelected = document.getElementById('AnnouncementBar');

    if (announcementBarSectionSelected && announcementBarSectionSelected.getAttribute("data-closeable") =="1" ) {
        sessionStorage.removeItem('AnnoucementClosed');
        announcementBarSectionSelected.setAttribute('aria-hidden', 'false');
        document.documentElement.style.setProperty('--tg-announcement-bar-height', document.getElementById('AnnouncementBar').offsetHeight + 'px'); 
    }
}

//Cart Drawer
MandolinThemeEditor.selectSectionCartDrawer = function(event){
    const cartDrawerSectionSelected = event.target.classList.contains('shopify-section--cart-drawer');
    if (!cartDrawerSectionSelected) return;
    document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
        bubbles: true
    }));

    document.querySelector("body").style.removeProperty('overflow');
    let cartDrawerEle = document.getElementById('CartDrawer');
    if(cartDrawerEle && !cartDrawerEle.classList.contains('Show')){
        let ele = document.getElementById('Header__CartTrigger');
        ele.click();
    }
}
MandolinThemeEditor.deselectSectionCartDrawer = function(event) {
    const cartDrawerSectionSelected = event.target.classList.contains('shopify-section--cart-drawer');
    if (!cartDrawerSectionSelected) return;
    document.querySelector("body").style.removeProperty('overflow');
    let cartDrawerEle = document.getElementById('CartDrawer');
    if(cartDrawerEle && cartDrawerEle.classList.contains('Show')){
        let ele = document.getElementById('Header__CartTrigger');
        ele.click();
    }
};

//Cart Main
MandolinThemeEditor.selectSectionMainCart = function(event){
    const cartDrawerSectionSelected = event.target.classList.contains('shopify-section--main-cart');
    if (!cartDrawerSectionSelected) return;
    document.documentElement.dispatchEvent(new CustomEvent('main-cart:refresh', {
        bubbles: true
      }));
}

//MenuDrawer section
MandolinThemeEditor.selectSectionMenuDrawer = function(event) {
    const menuDrawerSectionSelected = event.target.classList.contains('shopify-section--menu-drawer');
    if (!menuDrawerSectionSelected) return;
    document.querySelector("body").style.removeProperty('overflow');
    let menuDrawerEle = document.getElementById('MenuDrawer');
    if(menuDrawerEle && !menuDrawerEle.classList.contains('Show')){
        let ele = document.getElementById('Header__MenuTrigger');
        ele.click();
    }
};
MandolinThemeEditor.deselectSectionMenuDrawer = function(event) {
    const menuDrawerSectionSelected = event.target.classList.contains('shopify-section--menu-drawer');
    if (!menuDrawerSectionSelected) return;
    document.querySelector("body").style.removeProperty('overflow');

    let menuDrawerEle = document.getElementById('MenuDrawer');
    if(menuDrawerEle && menuDrawerEle.classList.contains('Show')){
        let ele = document.getElementById('Header__MenuTrigger');
        ele.click();
    }
};

//Search Drawer section
MandolinThemeEditor.selectSectionSearchDrawer = function(event) {
    const menuDrawerSectionSelected = event.target.classList.contains('shopify-section--search-drawer');
    if (!menuDrawerSectionSelected) return;
    document.querySelector("body").style.removeProperty('overflow');
    let menuDrawerEle = document.getElementById('SearchDrawer');
    if(menuDrawerEle && !menuDrawerEle.classList.contains('Show')){
        let ele = document.getElementById('Header__SearchTrigger');
        ele.click();
    }
};
MandolinThemeEditor.deselectSectionSearchDrawer = function(event) {
    const menuDrawerSectionSelected = event.target.classList.contains('shopify-section--search-drawer');
    if (!menuDrawerSectionSelected) return;
    document.querySelector("body").style.removeProperty('overflow');

    let menuDrawerEle = document.getElementById('SearchDrawer');
    if(menuDrawerEle && menuDrawerEle.classList.contains('Show')){
        let ele = document.getElementById('Header__SearchTrigger');
        ele.click();
    }
};

MandolinThemeEditor.selectBlockProductInfoTitle = function(event) {
    const productInfoBlockSelected = event.target.classList.contains('ProductInfoDrawer__Title');
    if (!productInfoBlockSelected) return;

    let dataSource = document.getElementById("product-drawer-design-mode-"+event.detail.blockId);
    let dataTarget = document.getElementById("product-drawer-"+event.detail.blockId);

    if(dataSource && dataTarget){
        dataTarget.innerHTML = dataSource.innerHTML;
    }

    document.querySelector("body").style.removeProperty('overflow');
    
    if(dataTarget && !dataTarget.classList.contains('Show')){
        event.target.querySelector("button").click();
    }
};
MandolinThemeEditor.deselectBlockProductInfoTitle = function(event) {
    const productInfoBlockSelected = event.target.classList.contains('ProductInfoDrawer__Title');
    if (!productInfoBlockSelected) return;

    document.querySelector("body").style.removeProperty('overflow');

    let dataTarget = document.getElementById("product-drawer-"+event.detail.blockId);
    if(dataTarget && dataTarget.classList.contains('Show')){
        event.target.querySelector("button").click();
    }
};

MandolinThemeEditor.selectBlockMegaMenuImage = function(event) {
    const megaMenuImageBlockSelected = event.target.classList.contains('MegaMenu__Item--image');
    if (!megaMenuImageBlockSelected) return;
    const parentMegaMenuBody = event.target.closest('.DropdownMenu__Body--mega');
    if(parentMegaMenuBody){
        parentMegaMenuBody.classList.add("Show");
        event.target.classList.add("MegaMenu__Item--imageThemeEditorFoucs");
    }
};
MandolinThemeEditor.deselectBlockMegaMenuImage = function(event) {
    const megaMenuImageBlockSelected = event.target.classList.contains('MegaMenu__Item--image');
    if (!megaMenuImageBlockSelected) return;
    const parentMegaMenuBody = event.target.closest('.DropdownMenu__Body--mega');
    if(parentMegaMenuBody){
        parentMegaMenuBody.classList.remove("Show");
        event.target.classList.remove("MegaMenu__Item--imageThemeEditorFoucs");
    }
};

// mega or title menu  blocks
MandolinThemeEditor.selectBlocDropdownMenu = function(event) {
    document.querySelector(".Header__MainMenu").addEventListener('mouseover', MandolinThemeEditor_closeMainMenuDropdownMenu);
    const megaOrTitleMenuBlockSelected = event.target.classList.contains('DropdownMenu__Body');
    if (!megaOrTitleMenuBlockSelected) return;
    event.target.classList.add("Show");
};
MandolinThemeEditor.deselectBlocDropdownMenu = function(event) {
    document.querySelector(".Header__MainMenu").removeEventListener('mouseover', MandolinThemeEditor_closeMainMenuDropdownMenu);
    const megaOrTitleMenuBlockSelected = event.target.classList.contains('DropdownMenu__Body');
    if (!megaOrTitleMenuBlockSelected) return;
    
    event.target.classList.remove("Show");
};

function MandolinThemeEditor_closeMainMenuDropdownMenu(){
    document.querySelectorAll(".DropdownMenu__Body").forEach(function (item) {
        item.classList.remove("Show");
    });
}


//Slideshow
MandolinThemeEditor.selectBlockSlideshow = function(event){
    const sectionTarget = event.target.classList.contains('SlideItem--'+event.detail.blockId);
    if (!sectionTarget) return;

    let ele = document.getElementById("section-"+event.detail.sectionId);
    let eleflkty = ele.querySelector('[data-flickity-config]');

    if(eleflkty){
        let flickityInstance = Flickity.data( eleflkty );

        if(flickityInstance){
            flickityInstance.pausePlayer();

            let selectToIndex = parseInt(event.target.getAttribute('data-slide-index'));
            flickityInstance.select(selectToIndex, false, true);
        }
    }
}

MandolinThemeEditor.deselectBlockSlideshow = function(event){
    const sectionTarget = event.target.classList.contains('SlideItem--'+event.detail.blockId);
    if (!sectionTarget) return;

    let ele = document.getElementById("section-"+event.detail.sectionId);
    let eleflkty = ele.querySelector('[data-flickity-config]');

    if(eleflkty){
        let flickityInstance = Flickity.data( eleflkty );
        if(flickityInstance){
            flickityInstance.unpausePlayer();
        }
    }
}

//Testimonials
MandolinThemeEditor.selectBlockTestimonials = function(event){
    const sectionTarget = event.target.classList.contains('TestimonialWrapper--'+event.detail.blockId);
    if (!sectionTarget) return;

    let ele = document.getElementById("section-"+event.detail.sectionId);
    let eleflkty = ele.querySelector('[data-flickity-config]');

    if(eleflkty){
        let flickityInstance = Flickity.data( eleflkty );
        if(flickityInstance){
            flickityInstance.pausePlayer();
    
            let selectToIndex = parseInt(event.target.getAttribute('data-slide-index'));
            flickityInstance.select(selectToIndex, false, true);
        }
    }
}

MandolinThemeEditor.deselectBlockTestimonials = function(event){

    const sectionTarget = event.target.classList.contains('TestimonialWrapper--'+event.detail.blockId);
    if (!sectionTarget) return;

    let ele = document.getElementById("section-"+event.detail.sectionId);
    let eleflkty = ele.querySelector('[data-flickity-config]');

    if(eleflkty){
        let flickityInstance = Flickity.data( eleflkty );
        if(flickityInstance){
            flickityInstance.unpausePlayer();
        }
    }
}

//Quickview Modal section
MandolinThemeEditor.selectSectionQuickviewModal = function(event) {
    const sectionTarget = event.target.classList.contains('shopify-section--product-quickview');
    if (!sectionTarget) return;
    let ele = document.getElementById('ProductQuickviewModal');
 
    let quiviewModal = themegoal.components.Modal.getOrCreateInstance(ele);
   
    quiviewModal.show();
};
MandolinThemeEditor.deselectSectionQuickviewModal = function(event) {
    const sectionTarget = event.target.classList.contains('shopify-section--product-quickview');
    if (!sectionTarget) return;
    let ele = document.getElementById('ProductQuickviewModal');
 
    let quiviewModal = themegoal.components.Modal.getOrCreateInstance(ele);
   
    quiviewModal.hide();
};