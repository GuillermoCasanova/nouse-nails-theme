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
    // Get all possible attributes from the element
    const attrs = {
      // Basic settings
      slidesPerView: this.getAttribute('slides-per-view'),
      mobileSlidesPerView: this.getAttribute('mobile-slides-per-view'),
      spaceBetween: this.getAttribute('space-between'),
      mobileSpaceBetween: this.getAttribute('mobile-space-between'),
      loop: this.getAttribute('loop'),
      mobileLoop: this.getAttribute('mobile-loop'),
      centeredSlides: this.getAttribute('centered-slides'),
      mobileCenteredSlides: this.getAttribute('mobile-centered-slides'),
      speed: this.getAttribute('speed'),
      effect: this.getAttribute('effect'),
      direction: this.getAttribute('direction'),
      mobileDirection: this.getAttribute('mobile-direction'),

      // Navigation
      showNavigation: this.getAttribute('show-navigation'),
      
      // Pagination
      pagination: this.getAttribute('pagination'),
      showPagination: this.getAttribute('show-pagination'),
      numberPagination: this.getAttribute('number-pagination'),
      
      // Advanced features
      grabCursor: this.getAttribute('grab-cursor'),
      allowTouchMove: this.getAttribute('allow-touch-move'),
      autoHeight: this.getAttribute('auto-height'),
      
      // Autoplay
      autoplay: this.getAttribute('autoplay'),
      mobileAutoplay: this.getAttribute('mobile-autoplay'),
      mobileAutoplayDelay: this.getAttribute('mobile-autoplay-delay'),
      mobileSpaceBetween: this.getAttribute('mobile-space-between'),
    };

    // Set up base configuration
    const config = {
      // Basic settings
      slidesPerView: attrs.mobileSlidesPerView || attrs.slidesPerView || 1,
      spaceBetween: parseInt(attrs.mobileSpaceBetween || attrs.spaceBetween || 20),
      loop: attrs.mobileLoop === 'true' || attrs.loop === 'true' || false,
      centeredSlides: attrs.mobileCenteredSlides === 'true' || attrs.centeredSlides === 'true' || false,
      speed: parseInt(attrs.speed || 400),
      effect: attrs.effect || 'slide',
      direction: attrs.mobileDirection || 'horizontal',

      // Navigation - Update to use our custom navigation classes
      navigation: attrs.showNavigation === 'true' ? {
        nextEl: '.swiper-slideshow__nav-button--next',
        prevEl: '.swiper-slideshow__nav-button--prev',
        lockClass: 'swiper-slideshow__nav-button--lock',
        disabledClass: 'swiper-slideshow__nav-button--disabled'
      } : false,

      // Pagination
      pagination: (attrs.pagination?.value === 'true' || attrs.showPagination?.value === 'true') ? {
        el: '.swiper-slideshow__pagination',
        clickable: true,
        type: attrs.numberPagination?.value === 'true' ? 'fraction' : 'bullets',
        renderBullet: attrs.numberPagination?.value === 'true' ? 
          (index, className) => `<span class="${className}">0${index + 1}</span>` : undefined
      } : false,

      // Advanced features
      grabCursor: attrs.grabCursor?.value !== 'false',
      allowTouchMove: attrs.allowTouchMove?.value !== 'false',
      autoHeight: attrs.autoHeight?.value === 'true',
      preloadImages: true,
      watchSlidesProgress: true,

      // Autoplay
      autoplay: (attrs.autoplay?.value === 'true' || attrs.mobileAutoplay?.value === 'true') ? {
        delay: parseInt(attrs.mobileAutoplayDelay?.value || 5000),
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
      breakpoints: attrs.breakpoints?.value ? this.convertToObject(attrs.breakpoints.value) : {
        768: {
          slidesPerView: attrs.slidesPerView || 'auto',
          spaceBetween: parseInt(attrs.spaceBetween || 20),
          centeredSlides: false,
          direction: attrs.direction || 'horizontal'
        }
      }
    };

    return config;
  }

  async waitForSwiper() {
    if (typeof Swiper !== 'undefined') return;

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
      return JSON.parse(stringObject.replace(/'/g, '"'));
    } catch (error) {
      console.error('Error parsing breakpoints:', error);
      return {};
    }
  }

  async initializeSwiper() {
    if (this.isInitialized) return;

    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    if (!sliderContainer) return;

    const disableOn = this.getAttribute('disableOn');
    if (disableOn && this.mediaQueries[disableOn]?.matches) {
      this.setupDesktopLayout();
      return;
    }

    // Create navigation if needed
    if (this.getAttribute('create-elements') === 'true' && 
        this.getAttribute('show-navigation') === 'true') {
      this.createNavigationElements(sliderContainer);
    }

    const config = this.getConfig();

    // Add observer to handle resize and update properly
    config.observer = true;
    config.observeParents = true;
    config.resizeObserver = true;
    config.updateOnWindowResize = true;

    // Handle thumbnails
    const thumbnailsAttr = this.getAttribute('thumbnails');
    if (thumbnailsAttr) {
      await this.setupControlledSwiper(config, thumbnailsAttr);
    } else {
      this.swiper = new Swiper(sliderContainer, config);
    }

    // Force update after a brief delay to ensure proper sizing
    setTimeout(() => {
      if (this.swiper) {
        this.swiper.update();
      }
    }, 100);

    this.setupEventListeners();
    this.isInitialized = true;
  }

  async setupControlledSwiper(config, thumbnailsSelector) {
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    
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

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (this.swiper) {
        this.swiper.update();
      }
    });

    resizeObserver.observe(this.swiper.el);

    this.swiper.on('slideChange', () => {
      this.dispatchEvent(new CustomEvent('swiper:slideChange', { 
        detail: { swiper: this.swiper } 
      }));
    });

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    const disableOn = this.getAttribute('disableOn');
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

  }

  createNavigationElements(container) {
    // Create navigation container
    const navigation = document.createElement('div');
    navigation.className = 'swiper-slideshow__navigation';
    
    // Create prev button
    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'swiper-slideshow__nav-button swiper-slideshow__nav-button--prev';
    prevButton.setAttribute('aria-label', 'Previous slide');
    prevButton.innerHTML = this.getChevronLeftIcon();
    
    // Create next button
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'swiper-slideshow__nav-button swiper-slideshow__nav-button--next';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.innerHTML = this.getChevronRightIcon();
    
    // Add buttons to navigation
    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);
    
    // Add navigation after the swiper-wrapper
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
    return ` ← `;
  }

  getChevronRightIcon() {
    return ` → `;
  }

  // Public methods
  getSwiper() {
    return this.swiper;
  }

  slideNext() {
    this.swiper?.slideNext();
  }

  slidePrev() {
    this.swiper?.slidePrev();
  }

  slideTo(index) {
    this.swiper?.slideTo(index);
  }

  startAutoplay() {
    this.swiper?.autoplay?.start();
  }

  stopAutoplay() {
    this.swiper?.autoplay?.stop();
  }

  destroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
    this.isInitialized = false;
  }

  refresh() {
    this.swiper?.update();
  }
}

if (!customElements.get('swiper-slideshow')) {
  customElements.define('swiper-slideshow', SwiperSlideshow);
}