// Initialize app
window.addEventListener('load', () => {
  const pageManager = new PageManager();
  pageManager.init();
});

class PageManager {
  constructor() {
    this.state = {
      parentPage: 'depth-1',
      currentPage: 'depth-1-1',
      isAnimating: false,
      isUpScrollLocked: false,
      isDownScrollLocked: false,
    };

    this.config = {
      animationDuration: 600,
      dragDistance: 200,
    };

    this.elements = {
      mainContent: document.getElementById('main-contents'),
      header: document.querySelector('.header'),
      dots: document.querySelectorAll('.paging-dot .dots a'),
      dotsContainer: document.querySelector('.paging-dot .dots'),
      verticalPages: document.querySelectorAll('.page-vertical'),
    };

    this.animations = new PageAnimations();
  }

  init() {
    this.setupEventListeners();
    this.updateDots();
  }

  setupEventListeners() {
    this.setupScrollListener();
    this.setupDotNavigation();
    this.setupTouchEvents();
  }

  setupDotNavigation() {
    const dots = document.querySelectorAll('.paging-dot .dots a');

    dots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault(); // 기본 앵커 동작 방지

        let targetPageId;
        switch(index) {
          case 0: // 첫 번째 dot (Product)
            targetPageId = 'depth-1-2';
            break;
          case 1: // 두 번째 dot (Company)
            targetPageId = 'depth-1-4';
            break;
          case 2: // 세 번째 dot (Media)
            targetPageId = 'depth-1-5';
            break;
        }

        if (targetPageId) {
          this.movePage(targetPageId);
        }
      });
    });
  }

  setupScrollListener() {
    this.elements.mainContent.addEventListener('wheel', (e) => {
      if (this.state.isAnimating) {
        e.preventDefault();
        return false;
      }

      if (e.target.closest('.swiper')) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }

      const delta = e.deltaY || -e.wheelDelta || e.detail;
      if (delta > 0 && !this.state.isDownScrollLocked) {
        this.movePage('down');
      } else if (delta < 0 && !this.state.isUpScrollLocked) {
        this.movePage('up');
      }
    }, { passive: false });
  }

  setupTouchEvents() {
    if (!window.matchMedia('screen and (max-width: 1024px)').matches) return;

    let touchStartY = 0;
    let touchStartX = 0;

    this.elements.mainContent.addEventListener('touchstart', (e) => {
      if (this.state.isAnimating) return false;
      touchStartY = e.touches[0].pageY;
      touchStartX = e.touches[0].pageX;
    }, { passive: false });

    this.elements.mainContent.addEventListener('touchend', (e) => {
      if (this.state.isAnimating) return false;

      const touchEndY = e.changedTouches[0].pageY;
      const touchEndX = e.changedTouches[0].pageX;

      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;

      if (e.target.closest('.swiper')) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          return;
        }
      }

      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0 && !this.state.isDownScrollLocked) {
          this.movePage('down');
        } else if (deltaY < 0 && !this.state.isUpScrollLocked) {
          this.movePage('up');
        }
      }
    }, { passive: false });
  }

  movePage(direction, targetPageId = null) {
    if (this.state.isAnimating) return;

    this.state.isAnimating = true;
    gsap.killTweensOf('.side-btns');

    if (direction === 'down' || direction === 'up') {
      this.handleDirectionalMove(direction);
    } else {
      this.handleDotNavigation(direction);
    }

    // 애니메이션 완료 후에만 isAnimating 상태를 false로 변경
    setTimeout(() => {
      this.state.isAnimating = false;
      // 애니메이션 완료 후 dots 상태 한 번 더 업데이트
      this.updateDots();
    }, this.config.animationDuration);
  }

  handleDirectionalMove(direction) {
    const currentPage = document.querySelector(`#${this.state.parentPage} .page-vertical.active`);
    const nextPage = direction === 'down' ?
      currentPage.nextElementSibling :
      currentPage.previousElementSibling;

    if (!nextPage) return;

    currentPage.classList.remove('active');

    if (direction === 'down') {
      currentPage.classList.add('prev');
      nextPage.classList.add('active');
    } else {
      currentPage.classList.remove('prev');
      nextPage.classList.add('active');
      nextPage.classList.remove('prev');
    }

    this.state.currentPage = nextPage.id;
    this.updateDots(); // 상태 업데이트 즉시 실행
    this.animations.playPageTransition(nextPage.id, direction);
  }

  handleDotNavigation(targetPageId) {
    const currentPage = document.querySelector(`#${this.state.parentPage} .page-vertical.active`);
    const targetPage = document.getElementById(targetPageId);

    if (!targetPage || currentPage === targetPage) return;

    gsap.killTweensOf('#depth-1-2');
    gsap.killTweensOf('#depth-1-3');
    gsap.killTweensOf('.side-btns');
    gsap.set('.side-btns', { opacity: 1, bottom: '6.5%' });
    gsap.set('#depth-1-2', { autoAlpha: 1 });

    currentPage.classList.remove('active');

    const pages = document.querySelectorAll('.page-vertical');
    pages.forEach(page => {
      if (page.id < targetPageId) {
        page.classList.add('prev');
      } else {
        page.classList.remove('prev');
      }
    });

    targetPage.classList.add('active');

    this.state.currentPage = targetPageId;
    this.updateDots(); // 상태 업데이트 즉시 실행
    this.animations.playPageTransition(targetPageId, 'dot');
  }

  updateDots() {
      if (this.state.isAnimating) return; // 애니메이션 중에는 업데이트 건너뛰기

    const dots = document.querySelectorAll('.paging-dot .dots a');
    const currentPage = this.state.currentPage;

    // 모든 dots의 active 클래스 제거
    dots.forEach(dot => dot.classList.remove('active'));

    // 현재 페이지에 따라 dots active 처리
    let activeIndex = -1;

    switch(currentPage) {
      case 'depth-1-2':
      case 'depth-1-3':
        activeIndex = 0;
        break;
      case 'depth-1-4':
        activeIndex = 1;
        break;
      case 'depth-1-5':
        activeIndex = 2;
        break;
    }

    // active 클래스 추가 (인덱스가 유효한 경우에만)
    if (activeIndex >= 0 && activeIndex < dots.length) {
      requestAnimationFrame(() => {
        dots[activeIndex].classList.add('active');
      });
    }

    // dots container 스타일 업데이트
    const dotsContainer = document.querySelector('.paging-dot .dots');
    dotsContainer.classList.toggle('type1', currentPage !== 'depth-1-1' && currentPage !== 'depth-1-6');
    dotsContainer.classList.toggle('type2', ['depth-1-2', 'depth-1-3', 'depth-1-5'].includes(currentPage));
  }

  updateActiveLink() {
    const activeLink = document.querySelector('a.active');
    if (activeLink) {
      activeLink.classList.remove('active');
    }

    if (this.state.currentPage === 'depth-1-2' || this.state.currentPage === 'depth-1-3') {
      const productLink = document.querySelector('a[href="#a"]');
      if (productLink) {
        productLink.classList.add('active');
      }
    }
  }
}

class PageAnimations {
  constructor() {
    this.animations = {
      'depth-1-1': {
        enter: () => {
          gsap.fromTo('.side-btns',
            { opacity: 0, bottom: '28.5%' },
            {
              opacity: 1,
              duration: 1,
              delay: 0.5,
              onComplete: () => {
                gsap.set('.side-btns', { opacity: 1, bottom: '28.5%' })
              }
            }
          );
          header.dataset.headerType = "white";
        }
      },
      'depth-1-2': {
        enter: () => {
          gsap.killTweensOf('#depth-1-2');
          gsap.killTweensOf('#depth-1-3');
          gsap.killTweensOf('.side-btns');
          gsap.set('.side-btns', { opacity: 1, bottom: '6.5%' });
          this.animateText('#depth-1-2 .mask', 0.7);
          gsap.fromTo('.side-btns',
            { opacity: 0, bottom: '6.5%' },
            { delay: 0.5, opacity: 1, duration: 1 }
          );
          this.animateGridBox('#depth-1-2');
          header.dataset.headerType = "light"
        }
      },
      'depth-1-3': {
        enter: () => {
          gsap.killTweensOf('#depth-1-2');
          gsap.killTweensOf('#depth-1-3');
          gsap.killTweensOf('.side-btns');
          gsap.set('.side-btns', { opacity: 1, bottom: '6.5%' });
          var prevPage = document.getElementById('depth-1-2');
          var currentPage = document.getElementById('depth-1-3');

          this.animateText('#depth-1-3 .mask', 0.7);
          gsap.to(currentPage, { delay: 0.8, duration: 0.2, autoAlpha: 1 });
          gsap.to(prevPage, { delay: 1.4, duration: 0, autoAlpha: 0 });
          currentPage.style.pointerEvents = 'auto';
          this.animateGridBox('#depth-1-3', 1);
        },
        exit: () => {
          gsap.killTweensOf('#depth-1-2');
          gsap.killTweensOf('#depth-1-3');
          var nextPage = document.getElementById('depth-1-3');
          var currentPage = document.getElementById('depth-1-2');

          this.animateText('#depth-1-2 .mask', 0.7);
          gsap.to(nextPage, { delay: 0.6, duration: 0.2, autoAlpha: 0 });
          gsap.to(nextPage, { duration: 0, y: 0 });
          gsap.to(currentPage, { duration: 0, autoAlpha: 1 });
          nextPage.style.pointerEvents = 'none';
          this.animateGridBox('#depth-1-2', 0.8);
        }
      },
      'depth-1-4': {
        enter: () => {
          // 이전 애니메이션 종료
          gsap.killTweensOf('.main-company article');

          // Company 섹션의 article 애니메이션
          document.querySelectorAll('.main-company article').forEach((el, index) => {
            gsap.fromTo(el,
              { y: 100, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 1,
                delay: 0.5 + index * 0.1,
                ease: 'power4.out'
              }
            );
          });
        }
      },
      'depth-1-5': {
        enter: () => {
          gsap.to('.side-btns', { autoAlpha: 1 });
        }
      },
      'depth-1-6': {
        enter: () => {
          gsap.to('.side-btns', { autoAlpha: 0 });
        }
      }
    };
  }

  playPageTransition(pageId, direction) {
    const animation = this.animations[pageId];
    if (animation) {
      if (direction === 'up' && pageId === 'depth-1-2') {
        // depth-1-3에서 depth-1-2로 올라갈 때
        this.animations['depth-1-3'].exit();
      } else {
        animation.enter();
      }
    }
  }

  animateGridBox(selector, delay = 0.5) {
    gsap.fromTo(`${selector} .grid-box article`,
      { y: '20%', opacity: 0 },
      { delay, opacity: 1, y: 0, duration: 1, stagger: 0.12 }
    );
  }

  animateCompanyArticles() {
    document.querySelectorAll('.main-company article').forEach((el, index) => {
      gsap.fromTo(el,
        { y: 100, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          delay: 0.5 + index * 0.1,
          ease: 'power4.out'
        }
      );
    });
  }

  animateText(selector, delay) {
    const element = document.querySelector(selector);
    if (!element) return;

    const text = element.textContent;
    element.innerHTML = '';

    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.innerHTML = char === ' ' ? '&nbsp;' : char;
      element.appendChild(span);
    });

    const spans = document.querySelectorAll(`${selector} span`);
    const duration = 0.5;
    const staggerEach = duration / spans.length;

    gsap.timeline()
      .to(`${selector} span`, {
        color: '#005eb8',
        stagger: {
          each: staggerEach,
          from: 'start'
        },
        duration: duration,
        autoAlpha: 1,
        transform: 'none',
        delay: delay,
        ease: "power1.outIn",
      });
  }
}
