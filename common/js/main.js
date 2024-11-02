var link = '';
window.addEventListener('load', function () {
  var browser = '';
  app.init(link);
});

var app = new (function () {
  this.$swipeH = document.querySelectorAll('.page-vertical');
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

    document.getElementById('main-contents').addEventListener('wheel', function (e) {
      if (_this.is_pageAnimating) {
        e.preventDefault();
        return false;
      }

      var delta = e.deltaY || -e.wheelDelta || e.detail;

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

    if (derection == 'down') {
      var nextPage = document.querySelector('#' + this.parrentPage + ' .page-vertical.active').nextElementSibling;
      if (nextPage) {
        this.currentPage = nextPage.id;
        document.querySelector('#' + this.parrentPage + ' .page-vertical.active').classList.add('prev');
        document.querySelector('#' + this.parrentPage + ' .page-vertical.active').classList.remove('active');
        nextPage.classList.add('active');
        if (nextPage.id === 'depth-1-2') {
          this.animateText('#depth-1-2 .mask', 0.7);
        } else if (nextPage.id === 'depth-1-3') {
          var prevPage = nextPage.previousElementSibling;
          gsap.to(nextPage, { delay: 0.7, duration: 0.5, autoAlpha: 1 });
          gsap.to(prevPage, { delay: 1.3, duration: 0, autoAlpha: 0 });
          this.animateText('#depth-1-3 .mask', 1);
        }
        this.changeVertController();
      }
    } else if (derection == 'up') {
      var prevPage = document.querySelector('#' + this.parrentPage + ' .page-vertical.active').previousElementSibling;
      if (prevPage) {
        this.currentPage = prevPage.id;
        document.querySelector('#' + this.parrentPage + ' .page-vertical.active').classList.remove('active');
        prevPage.classList.remove('prev');
        prevPage.classList.add('active');
        if (prevPage.id === 'depth-1-1') {
        } else if (prevPage.id === 'depth-1-2') {
          this.animateText('#depth-1-2 .mask', 1.4);
          var nextNextPage = prevPage.nextElementSibling;
          gsap.to(nextNextPage, { delay: 0.7, duration: 1, autoAlpha: 0, });
          gsap.to(nextNextPage, { duration: 0, y: 0, });
          gsap.to(prevPage, { duration: 0.5, autoAlpha: 1, });
        }
        this.changeVertController();
      }
    } else {
      // dots click
      this.currentPage = _derection;
      this.changeVertController();
      document.querySelector('#' + _this.parrentPage + ' .page-vertical.active').classList.remove('active');
      document.querySelector('#' + _this.parrentPage + ' .page-vertical.active').classList.remove('prev');
      document.getElementById(_derection).classList.add('active');
      var prevAll = document.getElementById(_derection).previousElementSiblings;
      var nextAll = document.getElementById(_derection).nextElementSiblings;
      prevAll.forEach(function (el) { el.classList.add('prev'); });
      nextAll.forEach(function (el) { el.classList.remove('prev'); });
    }

    setTimeout(function () {
      _this.is_pageAnimating = false;
    }, aniSec);
  };

  this.changeVertController = function () {
    var num = parseInt(this.currentPage.substring(8, 9)) - 1;
    var dots = document.querySelectorAll('.paging-dot .dots a');
    dots.forEach(function (dot, index) {
      if (index === num) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // 백그라운드 이미지 변경에 따른 컬러 변경
    var dotsContainer = document.querySelector('.paging-dot .dots');
    if (this.currentPage == 'depth-1-2' || this.currentPage == 'depth-1-4' || this.currentPage == 'depth-1-5') {
      dotsContainer.classList.add('type2');
    } else {
      dotsContainer.classList.remove('type2');
    }
    if (this.currentPage == 'depth-1-5') {
      dotsContainer.classList.add('type-last');
    } else {
      dotsContainer.classList.remove('type-last');
    }
  };

  this.setVertController = function (_prev) {
    this.onVertControllEvent();
  };

  this.onVertControllEvent = function () {
    var _this = this;
    var dots = document.querySelectorAll('.paging-dot .dots a');
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var page = _this.currentPage.substring(0, 8) + (Array.prototype.indexOf.call(dots, dot) + 1);
        _this.movePage(page);
      });
    });
  };

  this.onUpDownControllEvent = function () {
    var _this = this;
    var scrollLinks = document.querySelectorAll('.paging-scroll a');
    scrollLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        _this.movePage('up');
      });
    });
  };

  this.animateText = function(selector, delay) {
    console.log('animateText');
    const element = document.querySelector(selector);
    const text = element.textContent;
    element.innerHTML = '';

    text.split('').forEach(char => {
        const span = document.createElement('span');
        if (char === ' ') {
            span.innerHTML = '&nbsp;';
        } else {
            span.textContent = char;
        }
        element.appendChild(span);
    });

    const tl1 = gsap.timeline();
    tl1.to(`${selector} span`, {
        color: '#005eb8', 
        stagger: 0.05,
        duration: 0.2,
        delay: delay
    });

    const tl2 = gsap.timeline({ delay: delay + 0.6 });
    tl2.to(`${selector} span`, {
        color: '#000', 
        stagger: 0.05,
        duration: 0.2
    });
  }

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
      var mainContents = document.getElementById('main-contents');
      mainContents.addEventListener('touchstart', function (e) {
        if (_this.is_pageAnimating) {
          e.preventDefault();
          return false;
        }
        var xPos = 0;
        var yPos = 0;
        if (e.type == 'mousedown') {
          xPos = e.pageX;
          yPos = e.pageY;
        } else {
          xPos = e.touches[0].pageX;
          yPos = e.touches[0].pageY;
        }

        _this.startX = xPos;
        _this.startY = yPos;

        _this.target = e.target;
      });

      mainContents.addEventListener('touchend', function (e) {
        if (_this.is_pageAnimating) {
          e.preventDefault();
          return false;
        }
        var xPos = 0;
        var yPos = 0;
        if (e.type == 'mouseup') {
          xPos = e.pageX;
          yPos = e.pageY;
        } else {
          xPos = e.changedTouches[0].pageX;
          yPos = e.changedTouches[0].pageY;
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

    document.getElementById('main-contents').addEventListener('wheel', function (e) {
      if (_this.is_pageAnimating) {
        e.preventDefault();
        return false;
      }

      var delta = e.deltaY || -e.wheelDelta || e.detail;

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