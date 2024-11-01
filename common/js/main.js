
// // wheel scroll

var link = '';

$(window).on('load', function () {
  var browser = '';
  app.init(link);
});

var app = new (function () {
  this.$swipeH = $('.page-vertical');
  this.parrentPage = 'depth-1';
  this.currentPage = 'depth-1-1';
  this.pageType = 'single';
  this.is_upScrollLock = false;
  this.is_downScrollLock = false;
  this.is_pageAnimating = false;
  this.distance = 200; // 드래그 길이
  this.pos = { startX: 0, startY: 0, endX: 0, endY: 0 };
  this.target = null;
  this.confirm = true;

  this.drag = function () {
    var _this = this;

    $('#main-contents').on('mousewheel DOMMouseScroll', function (e) {
      console.log('dasd')
      if (_this.is_pageAnimating) {
        return false;
      }

      var delta = 0;

      if (!event) event = window.event;
      if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) {
          delta = -delta;
        }
      } else if (event.detail) {
        delta = -event.detail / 3;
      }

      if (delta > 0) {
        if (!_this.is_downScrollLock) {
          _this.movePage('down');
        }
      } else {
        if (!_this.is_upScrollLock) {
          _this.movePage('up');
        }
      }
    });
  };

  this.movePage = function (_derection, _option) {
    var _this = this;
    var derection = _derection;
    var option = _option;
    var aniSec = 600;

    this.is_pageAnimating = true;

    if (derection == 'up') {
      if (
        $('#' + this.parrentPage)
          .find('.page-vertical.active')
          .next().length > 0
      ) {
        this.currentPage = $('#' + this.parrentPage)
          .find('.page-vertical.active')
          .next('.page-vertical')
          .attr('id');
        $('#' + this.parrentPage)
          .find('.page-vertical.active')
          .addClass('prev')
          .removeClass('active')
          .next()
          .addClass('active');
        this.changeVertController();
      }
    } else if (derection == 'down') {
      if (
        $('#' + this.parrentPage)
          .find('.page-vertical.active')
          .prev().length > 0
      ) {
        this.currentPage = $('#' + this.parrentPage)
          .find('.page-vertical.active')
          .prev('.page-vertical')
          .attr('id');
        $('#' + this.parrentPage)
          .find('.page-vertical.active')
          .removeClass('active')
          .prev()
          .removeClass('prev')
          .addClass('active');
        this.changeVertController();
      }
    } else {
      // dots click
      this.currentPage = _derection;
      this.changeVertController();
      $('#' + _this.parrentPage)
        .find('.page-vertical.active')
        .removeClass('active')
        .removeClass('prev');
      $('#' + _derection).addClass('active');
      $('#' + _derection)
        .prevAll()
        .addClass('prev');
      $('#' + _derection)
        .nextAll()
        .removeClass('prev');
    }

    setTimeout(function () {
      _this.is_pageAnimating = false;
    }, aniSec);
  };

  this.changeVertController = function () {
    var num = this.currentPage.substring(8, 9) - 1;
    $('.paging-dot .dots a').eq(num).addClass('active').siblings().removeClass('active');

    // 백그라운드 이미지 변경에 따른 컬러 변경
    if (this.currentPage == 'depth-1-2' || this.currentPage == 'depth-1-4' || this.currentPage == 'depth-1-5') {
      $('.paging-dot .dots').addClass('type2');
    } else {
      $('.paging-dot .dots').removeClass('type2');
    }
    if (this.currentPage == 'depth-1-5') {
      $('.paging-dot .dots').addClass('type-last');
    } else {
      $('.paging-dot .dots').removeClass('type-last');
    }
  };

  this.setVertController = function (_prev) {
    this.onVertControllEvent();
  };

  this.onVertControllEvent = function () {
    var _this = this;
    $('.paging-dot .dots')
      .find('a')
      .on('click', function () {
        var page = _this.currentPage.substring(0, 8) + ($(this).index() + 1);
        _this.movePage(page);
      });
  };

  this.onUpDownControllEvent = function () {
    var _this = this;
    $('.paging-scroll a').on('click', function () {
      _this.movePage('up');
    });
  };

  this.init = function (_parent) {
    var _this = this;
    this.setVertController(this.parentPage, '');
    this.drag();
    this.onVertControllEvent();
    this.onUpDownControllEvent();
  };

  this.drag = function () {
    var _this = this;
    var winMobile = window.matchMedia('screen and (max-width: 1024px)');

    if (winMobile.matches) {
      $('#main-contents').on('touchstart mousedown', function (e) {
        if (_this.is_pageAnimating) {
          return false;
        }
        var xPos = 0;
        var yPos = 0;
        if (e.type == 'mousedown') {
          xPos = e.pageX;
          yPos = e.pageY;
        } else {
          xPos = e.originalEvent.touches[0].pageX;
          yPos = e.originalEvent.touches[0].pageY;
        }

        _this.startX = xPos;
        _this.startY = yPos;

        this.target = e.target;
      });

      $('#main-contents').on('touchend mouseup', function (e) {
        if (_this.is_pageAnimating) {
          return false;
        }
        var xPos = 0;
        var yPos = 0;
        if (e.type == 'mouseup') {
          xPos = e.pageX;
          yPos = e.pageY;
        } else {
          xPos = e.originalEvent.changedTouches[0].pageX;
          yPos = e.originalEvent.changedTouches[0].pageY;
        }
        _this.endX = xPos;
        _this.endY = yPos;

        if (_this.startY - _this.endY > 0) {
          if (!_this.is_upScrollLock) {
            _this.movePage('up');
          }
        } else {
          if (!_this.is_downScrollLock) {
            _this.movePage('down');
          }
        }
      });
    }

    $('#main-contents').on('mousewheel DOMMouseScroll', function (e) {
      if (_this.is_pageAnimating) {
        return false;
      }

      var delta = 0;

      if (!event) event = window.event;
      if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) {
          delta = -delta;
        }
      } else if (event.detail) {
        delta = -event.detail / 3;
      }

      if (delta > 0) {
        if (!_this.is_downScrollLock) {
          _this.movePage('down');
        }
      } else {
        if (!_this.is_upScrollLock) {
          _this.movePage('up');
        }
      }
    });
  };
})();
