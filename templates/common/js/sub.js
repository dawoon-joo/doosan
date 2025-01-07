document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  animateText('.sec-visual .heading');
  // floating();
  initAccentAnimation();
  initTableScroll();
})
function animateText(selector) {
  const content = document.querySelector(selector);
  if(!content) { return;}

  // 텍스트 분할 로직
  const nodes = Array.from(content.childNodes);
  let newHtml = '';

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const chars = node.textContent.split('');
      newHtml += chars.map(char =>
        char === ' ' ?
          '<span>&nbsp;</span>' :
          `<span>${char}</span>`
      ).join('');
    } else if (node.nodeName === 'BR') {
      // 기존 br의 클래스 유지
      const className = node.className;
      newHtml += `<br${className ? ` class="${className}"` : ''}>`;
    }
  });

  content.innerHTML = newHtml;

  // 애니메이션 로직
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
    tl1.to(el, {
      duration: 0.4,
      autoAlpha: 1,
      transform: 'none',
      delay: 0.2 + index * 0.04,
      ease: "power1.outIn",
    }, 'text');
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
                <img src="/common/images/ico_touch_help.png" alt="">
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
