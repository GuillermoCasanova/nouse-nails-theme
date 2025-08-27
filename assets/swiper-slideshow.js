/**
 * Swiper Slideshow Custom Element
 * A reusable component that automatically initializes Swiper with responsive behavior
 */
class SwiperSlideshow extends HTMLElement {
  constructor() {
    super();
    this.swiper = null;
    this.isInitialized = false;
    this.mediaQueries = {
      mediumUp: window.matchMedia('(min-width: 768px)'),
      largeUp: window.matchMedia('(min-width: 1024px)')
    };
  }

  connectedCallback() {
    if (this.isInitialized) return;
    
    // Wait for Swiper to be available
    this.waitForSwiper().then(() => {
      this.initializeSwiper();
    });
  }

  disconnectedCallback() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
    this.isInitialized = false;
  }

  getConfig() {
    // Extract all possible attributes
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
      fadeOnLargeUp,
      hoverArrowNav,
      direction,
      // Mobile specific attributes
      mobileSlidesPerView,
      mobileSpaceBetween,
      mobileCenteredSlides,
      mobileLoop,
      mobileAutoplay,
      mobileAutoplayDelay,
      desktopBreakpoint,
      mobileDirection,
      showNavigation,
      showPagination,
      speed,
      createElements
    } = this.attributes;

    // Set up base configuration
    const config = {
      // Basic settings
      slidesPerView: slidesPerView?.value || mobileSlidesPerView?.value || 1,
      spaceBetween: parseInt(spaceBetween?.value || mobileSpaceBetween?.value || 20),
      loop: (loop?.value === 'true' || mobileLoop?.value === 'true') || false,
      centeredSlides: (centeredSlides?.value === 'true' || mobileCenteredSlides?.value === 'true') || false,
      speed: parseInt(speed?.value || 400),
      effect: effect?.value || 'slide',
      direction:  mobileDirection?.value || 'horizontal',
      // Navigation
      navigation: (navigation?.value === 'true' || showNavigation?.value !== 'false') ? {
        nextEl: '.swiper-slideshow__nav-button--next',
        prevEl: '.swiper-slideshow__nav-button--prev',
      } : false,

      // Pagination
      pagination: (pagination?.value === 'true' || showPagination?.value === 'true') ? {
        el: '.swiper-slideshow__pagination',
        clickable: true,
        type: numberPagination?.value === 'true' ? 'fraction' : 'bullets',
        renderBullet: numberPagination?.value === 'true' ? 
          (index, className) => `<span class="${className}">0${index + 1}</span>` : undefined
      } : false,

      // Advanced features
      grabCursor: grabCursor?.value !== 'false',
      allowTouchMove: allowTouchMove?.value !== 'false',
      autoHeight: autoHeight?.value === 'true',
      preloadImages: true,
      watchSlidesProgress: true,

      // Zoom
      zoom: zoom?.value === 'true' ? {
        maxRatio: 3,
        minRatio: 1
      } : false,

      // Free mode
      freeMode: freeMode?.value === 'true' ? {
        enabled: true,
        sticky: false
      } : false,

      // Autoplay
      autoplay: (autoplay?.value === 'true' || mobileAutoplay?.value === 'true') ? {
        delay: parseInt(mobileAutoplayDelay?.value || 5000),
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      } : false,

      // Accessibility
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
        firstSlideMessage: 'This is the first slide',
        lastSlideMessage: 'This is the last slide',
      },

      // Breakpoints for responsive design
      breakpoints: breakpoints?.value ? this.convertToObject(breakpoints.value) : {
        768: {
          slidesPerView: 'auto',
          spaceBetween: parseInt(spaceBetween?.value || 20),
          centeredSlides: false,
          direction: direction?.value || 'horizontal'
        }
      }
    };

    // Add fade effect if specified
    if (fadeOnLargeUp?.value === 'true' && this.mediaQueries.mediumUp.matches || config.effect === 'fade') {
      config.effect = 'fade';
      config.fadeEffect = {
        crossFade: true
      };
    }

    // Add coverflow effect settings if specified
    if (config.effect === 'coverflow') {
      config.coverflowEffect = {
        depth: 0,
        rotate: 0,
        slideShadows: false
      };
    }

    return config;
  }

  async waitForSwiper() {
    if (typeof Swiper !== 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const checkSwiper = () => {
        if (typeof Swiper !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkSwiper, 50);
        }
      };
      checkSwiper();
    });
  }

  convertToObject(stringObject) {
    try {
      const jsonString = stringObject.replace(/'/g, '"');
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing breakpoints:', error);
      return {};
    }
  }

  async initializeSwiper() {
    if (this.isInitialized) return;

    // Get the slider container
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    if (!sliderContainer) return;

    // Check if we should disable on certain breakpoints
    const disableOn = this.attributes.disableOn?.value;
    if (disableOn && this.mediaQueries[disableOn]?.matches) {
      this.setupDesktopLayout();
      return;
    }

    // Create navigation and pagination elements if requested
    if (this.attributes.createElements?.value === 'true') {
      this.createNavigationElements(sliderContainer);
      if (this.attributes.showPagination?.value === 'true') {
        this.createPaginationElement(sliderContainer);
      }
    }

    // Initialize Swiper
    const config = this.getConfig();

    // Handle thumbnails
    const { thumbnails } = this.attributes;
    if (thumbnails) {
      await this.setupControlledSwiper(config, thumbnails.value);
    } else {
      this.swiper = new Swiper(sliderContainer, config);
    }

    // Set up event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    
    // Dispatch initialization event
    this.dispatchEvent(new CustomEvent('swiper:init', { 
      detail: { swiper: this.swiper } 
    }));
  }

  async setupControlledSwiper(config, thumbnailsSelector) {
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    
    console.log(sliderContainer)
    // If this is a thumbnail slider, initialize with thumbnail settings
    if (thumbnailsSelector) {
      // Wait for the thumbnail slider to be ready
      const thumbnailElement = document.querySelector(`[${thumbnailsSelector}]`);
      if (thumbnailElement) {
        const thumbnailSwiper = await this.waitForSwiperInstance(thumbnailElement);
        if (thumbnailSwiper) {
          config.thumbs = {
            swiper: thumbnailSwiper,
            multipleActiveThumbs: false
          };
        }
      }
      this.swiper = new Swiper(sliderContainer, config);
    } else {
      // Initialize as a thumbnail slider
      this.swiper = new Swiper(sliderContainer, {
        ...config,
        watchSlidesProgress: true,
        slideToClickedSlide: true
      });
    }
  }

  async waitForSwiperInstance(element) {
    if (!element) return null;

    // Try to get the swiper instance immediately
    let swiper = element.swiper || element.getSwiper?.();
    if (swiper) return swiper;

    // Wait for the swiper to be initialized
    return new Promise((resolve) => {
      const checkSwiper = () => {
        swiper = element.swiper || element.getSwiper?.();
        if (swiper) {
          resolve(swiper);
        } else {
          setTimeout(checkSwiper, 50);
        }
      };
      checkSwiper();
    });
  }

  setupEventListeners() {
    if (!this.swiper) return;

    // Handle slide changes
    this.swiper.on('slideChange', () => {
      this.dispatchEvent(new CustomEvent('swiper:slideChange', { 
        detail: { swiper: this.swiper } 
      }));
    });

    // Handle resize events
    window.addEventListener('resize', this.handleResize.bind(this));

    // Handle hover navigation if enabled
    if (this.attributes.hoverArrowNav?.value === 'true') {
      this.initHoverArrowNav();
    }
  }

  setupDesktopLayout() {
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    if (!sliderContainer) return;

    sliderContainer.classList.remove('swiper');
    const wrapper = sliderContainer.querySelector('.swiper-wrapper');
    if (wrapper) {
      wrapper.classList.remove('swiper-wrapper');
      const slides = wrapper.querySelectorAll('.swiper-slide');
      slides.forEach(slide => {
        slide.classList.remove('swiper-slide');
        sliderContainer.appendChild(slide);
      });
      wrapper.remove();
    }

    // Hide navigation and pagination
    const nav = this.querySelector('.swiper-slideshow__navigation');
    const pagination = this.querySelector('.swiper-slideshow__pagination');
    if (nav) nav.style.display = 'none';
    if (pagination) pagination.style.display = 'none';
  }

  handleResize() {
    const disableOn = this.attributes.disableOn?.value;
    if (disableOn) {
      if (this.mediaQueries[disableOn].matches) {
        if (this.swiper) {
          this.swiper.destroy(true, true);
          this.swiper = null;
        }
        this.setupDesktopLayout();
      } else if (!this.swiper) {
        this.initializeSwiper();
      }
    }
  }

  initHoverArrowNav() {
    const prevButton = this.querySelector('.swiper-slideshow__nav-button--prev');
    const nextButton = this.querySelector('.swiper-slideshow__nav-button--next');

    const setCursorToSVG = (element, svgCode) => {
      if (element) {
        element.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(svgCode)}"), auto`;
      }
    };

    const prevSVG = `<svg viewBox="0 0 10.8 20.9"><path fill="currentColor" d="M10.4,20.9c-.1,0-.2,0-.3-.1L.1,10.8c-.2-.2-.2-.4,0-.6L10.1.1c.2-.2.4-.2.6,0,.2.2.2.4,0,.6L1,10.5l9.7,9.7c.2.2.2.4,0,.6,0,0-.2.1-.3.1Z"/></svg>`;
    const nextSVG = `<svg viewBox="0 0 10.8 20.9"><path fill="currentColor" d="M.4,0C.5,0,.6,0,.7.1l10,10c.2.2.2.4,0,.6L.7,20.8c-.2.2-.4.2-.6,0-.2-.2-.2-.4,0-.6l9.7-9.7L.1.7c-.2-.2-.2-.4,0-.6C.2,0,.3,0,.4,0Z"/></svg>`;

    if (prevButton) {
      prevButton.addEventListener('mouseenter', () => setCursorToSVG(prevButton, prevSVG));
      prevButton.addEventListener('mouseleave', () => prevButton.style.cursor = 'auto');
    }

    if (nextButton) {
      nextButton.addEventListener('mouseenter', () => setCursorToSVG(nextButton, nextSVG));
      nextButton.addEventListener('mouseleave', () => nextButton.style.cursor = 'auto');
    }
  }

  createNavigationElements(container) {
    const navigation = document.createElement('div');
    navigation.className = 'swiper-slideshow__navigation';
    
    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'swiper-slideshow__nav-button swiper-slideshow__nav-button--prev';
    prevButton.setAttribute('aria-label', 'Previous slide');
    prevButton.innerHTML = this.getChevronLeftIcon();
    
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'swiper-slideshow__nav-button swiper-slideshow__nav-button--next';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.innerHTML = this.getChevronRightIcon();
    
    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);
    
    const wrapper = container.querySelector('.swiper-wrapper');
    if (wrapper) {
      wrapper.parentNode.insertBefore(navigation, wrapper.nextSibling);
    }
  }

  createPaginationElement(container) {
    const pagination = document.createElement('div');
    pagination.className = 'swiper-slideshow__pagination';
    
    const navigation = container.querySelector('.swiper-slideshow__navigation');
    if (navigation) {
      navigation.parentNode.insertBefore(pagination, navigation.nextSibling);
    } else {
      const wrapper = container.querySelector('.swiper-wrapper');
      if (wrapper) {
        wrapper.parentNode.insertBefore(pagination, wrapper.nextSibling);
      }
    }
  }

  getChevronLeftIcon() {
    return `<svg viewBox="0 0 10.8 20.9"><path fill="currentColor" d="M10.4,20.9c-.1,0-.2,0-.3-.1L.1,10.8c-.2-.2-.2-.4,0-.6L10.1.1c.2-.2.4-.2.6,0,.2.2.2.4,0,.6L1,10.5l9.7,9.7c.2.2.2.4,0,.6,0,0-.2.1-.3.1Z"/></svg>`;
  }

  getChevronRightIcon() {
    return `<svg viewBox="0 0 10.8 20.9"><path fill="currentColor" d="M.4,0C.5,0,.6,0,.7.1l10,10c.2.2.2.4,0,.6L.7,20.8c-.2.2-.4.2-.6,0-.2-.2-.2-.4,0-.6l9.7-9.7L.1.7c-.2-.2-.2-.4,0-.6C.2,0,.3,0,.4,0Z"/></svg>`;
  }

  // Public methods for external control
  getSwiper() {
    return this.swiper;
  }

  slideNext() {
    if (this.swiper) {
      this.swiper.slideNext();
    }
  }

  slidePrev() {
    if (this.swiper) {
      this.swiper.slidePrev();
    }
  }

  slideTo(index) {
    if (this.swiper) {
      this.swiper.slideTo(index);
    }
  }

  startAutoplay() {
    if (this.swiper?.autoplay) {
      this.swiper.autoplay.start();
    }
  }

  stopAutoplay() {
    if (this.swiper?.autoplay) {
      this.swiper.autoplay.stop();
    }
  }

  destroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
    this.isInitialized = false;
  }

  refresh() {
    if (this.swiper) {
      this.swiper.update();
    }
  }
}

// Register the custom element
if (!customElements.get('swiper-slideshow')) {
  customElements.define('swiper-slideshow', SwiperSlideshow);
}