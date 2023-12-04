(function () {
  'use strict';

  (function () {
    new themegoal.helpers.Responsive();
    new TG_ProductCardColorSwatch();
    let windowWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      let newWidth = window.innerWidth;

      if (newWidth === windowWidth) {
        return;
      }

      let headerSection = document.getElementById('Header');
      let announcementBarSection = document.getElementById('AnnouncementBar');
      let pageHeader = document.getElementById('PageHeader');
      windowWidth = newWidth;
      document.documentElement.style.setProperty('--tg-window-height', window.innerHeight + 'px');

      if (headerSection) {
        document.documentElement.style.setProperty('--tg-header-height', headerSection.offsetHeight + 'px');
      }

      if (announcementBarSection) {
        document.documentElement.style.setProperty('--tg-announcement-bar-height', announcementBarSection.offsetHeight + 'px');
      }

      if (pageHeader) {
        document.documentElement.style.setProperty('--tg-page-header-height', pageHeader.offsetHeight + 'px');
      }
    });
    if (document.getElementById('SearchDrawer')) new TG_SearchDrawer();
  })();

})();
