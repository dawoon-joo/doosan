document.addEventListener('DOMContentLoaded', ()=> {
  productSw();
})

function productSw() {
  const content = document.querySelector('.product-sw2');
  if(!content) { return;}
  const slides = document.querySelectorAll('.product-sw2 .swiper-slide');
  const nextButton = document.querySelector('.button-next');
  const prevButton = document.querySelector('.button-prev');
  if (slides.length <= 4) {
    nextButton.style.opacity = '0';
    nextButton.style.opacity = '0';
    prevButton.style.visibility = 'hidden';
    prevButton.style.visibility = 'hidden';
  }
  var swiper2 = new Swiper(".product-sw2", {
    spaceBetween: 10,
    allowTouchMove: false,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
    navigation: {
      nextEl: ".button-next",
      prevEl: ".button-prev",
    },
  });
  var swiper1 = new Swiper(".product-sw", {
    allowTouchMove: false,
    spaceBetween: 10,
    thumbs: {
      swiper: swiper2,
    },
  });
}
