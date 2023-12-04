(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.themegoal = global.themegoal || {}, global.themegoal.helpers = factory()));
})(this, (function () { 'use strict';

  class Currency {
    static formatMoney(cents, format) {
      if (typeof cents === 'string') {
        cents = cents.replace('.', '');
      }

      var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
          formatString = format || '${{amount}}';

      function defaultTo(value, defaultValue) {
        return value == null || value !== value ? defaultValue : value;
      }

      function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = defaultTo(precision, 2);
        thousands = defaultTo(thousands, ',');
        decimal = defaultTo(decimal, '.');

        if (isNaN(number) || number == null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);
        var parts = number.split('.'),
            dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
            centsAmount = parts[1] ? decimal + parts[1] : '';
        return dollarsAmount + centsAmount;
      }

      var value = '';

      switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
          value = formatWithDelimiters(cents, 2);
          break;

        case 'amount_no_decimals':
          value = formatWithDelimiters(cents, 0);
          break;

        case 'amount_with_space_separator':
          value = formatWithDelimiters(cents, 2, ' ', '.');
          break;

        case 'amount_no_decimals_with_comma_separator':
          value = formatWithDelimiters(cents, 0, ',', '.');
          break;

        case 'amount_no_decimals_with_space_separator':
          value = formatWithDelimiters(cents, 0, ' ');
          break;

        case 'amount_with_comma_separator':
          value = formatWithDelimiters(cents, 2, '.', ',');
          break;
      }

      if (formatString.indexOf('with_comma_separator') !== -1) {
        return formatString.replace(placeholderRegex, value).replace(',00', '');
      } else {
        return formatString.replace(placeholderRegex, value).replace('.00', '');
      }
    }

  }

  class Dom {
    static nodeListToArray(nodeList, filter) {
      var items = [];

      for (var i = 0; i !== nodeList.length; ++i) {
        if (!filter || nodeList[i].matches(filter)) {
          items.push(nodeList[i]);
        }
      }

      return items;
    }

  }

  class Responsive {
    constructor(name) {
      var _this = this;

      this.currentBreakpoint = Responsive.getCurrentBreakpoint();
      window.addEventListener('resize', function () {
        var newBreakpoint = Responsive.getCurrentBreakpoint();

        if (_this.currentBreakpoint === newBreakpoint) {
          return;
        }

        document.dispatchEvent(new CustomEvent('breakpoint:changed', {
          detail: {
            previousBreakpoint: _this.currentBreakpoint,
            currentBreakpoint: newBreakpoint
          }
        }));
        _this.currentBreakpoint = newBreakpoint;
      });
    }

    static matchesBreakpoint(breakpoint) {
      switch (breakpoint) {
        case 'small':
          return window.matchMedia('screen and (max-width: 640px)').matches;

        case 'medium':
          return window.matchMedia('screen and (min-width: 641px) and (max-width: 1007px)').matches;

        case 'large':
          return window.matchMedia('screen and (min-width: 1008px)').matches;

        case 'x-large':
          return window.matchMedia('screen and (min-width: 1280px)').matches;

        case 'x-x-large':
          return window.matchMedia('screen and (min-width: 1600px)').matches;

        case 'medium-up':
          return window.matchMedia('screen and (min-width: 641px)').matches;

        case 'medium-down':
          return window.matchMedia('screen and (max-width: 1007px)').matches;
      }
    }

    static getCurrentBreakpoint() {
      if (window.matchMedia('screen and (max-width: 640px)').matches) {
        return 'small';
      }

      if (window.matchMedia('screen and (min-width: 641px) and (max-width: 1007px)').matches) {
        return 'medium';
      }

      if (window.matchMedia('screen and (min-width: 1600px)').matches) {
        return 'x-x-large';
      } else if (window.matchMedia('screen and (min-width: 1280px)').matches) {
        return 'x-large';
      }

      if (window.matchMedia('screen and (min-width: 1008px)').matches) {
        return 'large';
      }
    }

  }

  const helpers = {
    Currency,
    Dom,
    Responsive
  };

  return helpers;

}));
