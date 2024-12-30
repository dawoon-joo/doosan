const revealOption = { duration: 1200, distance: '100px', opacity: 0, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', reset: false, beforeReveal: (el) => { el.classList.add('sr-animate') }, beforeReset: (el) => { el.classList.remove('sr-animate') } }
const revealOption2 = { duration: 1200, distance: '1920px', opacity: 1, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', reset: false, beforeReveal: (el) => { el.classList.add('sr-animate'); }, beforeReset: (el) => { el.classList.remove('sr-animate'); }};
const fadeIn = { ...revealOption, distance: 0 }
const fadeUp = { ...revealOption, origin: 'bottom' }
const fadeRight = { ...revealOption, origin: 'left' }
const fadeLeft = { ...revealOption, origin: 'right' }
const fadeLeft2 = { ...revealOption2, origin: 'right' }
const zoomOutUp = { ...revealOption, origin: 'bottom', scale: 0.5 }
const banner = { ...revealOption2, origin: 'right' };

let HTML, HEADER, FOOTER, GNB, NAV, thisScroll = 0;
let option = {
    mobileWidth: 1400,
    ticking: false,
    timeline: [],
}
lenis = new Lenis({
  duration: 1.2,
  infinite: false,
  easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  gestureOrientation: "vertical",
  normalizeWheel: false,
  smoothTouch: true
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
document.addEventListener("DOMContentLoaded", function() {
  var isLocal = window.location.hostname === 'dawoon-joo.github.io/doosan/' || window.location.hostname === '192.168.0.7';
  var headerUrl = isLocal ? '../../inc/header.html' : '/doosan/inc/header.html';
  loadContent('header', '/kr/inc/header.html', function() {
    observeElement('header', function() {
      common.init();
      common.windowScroll();
      common.windowResize();
      common.header();
      common.sub();
      // hamburger();
    });
  });
  loadContent('footer', '/kr/inc/footer.html', function(){
    footerDropDown();
  });
});

function loadContent(elementId, url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      document.getElementById(elementId).innerHTML = xhr.responseText;
      if (callback) {
        callback();
      }
    }
  };
  xhr.send();
}

function observeElement(elementId, callback) {
  var targetNode = document.getElementById(elementId);
  if (targetNode) {
    callback(targetNode);
  } else {
    var observer = new MutationObserver(function(mutationsList, observer) {
      for (var mutation of mutationsList) {
        if (mutation.type === 'childList') {
          var targetNode = document.getElementById(elementId);
          if (targetNode) {
            observer.disconnect();
            callback(targetNode);
            break;
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

let common = {
    lenus: null,
    init: () => {
        HTML = document.querySelector('html');
        HEADER = document.querySelector('header');
        FOOTER = document.querySelector('footer');
        GNB = HEADER.querySelector('.gnb');
        NAV = HEADER.querySelectorAll('.nav .depth1 > li');
        NAVLINK = HEADER.querySelectorAll('.nav .depth1 > li > a');

        gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
        handler.initialize();
        if(shouldDisableLenis()){
          lenis.destroy();
        }
    },
    windowScroll: () => {
        window.addEventListener('scroll', () => {
            if (!option.ticking) {
                window.requestAnimationFrame(() => {
                    scrollAnimate();
                    option.ticking = false;
                });
                option.ticking = true;
            }
            // floating();
        });

        function scrollAnimate(){
            stickyHeader();
            toggleHeader();
        }
    },
    windowResize: () => {
        window.addEventListener('resize', () => {
            handler.updateDevice();
            hamburger.update();

            if(shouldDisableLenis()){
                if(lenis) lenis.destroy();
            } else {
                if(!lenis) {
                    lenis = new Lenis({
                        duration: 1.2,
                        infinite: false,
                        easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
                        gestureOrientation: "vertical",
                        normalizeWheel: false,
                        smoothTouch: true
                    });
                    requestAnimationFrame(raf);
                }
            }
        });
    },
    header: () => {
        handler.updateHeader();
        hamburger.initialize();
        stickyHeader();
        toggleHeader();
        depthHeader();
        language();

        NAV.forEach(item => {
          const link = item.querySelector('a');
          item.addEventListener('mouseenter', mouseEnter);
          item.addEventListener('mouseleave', mouseLeave);
          // link.addEventListener('focus', mouseEnter);
          // item.addEventListener('focusin', handleFocusIn);
          // item.addEventListener('focusout', handleFocusOut);
        });

        function mouseEnter(event){
            option.headerTheme = HEADER.dataset.headerTheme;
            if(handler.isMobile()){
                return;
            }
            if (option.headerTheme === 'white'){
                HEADER.dataset.headerTheme = 'light';
                option.headerPreviousTheme = 'white';
            }
            if (option.headerTheme === 'transparent'){
                HEADER.dataset.headerTheme = 'light';
            }
            HEADER.dataset.headerGnb = 'opened';
            const link = event.currentTarget;
            const depth1 = link.closest('li');
            const submenu = depth1.querySelector('.header-submenu');
            if (submenu) {
                gsap.to(submenu, { duration: 0, opacity: 1, visibility: 'visible' });
            }
        }
        function mouseLeave(event) {
            if(handler.isMobile()){
                return;
            }
            gsap.killTweensOf(GNB);
            if (option.headerPreviousTheme === 'white') {
                HEADER.dataset.headerTheme = 'white';
                option.headerPreviousTheme = '';
            }
            if (option.headerTheme === 'transparent') {
                HEADER.dataset.headerTheme = 'transparent';
            }
            HEADER.removeAttribute('data-header-GNB');
            const link = event.currentTarget;
            const depth1 = link.closest('li');
            const submenu = depth1.querySelector('.header-submenu');
            if (submenu) {
                gsap.to(submenu, { duration: 0, opacity: 0, visibility: 'hidden' });
            }
        }
        // function handleFocusIn(event) {
        //   const item = event.currentTarget;
        //   item.dataset.focused = 'true';
        // }

        // function handleFocusOut(event) {
        //     const item = event.currentTarget;
        //     setTimeout(() => {
        //         if (!item.contains(document.activeElement)) {
        //             mouseLeave({ currentTarget: item });
        //         }
        //     }, 0);
        // }
    },
    sub: () => {
      sublinkWrap();
      scrollBtn();
      subDropDown();
      removeActive();
      searchToggle();
      // footerDropDown();
    }
}

let handler = {
    initialize() {
        option.windowWidth = window.innerWidth;
        option.windowHeight = window.innerHeight;

        this.updateDevice();
    },
    updateDevice() {
        option.windowWidth = window.innerWidth;
        option.windowHeight = window.innerHeight;

        this.getDevice();
    },
    updateHeader: () => {
        option.headerMinHeight = GNB.offsetHeight;
        option.headerMaxHeight = GNB.querySelector('.depth1').offsetHeight;
        // GNB.querySelector('.background').style.top = option.headerMinHeight + 'px';
    },
    getDevice: () => {
        if (option.windowWidth <= option.mobileWidth) {
            option.device = 'mobile';
        } else {
            option.device = 'pc';
        }

        return option.device;
    },
    isMobile: () => {
      return option.device === 'mobile';
    },
    resetHeader: () => {
        option.headerMinHeight = 'auto';
        option.headerMaxHeight = 'none';
        // GNB.querySelector('.background').removeAttribute('style');
    }
}

let hamburger = {
    depth1: '',
    depth2Links: '',
    hamburgerBtn: '',
    currentDevice: '',
    initialize() {
        this.depth1 = GNB.querySelectorAll('.depth1 > li > a');
        this.depth2Links = GNB.querySelectorAll('.header-submenu-list .depth2 > li > a');
        this.hamburgerBtn = HEADER.querySelector('.hamburger a');
        document.addEventListener('click', e => {
          if(HEADER.dataset.hamburger === 'opened' && !e.target.closest('.nav') && !e.target.closest('.hamburger')) {
            this.toggleMenu.call(this.hamburgerBtn);
          }
        });
        if(handler.isMobile()){
            this.makeBurger();
        }

        this.currentDevice = handler.getDevice();
        this.update();
    },
    makeBurger(){
        this.hamburgerBtn.addEventListener('click', this.toggleMenu);
        this.depth1.forEach((element) => element.addEventListener('click', this.accordion) );
        this.depth2Links.forEach((element) => element.addEventListener('click', this.accordion));
    },
    removeBurger(){
        this.hamburgerBtn.addEventListener('click', this.toggleMenu);
        this.depth1.forEach((element) => element.removeEventListener('click', this.accordion) );
        this.depth2Links.forEach((element) => element.removeEventListener('click', this.accordion));
    },
    toggleMenu() {
      const isOpened = HEADER.dataset.hamburger === 'opened';
      const body = document.body;
      const html = document.documentElement;
      if(isOpened) {
        setScrollState(true);
        HEADER.dataset.hamburger = 'closed';
        this.classList.remove('active');
        body.removeAttribute('data-lenis-prevent');
        body.style.removeProperty('overflow');
        html.style.removeProperty('overflow');
      } else {
        setScrollState(false);
        HEADER.dataset.hamburger = 'opened';
        this.classList.add('active');
        body.setAttribute('data-lenis-prevent', '');
        body.style.overflow = 'hidden';
        html.style.overflow = 'hidden';

        if (handler.isMobile()) {
          const currentUrl = window.location.pathname;
          const currentMenu = document.querySelector(`
            .depth2 > li > a[href="${currentUrl}"],
            .depth2 > li > a[href="${currentUrl.replace(/\/$/, '')}"],
            .depth3 a[href="${currentUrl}"],
            .depth3 a[href="${currentUrl.replace(/\/$/, '')}"]
          `);

          if (currentMenu) {
            // depth1 펼치기
            const depth1Link = currentMenu.closest('.depth1 > li')?.querySelector(':scope > a');
            if (depth1Link) {
              depth1Link.setAttribute('aria-expanded', 'true');
              const headerSubmenu = depth1Link.nextElementSibling;

              gsap.set(headerSubmenu, {
                visibility: 'hidden',
                position: 'absolute',
                display: 'block',
                maxHeight: 'none'
              });

              // 실제 전체 높이 가져오기
              const totalHeight = headerSubmenu.getBoundingClientRect().height;

              // 최종 높이 설정
              gsap.set(headerSubmenu, {
                position: '',
                display: '',
                maxHeight: totalHeight,
                visibility: 'visible',
                opacity: 1
              });
            }

            // depth2 펼치기
            const depth2Link = currentMenu.closest('.depth2 > li')?.querySelector(':scope > a');
            if (depth2Link) {
              depth2Link.setAttribute('aria-expanded', 'true');
              const depth3Menu = depth2Link.nextElementSibling;

              // 임시로 보이게 만들어서 정확한 높이 계산
              gsap.set(depth3Menu, {
                visibility: 'hidden',
                position: 'absolute',
                display: 'block',
                maxHeight: 'none'
              });

              const depth3Height = depth3Menu.getBoundingClientRect().height;

              // 원래 상태로 되돌리고 애니메이션 적용
              gsap.set(depth3Menu, {
                position: '',
                display: '',
                maxHeight: depth3Height,
                visibility: 'visible',
                opacity: 1
              });
            }
          }
        }
      }
    },
    resetMenu(){
        // this.closeMenu();

        this.depth1.forEach((element) => {
          element.removeAttribute('aria-expanded');
          if(element.nextElementSibling !== null){
            element.nextElementSibling.removeAttribute('style')
          }
        });

        // depth2 초기화 추가
        this.depth2Links.forEach((element) => {
          element.removeAttribute('aria-expanded');
          if(element.nextElementSibling !== null){
            element.nextElementSibling.removeAttribute('style')
          }
        });
    },
    isChangeDevice(){
        if(option.device !== this.currentDevice){
            this.currentDevice = handler.getDevice();
            return true;
        }
    },
    update(){
        if(this.isChangeDevice()){
            this.resetMenu();

            if(handler.isMobile()){
                this.makeBurger();
                handler.resetHeader();
            }else{
                this.removeBurger();
                handler.updateHeader();
            }
        }
    },
    accordion(el) {
      const nextElement = el.target.nextElementSibling;
      if (nextElement === null) {
        return;
      }
      el.preventDefault();

      // depth1인 경우
      if (nextElement.classList.contains('header-submenu')) {
        // 다른 모든 depth1 메뉴 닫기
        const allDepth1 = document.querySelectorAll('.depth1 > li > a');
        allDepth1.forEach(item => {
          if (item !== el.target && item.getAttribute('aria-expanded') === 'true') {
            item.setAttribute('aria-expanded', 'false');
            const submenu = item.nextElementSibling;
            gsap.to(submenu, {
              duration: 0.3,
              maxHeight: 0,
              onComplete: () => { submenu.removeAttribute('style') }
            });
          }
        });

        const submenuTitle = nextElement.querySelector('.header-submenu-title');
        const submenuList = nextElement.querySelector('.header-submenu-list');
        const totalHeight = (submenuTitle?.scrollHeight || 0) + (submenuList?.scrollHeight || 0);

        if (el.target.getAttribute('aria-expanded') === 'true') {
          el.target.setAttribute('aria-expanded', 'false');
          gsap.to(nextElement, {
            duration: 0.3,
            maxHeight: 0,
            onComplete: () => { nextElement.removeAttribute('style') }
          });
        } else {
          el.target.setAttribute('aria-expanded', 'true');
          gsap.to(nextElement, {
            duration: 0.3,
            maxHeight: totalHeight,
            opacity: 1,
            visibility: 'visible'
          });
        }
      }
      // depth2인 경우
      else if (nextElement.classList.contains('depth3')) {
        const headerSubmenu = el.target.closest('.header-submenu');

        // 같은 headerSubmenu 내의 다른 depth2 메뉴들 닫기
        const siblingDepth2s = headerSubmenu.querySelectorAll('.depth2 > li > a');
        siblingDepth2s.forEach(item => {
          if (item !== el.target && item.getAttribute('aria-expanded') === 'true') {
            item.setAttribute('aria-expanded', 'false');
            const submenu = item.nextElementSibling;
            gsap.to(submenu, {
              duration: 0.3,
              maxHeight: 0,
              onComplete: () => { submenu.removeAttribute('style') }
            });
          }
        });

        const depth3Height = nextElement.scrollHeight;
        if (!headerSubmenu.dataset.baseHeight) {
          headerSubmenu.dataset.baseHeight = headerSubmenu.scrollHeight;
        }
        const baseHeight = parseInt(headerSubmenu.dataset.baseHeight);

        if (el.target.getAttribute('aria-expanded') === 'true') {
          el.target.setAttribute('aria-expanded', 'false');
          gsap.to(nextElement, {
            duration: 0.3,
            maxHeight: 0,
            onComplete: () => { nextElement.removeAttribute('style') }
          });
          gsap.to(headerSubmenu, {
            duration: 0.3,
            maxHeight: baseHeight
          });
        } else {
          el.target.setAttribute('aria-expanded', 'true');
          gsap.to(nextElement, {
            duration: 0.3,
            maxHeight: depth3Height,
            opacity: 1,
            visibility: 'visible'
          });
          gsap.to(headerSubmenu, {
            duration: 0.3,
            maxHeight: baseHeight + depth3Height
          });
        }

        if(el.target.getAttribute('href') === 'javascript:' ||
           el.target.getAttribute('href') === '#') {
          el.preventDefault();
        }
        return;
      }
    }
}


function setScrollState(state){
    if(state){
        HTML.removeAttribute('data-scroll-y');
    }else{
        HTML.dataset.scrollY = '' + state + '';
    }
}

function toggleHeader(){
    if(window.scrollY > option.scrollY){
        if(window.scrollY < 10){
            gsap.to('.header', { y: 0 });
        }else{
            gsap.to('.header', { y: -170 });
        }
    }

    if(window.scrollY < option.scrollY){
        gsap.to('.header', { y: 0 });
    }

    option.scrollY = window.scrollY;
}

function stickyHeader() {
    const subHeader = document.querySelector('.header');
    if (subHeader) { // 요소가 존재하는지 확인
        if (window.scrollY > 230) {
            headerStickyState = true;
            subHeader.setAttribute('data-header-sticky', 'true');
        } else {
            headerStickyState = false;
            subHeader.setAttribute('data-header-sticky', 'false');
        }
    }
}

function depthHeader() {
  const accentColor = '#0458a9';
  let currentUrl = window.location.pathname;
  let currentMenu = document.querySelector(`.depth3 a[href="${currentUrl}"], .depth3 a[href="${currentUrl.replace(/\/$/, '')}"]`);
  if (!currentMenu) {
    currentMenu = document.querySelector(
      `a[href="${currentUrl}"],
       a[href="${currentUrl}/"],
       a[href="${currentUrl.replace(/\/$/, '')}"]`
    );
  }
  function changeColor(links, isHover) {
    links.forEach(link => {
      if (link) {
        if (isHover) {
          link.style.setProperty('color', accentColor);
        } else {
          link.style.removeProperty('color');
        }
      }
    });
  }
  // 현재 URL과 일치하는 메뉴에 active 클래스 추가
  if (currentMenu) {
    currentMenu.classList.add('active');

    // 3depth인 경우 (단일 항목 포함)
    if (currentMenu.closest('.depth3')) {
      // 상위 depth2 메뉴 찾기 (closest로 더 정확하게 찾기)
      const depth2Parent = currentMenu.closest('.depth2 > li');
      if (depth2Parent) {
        const depth2Link = depth2Parent.querySelector(':scope > a');
        if (depth2Link) depth2Link.classList.add('active');
      }

      // 상위 depth1 메뉴 찾기
      const depth1Link = currentMenu.closest('.depth1 > li')?.querySelector(':scope > a');
      if (depth1Link) depth1Link.classList.add('active');
    }
    // 2depth인 경우
    else if (currentMenu.closest('.depth2')) {
      const depth1Link = currentMenu.closest('.depth1 > li')?.querySelector(':scope > a');
      if (depth1Link) depth1Link.classList.add('active');
    }
  }

  // 기존 hover 이벤트 코드 유지
  if (!handler.isMobile()) {
    document.querySelectorAll('.depth1 > li > a').forEach(link => {
      link.addEventListener('mouseenter', () => {
        changeColor([link], true);
      });
      link.addEventListener('mouseleave', () => {
        changeColor([link], false);
      });
    });

    document.querySelectorAll('.depth2 > li > a').forEach(link => {
      link.addEventListener('mouseenter', () => {
        const depth1Link = link.closest('.depth1 > li').querySelector(':scope > a');
        changeColor([depth1Link, link], true);
      });
      link.addEventListener('mouseleave', () => {
        const depth1Link = link.closest('.depth1 > li').querySelector(':scope > a');
        changeColor([depth1Link, link], false);
      });
    });

    document.querySelectorAll('.depth3 a').forEach(link => {
      link.addEventListener('mouseenter', () => {
        const depth1Link = link.closest('.depth1 > li').querySelector(':scope > a');
        const depth2Link = link.closest('.depth3').parentElement.children[0];
        changeColor([depth1Link, depth2Link, link], true);
      });
      link.addEventListener('mouseleave', () => {
        const depth1Link = link.closest('.depth1 > li').querySelector(':scope > a');
        const depth2Link = link.closest('.depth3').parentElement.children[0];
        changeColor([depth1Link, depth2Link, link], false);
      });
    });
  }
}


function language(){
    const toggle = document.querySelector('.header-language .current');

    if(toggle === null){
        return;
    }

    toggle.addEventListener('click', (el) => {
        if(toggle.getAttribute('aria-pressed') === 'true'){
            toggle.setAttribute('aria-pressed', 'false');
        } else {
            toggle.setAttribute('aria-pressed', 'true');
        }
    });

    window.addEventListener('click', (e) => {
        if(e.target.parentNode === toggle){
            return;
        }
        if(e.target !== toggle){
            toggle.setAttribute('aria-pressed', 'false');
        }
    });
}

// 스크롤 TOP
function scrollBtn() {
	const scroll_btn = document.querySelector('.scroll-top');
  if (!scroll_btn) return;
	scroll_btn.addEventListener('click', () => {
		const target = 0;
		const duration = 200;
		const start = window.pageYOffset;
		const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

		const scrollAnimation = (currentTime) => {
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1);

			window.scrollTo(0, start + progress * (target - start));

			if (progress < 1) {
				window.requestAnimationFrame(scrollAnimation);
			}
		};

		window.requestAnimationFrame(scrollAnimation);
	});
}

function sublinkWrap() {
	const linkWrap = document.querySelector('.subvisual-sw');
  if(!linkWrap) return;
	const linkSlides = linkWrap.querySelectorAll('.swiper-slide');
	const sublinkWrap = new Swiper(linkWrap, {
		speed: 300,
		freeMode: true,
		slidesPerView: 'auto',
		slidesPerGroup: 1,
	});

	linkSlides.forEach((tab, i) => {
		if(tab.classList.contains('on')){
				if(i < 2){
						return;
				}
				sublinkWrap.slideTo(i, 0);
		}
	});
}

function searchToggle() {
  const searchOpenBtn = document.querySelector('.btn_search_open');
  const searchCloseBtn = document.querySelector('.btn_search_close');
  const searchWrap = document.querySelector('.search_wrap');

  if (!searchOpenBtn || !searchCloseBtn || !searchWrap) return;

  searchOpenBtn.addEventListener('click', () => {
    searchWrap.classList.add('on', 'active');
  });

  searchCloseBtn.addEventListener('click', () => {
    searchWrap.classList.remove('active');
    setTimeout(() => {
      searchWrap.classList.remove('on');
    }, 300);
  });
}

// function floating(){
//   const scrollPosition = window.pageYOffset;
//   const scrollTo = document.querySelector('.floating-container');
//   if(!scrollTo) return;
//   const footer = document.querySelector('footer');
//
//   // 브라우저 창의 하단이 footer에 닿았는지 확인
//   if (window.innerHeight >= footer.getBoundingClientRect().top) {
//     // footer에 닿았을 때 position을 'absolute'로 설정
//     scrollTo.style.position = 'absolute';
//   } else {
//     // 그 외의 경우에는 position을 'fixed'로 설정
//     scrollTo.style.position = 'fixed';
//   }
//
//   if (scrollPosition >= window.innerHeight / 2) {
//     scrollTo.classList.add('active');
//   } else {
//     scrollTo.classList.remove('active');
//   }
// }

function shouldDisableLenis() {
  return window.innerWidth <= 1024;
}

function subDropDown() {
  const contents = document.querySelectorAll('.sub-link-boxs');
  if (!contents) {
    return;
  }

  contents.forEach(content => {
    const btns = content.querySelectorAll('.drop');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
      });
    });
  });

  function subLinkActive() {
    let currentUrl = window.location.pathname;
    if (currentUrl.endsWith('/')) {
      currentUrl = currentUrl.slice(0, -1);
    }
    const subLinkMatch = document.querySelector('.sub-link-boxs .drop ul a[href="' + currentUrl + '"]');
    if (subLinkMatch) {
      document.querySelectorAll('.sub-link-boxs li.active').forEach(li => {
        li.classList.remove('active');
      });
      subLinkMatch.closest('li').classList.add('active');
    }
  }
  subLinkActive();
}

function removeActive() {
  document.addEventListener('click', (e) => {
    // 클릭된 요소가 drop 또는 site-wrap 내부가 아닐 때
    if (!e.target.closest('.drop') && !e.target.closest('.site-wrap')) {
      // 모든 active 클래스 제거
      const activeElements = document.querySelectorAll('.drop.active, .site-wrap.active');
      activeElements.forEach(el => el.classList.remove('active'));
    }
  });
}

function footerDropDown() {
  const content = document.querySelector('.site-wrap');
  content.addEventListener('click', ()=> {
    content.classList.toggle('active');
  })
}
