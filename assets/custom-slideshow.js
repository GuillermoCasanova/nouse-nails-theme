class ImageSlideshow extends HTMLElement {
  constructor() {
    super();

    // Extract attributes and convert them into an object
    const {
      altArrows,
      autoplay,
      autoHeight,
      allowTouchMove,
      draggable,
      zoom,
      grabCursor,
      slidesPerView,
      thumbnails,
      a11y,
      freeMode,
      pagination,
      navigation,
      loop,
      disableOn,
      spaceBetween,
      centeredSlides,
      breakpoints,
      numberPagination,
      effect,
      controlContainer,
      fadeOnLargeUp,
      hoverArrowNav,
    } = this.attributes;

    this.mediaQueries = {
      mediumUp: window.matchMedia('(min-width: 700px)'),
      largeUp: window.matchMedia('(min-width: 940px)'),
    };

    if (disableOn) {
      this.setUpMediaQueries(disableOn.value);
      this.checkForMediaQueries = true;
    }

    this.options = {
      altArrows: (altArrows && altArrows.value == 'true') || false,
      enableZoom: (zoom && zoom.value == 'true') || false,
      autoplay:
        autoplay && autoplay.value === 'true'
          ? {
              enabled: true,
              delay: 0,
            }
          : false,
      autoHeight: (autoHeight && autoHeight.value == 'true') || false,
      pagination:
        pagination && pagination.value === 'true'
          ? {
              el: '.swiper-pagination',
              type: 'bullets',
            }
          : false,
      navigation:
        navigation && navigation.value == 'true'
          ? {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }
          : false,
      preloadImages: true,
      freeMode:
        freeMode && freeMode.value === 'true'
          ? {
              enabled: true,
              sticky: false,
            }
          : false,
      resistance: false,
      loop: (loop && loop.value == 'true') || false,
      speed: 200,
      draggable: (draggable && draggable.value == 'true') || false,
      effect: effect ? effect.value : 'slide',
      grabCursor: grabCursor ? grabCursor.value : true,
      spaceBetween: spaceBetween ? parseInt(spaceBetween.value) : 20,
      touchReleaseOnEdges: true,
      slidesPerView: slidesPerView ? slidesPerView.value : 1,
      centeredSlides: centeredSlides && centeredSlides.value === 'true',
      breakpoints: breakpoints ? convertToObject(breakpoints.value) : false,
      centeredSlidesBounds: centeredSlides && centeredSlides.value === 'true',
      controlContainer: controlContainer ? controlContainer.value : false,
      allowTouchMove:
        (allowTouchMove && allowTouchMove.value == 'true') || true,
      zoom: (zoom && zoom.value == 'true') || false,
      thumbnails: thumbnails ? thumbnails.value : false,
    };

    if (
      (fadeOnLargeUp && this.mediaQueries.mediumUp.matches) ||
      this.options.effect == 'fade'
    ) {
      this.options.effect = 'fade';
      this.options.fadeEffect = {
        crossFade: true,
      };
    }

    if (this.options.effect == 'coverflow') {
      this.options.coverflowEffect = {
        depth: 0,
        rotate: 0,
        slideShadows: false,
      };
    }

    if (numberPagination) {
      this.options.pagination = {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          return (
            '<span class="' + className + '">' + '0' + (index + 1) + '</span>'
          );
        },
      };
    }

    function convertToObject(pStringObject) {
      const inputString = pStringObject;
      const jsonString = inputString.replace(/'/g, '"'); // Replace single quotes with double quotes
      const result = JSON.parse(jsonString);
      return result;
    }

    this.init();
  }

  setUpMediaQueries(pDisableOn) {
    const mediaQueryList = this.mediaQueries[pDisableOn];
    this.disableOn = pDisableOn;

    mediaQueryList.addEventListener('change', event => {
      if (event.matches) {
        this.destroySwiper();
        this.resetOriginalHtml();
      } else {
        this.initSwiper();
      }
    });
  }

  init() {
    if (
      this.checkForMediaQueries &&
      this.mediaQueries[this.disableOn].matches
    ) {
      return;
    } else {
      this.initSwiper();
    }
  }

  resetOriginalHtml() {
    // Remove current children
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }

    this.originalChildren.forEach(child =>
      this.appendChild(child.cloneNode(true))
    );
  }

  setUpHtml(pOptions) {
    // Save the original HTML content of children elements
    this.originalChildren = Array.from(this.children).map(child =>
      child.cloneNode(true)
    );

    this.innerHTML = `
        <style>
  
          .marquee-timing  {
              -webkit-transition-timing-function:linear!important;
              -o-transition-timing-function:linear!important;
              transition-timing-function:linear!important;
          }
      
          .swiper-container {
            position: relative; 
          }
          .swiper-slide {
          }
  
          .swiper-content {
            }
        </style>
        <div class="swiper swiper-container">
          <div class="swiper-wrapper ${pOptions.autoplay ? 'marquee-timing' : ''}">
            ${Array.from(this.children)
              .map(
                child => `<div class="swiper-slide">${child.outerHTML}</div>`
              )
              .join('')}
          </div>
          ${
            pOptions.navigation
              ? `
          <div class="swiper-button-prev">
            ${pOptions.altArrows ? `<svg><use href="#arrow-right-long" /></svg>` : `<svg viewBox="0 0 10.8 20.9"><path fill="currentColor" d="M10.4,20.9c-.1,0-.2,0-.3-.1L.1,10.8c-.2-.2-.2-.4,0-.6L10.1.1c.2-.2.4-.2.6,0,.2.2.2.4,0,.6L1,10.5l9.7,9.7c.2.2.2.4,0,.6,0,0-.2.1-.3.1Z"/></svg>`}
          </div>
          <div class="swiper-button-next">
            ${pOptions.altArrows ? `<svg><use href="#arrow-left-long" /></svg>` : `<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 10.8 20.9"><path fill="currentColor" d="M.4,0C.5,0,.6,0,.7.1l10,10c.2.2.2.4,0,.6L.7,20.8c-.2.2-.4.2-.6,0-.2-.2-.2-.4,0-.6l9.7-9.7L.1.7c-.2-.2-.2-.4,0-.6C.2,0,.3,0,.4,0Z"/></svg>`}
          </div>`
              : ''
          }
          ${pOptions.pagination ? `<div class="swiper-pagination"></div>` : ''}
        </div>
      `;
  }

  destroySwiper() {
    if (this.swiper) {
      this.innerHTML = this.originalChildren;
      this.swiper.detachEvents();
      this.swiper.destroy(true, true);
      this.swiper = null;
      this.swiper = null;
    }
  }

  initSwiper() {
    if (this.swiper) {
      return Promise.resolve(this.swiper); // Already initialized, resolve with the existing instance
    }

    return new Promise((resolve, reject) => {
      if (
        this.attributes.preventLoad &&
        this.attributes.preventLoad.value === 'true'
      ) {
        resolve(); // Resolve the promise if loading is prevented
        return;
      }

      // Wait for Swiper to be available
      const waitForSwiper = () => {
        if (typeof Swiper !== 'undefined') {
          return Promise.resolve(Swiper);
        }
        return new Promise(resolve => {
          setTimeout(() => resolve(waitForSwiper()), 100);
        });
      };

      waitForSwiper()
        .then(() => {
          if (this.options.thumbnails) {
            setTimeout(() => {
              this.setUpHtml(this.options);
              const controlElement = document.querySelector(
                '[' + this.options.thumbnails + ']'
              );
              this.options.thumbs = {
                swiper: controlElement.getSwiper(),
              };
              this.swiper = new Swiper(
                this.querySelector('.swiper-container'),
                this.options
              );
              if (
                typeof enableZoomOnHover !== 'undefined' &&
                this.options.zoom == true
              ) {
                enableZoomOnHover(2);
              }
              resolve(this.swiper); // Resolve the promise with the swiper instance
            }, 150);
          } else {
            this.setUpHtml(this.options);
            this.swiper = new Swiper(
              this.querySelector('.swiper-container'),
              this.options
            );
            if (
              typeof enableZoomOnHover !== 'undefined' &&
              this.options.zoom == true
            ) {
              enableZoomOnHover(2);
            }
            resolve(this.swiper); // Resolve the promise with the swiper instance
          }

          const event = new CustomEvent('swiperLoaded', {
            detail: { swiper: this.swiper },
          });
          this.dispatchEvent(event);
        })
        .catch(error => {
          reject(error); // Reject the promise if there was an error during import or initialization
        });
    });
  }

  initHoverArrowNav() {
    function setCursorToSVG(pTargetElement, svgCode) {
      if (pTargetElement) {
        pTargetElement.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(svgCode)}"), auto`;
      } else {
        console.error(`Element with ID '${elementId}' not found.`);
      }
    }

    //const prevCursorSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" fill="none"><path fill="black" d="M6.7,14.4c0.4,0.4,1,0.4,1.4,0c0.4-0.4,0.4-1,0-1.4L2.4,7.4l5.7-5.7c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L0.3,6.7 c-0.4,0.4-0.4,1,0,1.4L6.7,14.4z M111,6.4L1,6.4v2l110,0V6.4z"/></svg>`;
    let prevCursorSVG = `<svg viewBox="0 0 10.8 20.9"><path fill="currentColor" d="M10.4,20.9c-.1,0-.2,0-.3-.1L.1,10.8c-.2-.2-.2-.4,0-.6L10.1.1c.2-.2.4-.2.6,0,.2.2.2.4,0,.6L1,10.5l9.7,9.7c.2.2.2.4,0,.6,0,0-.2.1-.3.1Z"/></svg>`;
    let nextCursorSVG = `<svg viewBox="0 0 10.8 20.9"><path fill="currentColor" d="M10.4,20.9c-.1,0-.2,0-.3-.1L.1,10.8c-.2-.2-.2-.4,0-.6L10.1.1c.2-.2.4-.2.6,0,.2.2.2.4,0,.6L1,10.5l9.7,9.7c.2.2.2.4,0,.6,0,0-.2.1-.3.1Z"/></svg>`;

    // Add event listener to the target element
    const prevTargetElement = this.querySelector('.swiper-button-prev');
    const nextTargetElement = this.querySelector('.swiper-button-next');

    if (prevTargetElement) {
      prevTargetElement.addEventListener('mouseenter', () => {
        setCursorToSVG(prevTargetElement, prevCursorSVG);
      });

      prevTargetElement.addEventListener('mouseleave', () => {
        prevTargetElement.style.cursor = 'auto';
      });
    } else {
      console.error('Target element not found.');
    }

    if (nextTargetElement) {
      nextTargetElement.addEventListener('mouseenter', () => {
        setCursorToSVG(nextTargetElement, nextCursorSVG);
      });

      nextTargetElement.addEventListener('mouseleave', () => {
        nextTargetElement.style.cursor = 'auto';
      });
    }
  }

  getSwiper() {
    return this.swiper;
  }
}

if (!customElements.get('custom-slideshow')) {
  customElements.define('custom-slideshow', ImageSlideshow);
}

class LwdSlideshow extends ImageSlideshow {
  constructor() {
    super();
    this.addEventListener('swiperLoaded', this.initEventListeners.bind(this));
  }

  initEventListeners() {
    this.getSwiper().on('slideChangeTransitionEnd', () => {
      let activeId = this.querySelector('.swiper-slide-active').querySelector(
        '[data-dress-combo-option]'
      ).dataset.id;
      this.changeActiveIds(activeId);
    });

    if (this.getSwiper().initialized) {
      this.addSvgToSwiperButtons();
    }
  }

  changeActiveIds(pActiveId) {
    console.log('changeActiveIds', pActiveId);
    const selects = document
      .querySelector('lwd-builder')
      .querySelectorAll('select');
    const id = pActiveId;
    const lwdBuilder = document.querySelector('lwd-builder');

    selects.forEach(select => {
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        if (option.value === id) {
          select.value = id;
          lwdBuilder.setActiveCombo();
        }
      });
    });
  }

  // Function to add SVG code to Swiper buttons
  addSvgToSwiperButtons() {
    console.log('addSvgToSwiperButtons');
    var svgCode = '<svg>  <use href="#arrow-right" /> </svg>';

    var nextButton = this.querySelector('.swiper-button-next');
    var prevButton = this.querySelector('.swiper-button-prev');

    if (nextButton && prevButton) {
      nextButton.innerHTML = svgCode;
      prevButton.innerHTML = svgCode;
    }
  }
}

customElements.define('lwd-slideshow', LwdSlideshow);
