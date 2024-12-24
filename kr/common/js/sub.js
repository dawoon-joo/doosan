document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  animateText('.sec-visual .heading');
  floating();
  initAccentAnimation();
  initTableScroll();
})
function animateText(selector) {
  const content = document.querySelector(selector);
  if(!content) { return;}
  const text = content.textContent;
  content.innerHTML = '';
  text.split('').forEach(char => {
    const span = document.createElement('span');
    if (char === ' ') {
      span.innerHTML = '&nbsp;';
    } else {
      span.textContent = char;
    }
    content.appendChild(span);
  });
  const elements = document.querySelectorAll(`${selector} span`);
  document.body.style.overflow = 'hidden';
  lenis.stop();
  const tl1 = gsap.timeline({
    onComplete: () => {
      setTimeout(() => {
        const secVisual = document.querySelector('.sec-visual');
        const secVisualHeight = secVisual.offsetHeight;

        setTimeout(() => {
          window.scrollTo({
            top: secVisualHeight,
            behavior: 'smooth'
          });
          lenis.start();
          document.body.style.overflow = 'auto';
        }, 500);

      }, 500);
    }
  });
  elements.forEach((el, index) => {
    const delay = 0.2 + Math.pow(index, 0.7) * 0.07;
    tl1.to(el, {
      duration: 0.4,
      autoAlpha: 1,
      transform: 'none',
      delay: 0.2 + index * 0.04,
      // delay: delay,
      ease: "power1.outIn",
    }, 'text');
  });
}
function floating() {
  const scrollTo = document.querySelector('.sec-selector .content-top');
  if (!scrollTo) return;

  gsap.to(scrollTo, {
    scrollTrigger: {
      trigger: '.sec-selector',
      start: 'top top',
      // markers: true,
      onEnter: () => {
        scrollTo.style.position = 'fixed';
        scrollTo.classList.add('active');
      },
      onLeaveBack: () => {
        scrollTo.style.position = 'relative';
        scrollTo.classList.remove('active');
      }
    }
  });
}
const initAccentAnimation = () => {
  const accentTexts = document.querySelectorAll('.accent-color');

  accentTexts.forEach(accentText => {
    const chars = accentText.textContent.split('');
    accentText.innerHTML = chars.map(char =>
      char === ' ' ? ' ' : `<span class="char">${char}</span>`
    ).join('');

    const charElements = accentText.querySelectorAll('.char');
    const totalDuration = chars.length >= 10 ? 0.7 : 0.5;


    const rect = accentText.getBoundingClientRect();
    const isAboveViewport = rect.top < window.innerHeight;

    if (isAboveViewport) {
      // viewport 높이보다 위에 있는 요소는 즉시 애니메이션 실행
      gsap.to(charElements, {
        color: '#0458a9',
        duration: totalDuration,
        stagger: {
          amount: totalDuration,
          from: 0,
          ease: "none"
        },
        delay: 0.5,
        ease: 'power1.inOut'
      });
    } else {
      // viewport 높이보다 아래에 있는 요소는 스크롤 트리거로 실행
      ScrollTrigger.create({
        trigger: accentText,
        start: 'top center',
        // markers: true,
        onEnter: () => {
          gsap.to(charElements, {
            color: '#0458a9',
            duration: totalDuration,
            stagger: {
              amount: totalDuration,
              from: 0,
              ease: "none"
            },
            ease: 'power1.inOut'
          });
        }
      });
    }
  });
};
function initTableScroll() {
  const tables = document.querySelectorAll('table');
  if (!tables.length) return;

  tables.forEach(table => {
    // 스크롤 이벤트 핸들러 함수
    function handleScroll() {
      const drapwrap = table.nextElementSibling;
      if (drapwrap?.classList.contains('drapwrap')) {
        gsap.to(drapwrap, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => drapwrap.remove()
        });
      }
    }

    function checkTableScroll() {
      const parent = table.parentElement;
      const isScrollable = parent.scrollWidth > parent.clientWidth;
      const drapwrap = table.nextElementSibling;

      if (isScrollable && !drapwrap?.classList.contains('drapwrap')) {
        table.insertAdjacentHTML('afterend', `
          <div class="drapwrap">
            <div class="drag v2">
              <div class="ico_touch">
                <img src="/kr/common/images/ico_touch_help.png" alt="">
              </div>
            </div>
          </div>
        `);
        // drapwrap 생성될 때마다 스크롤 이벤트 새로 등록
        table.parentElement.addEventListener('scroll', handleScroll, { once: true });
      } else if (!isScrollable && drapwrap?.classList.contains('drapwrap')) {
        drapwrap.remove();
      }
    }

    checkTableScroll();
    window.addEventListener('resize', checkTableScroll);
  });
}
