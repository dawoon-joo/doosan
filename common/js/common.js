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
    mobileWidth: 1024,
    ticking: false,
    timeline: [],
}
// lenis = new Lenis({
//   duration: 1.2,
//   infinite: false,
//   easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
//   gestureOrientation: "vertical",
//   normalizeWheel: false,
//   smoothTouch: true
// });
// function raf(time) {
//   lenis.raf(time);
//   requestAnimationFrame(raf);
// }
// requestAnimationFrame(raf);
document.addEventListener("DOMContentLoaded", function() {
  var isLocal = window.location.hostname === 'dawoon-joo.github.io/doosan/' || window.location.hostname === '192.168.0.7';
  var headerUrl = isLocal ? '../../inc/header.html' : '/doosan/inc/header.html';
  loadContent('header', headerUrl, function() {
    observeElement('header', function() {
      common.init();
      common.windowScroll();
      common.windowResize();
      common.header();
      common.sub();
      // hamburger();
    });
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
        // if(handler.isMobile()){
        //     lenis.stop();
        // }
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
            floating();
        });

        function scrollAnimate(){
            stickyHeader();
            toggleHeader();
        }
    },
    windowResize: () => {
        window.addEventListener('resize', () => {
            handler.updateDevice();
        });
    },
    header: () => {
        handler.updateHeader();

        stickyHeader();
        toggleHeader();
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
                gsap.to(submenu, { duration: 0.5, opacity: 1, visibility: 'visible' });
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
                gsap.to(submenu, { duration: 0.5, opacity: 0, visibility: 'hidden' });
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
            gsap.to('.wrap .header', { y: 0 });
        }else{
            gsap.to('.wrap .header', { y: -170 });
        }
    }

    if(window.scrollY < option.scrollY){
        gsap.to('.wrap .header', { y: 0 });
    }

    option.scrollY = window.scrollY;
}

function stickyHeader() {
    const subHeader = document.querySelector('.wrap .header');
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


function hamburger() {
  const hdMenu = document.querySelector('.hamburger');
  const closeButton = document.querySelector('header .close');
  const body = document.documentElement;
  const introElement = document.querySelector('.intro');

  hdMenu.addEventListener('click', function() {
    gsap.to('.gnb', {
      duration: 0.5,
      right: '0',
      ease: 'power1.out',
      onStart: function() {
        body.classList.add('no-scroll');
        lenis.stop();
        if (introElement) {
          introElement.classList.add('hide');
        }
      }
    });
  });

  closeButton.addEventListener('click', function() {
    gsap.to('.gnb', {
      duration: 0.5,
      right: '-100%',
      ease: 'power1.out',
      onComplete: function() {
        body.classList.remove('no-scroll');
        lenis.start();
      },
      onStart: function() {
        if (introElement) {
          introElement.classList.remove('hide');
        }
      }
    });
  });
}

function floating(){
  const scrollPosition = window.pageYOffset;
  const scrollTo = document.querySelector('.floating-container');
  if(!scrollTo) return;
  const footer = document.querySelector('footer');

  // 브라우저 창의 하단이 footer에 닿았는지 확인
  if (window.innerHeight >= footer.getBoundingClientRect().top) {
    // footer에 닿았을 때 position을 'absolute'로 설정
    scrollTo.style.position = 'absolute';
  } else {
    // 그 외의 경우에는 position을 'fixed'로 설정
    scrollTo.style.position = 'fixed';
  }

  if (scrollPosition >= window.innerHeight / 2) {
    scrollTo.classList.add('active');
  } else {
    scrollTo.classList.remove('active');
  }
}
