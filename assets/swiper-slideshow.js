/**
 * Swiper Slideshow Custom Element
 * A reusable component that automatically initializes Swiper with responsive behavior
 * On mobile: slideshow with configurable slides per view
 * On desktop: grid layout (disabled swiper)
 */
class SwiperSlideshow extends HTMLElement {
  constructor() {
    super();
    this.swiper = null;
    this.isInitialized = false;
    this.config = this.getConfig();
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
    return {
      mobileSlidesPerView: this.getAttribute('mobile-slides-per-view') || 1.25,
      mobileSpaceBetween: parseInt(this.getAttribute('mobile-space-between')) || 20,
      mobileCenteredSlides: false,
      mobileLoop: this.getAttribute('mobile-loop') !== 'false',
      mobileAutoplay: this.getAttribute('mobile-autoplay') === 'true',
      mobileAutoplayDelay: parseInt(this.getAttribute('mobile-autoplay-delay')) || 5000,
      desktopBreakpoint: parseInt(this.getAttribute('desktop-breakpoint')) || 768,
      showNavigation: this.getAttribute('show-navigation') !== 'false',
      showPagination: this.getAttribute('show-pagination') === 'true',
      effect: this.getAttribute('effect') || 'slide',
      speed: parseInt(this.getAttribute('speed')) || 600,
      createElements: this.getAttribute('create-elements') === 'true' || false
    };
  }

  async waitForSwiper() {
    // Wait for Swiper to be available globally
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

  initializeSwiper() {
    if (this.isInitialized) return;

    // Get the slider container
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    if (!sliderContainer) return;

    // Check if we should initialize swiper (mobile only)
    if (window.innerWidth >= this.config.desktopBreakpoint) {
      this.setupDesktopLayout();
      return;
    }

    // Create navigation and pagination elements if requested
    if (this.config.createElements) {
      this.createNavigationElements(sliderContainer);
      if (this.config.showPagination) {
        this.createPaginationElement(sliderContainer);
      }
    }

    // Initialize Swiper for mobile
    this.swiper = new Swiper(sliderContainer, {
      // Basic settings
      slidesPerView: this.config.mobileSlidesPerView,
      spaceBetween: this.config.mobileSpaceBetween,
      loop: this.config.mobileLoop,
      centeredSlides: false,
      freeMode: false,
      autoplay: this.config.mobileAutoplay ? {
        delay: this.config.mobileAutoplayDelay,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      } : false,
      slidesPerGroup: 1,
      grabCursor: true,
      simulateTouch: true,
      preventClicks: true,
      preventClicksPropagation: true,
      
      // Responsive breakpoints
      breakpoints: {
        [this.config.desktopBreakpoint]: {
          slidesPerView: 'auto',
          centeredSlides: false,
          spaceBetween: 0,
          allowTouchMove: false,
          loop: false  // Disable loop on desktop
        }
      },

      // Navigation
      navigation: this.config.showNavigation ? {
        nextEl: '.swiper-slideshow__nav-button--next',
        prevEl: '.swiper-slideshow__nav-button--prev',
      } : false,

      // Pagination
      pagination: this.config.showPagination ? {
        el: '.swiper-slideshow__pagination',
        clickable: true,
        type: 'bullets'
      } : false,

      // Effects
      effect: this.config.effect,
      speed: this.config.speed,
      grabCursor: true,

      // Accessibility
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
        firstSlideMessage: 'This is the first slide',
        lastSlideMessage: 'This is the last slide',
      },

      // Events
      on: {
        init: () => {
          this.handleSwiperInit();
        },
        slideChange: () => {
          this.handleSlideChange();
        },
        resize: () => {
          this.handleResize();
        }
      }
    });

    this.isInitialized = true;
  }

  setupDesktopLayout() {
    // Remove swiper classes and restore grid layout
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    if (sliderContainer) {
      sliderContainer.classList.remove('swiper');
      const wrapper = sliderContainer.querySelector('.swiper-wrapper');
      if (wrapper) {
        wrapper.classList.remove('swiper-wrapper');
        // Move all slides out of wrapper
        const slides = wrapper.querySelectorAll('.swiper-slide');
        slides.forEach(slide => {
          slide.classList.remove('swiper-slide');
          sliderContainer.appendChild(slide);
        });
        // Remove wrapper
        wrapper.remove();
      }
    }

    // Hide navigation and pagination on desktop
    const nav = this.querySelector('.swiper-slideshow__navigation');
    const pagination = this.querySelector('.swiper-slideshow__pagination');
    if (nav) nav.style.display = 'none';
    if (pagination) pagination.style.display = 'none';
  }

  handleSwiperInit() {
    // Custom initialization logic
    this.dispatchEvent(new CustomEvent('swiper:init', { detail: { swiper: this.swiper } }));
  }

  handleSlideChange() {
    // Custom slide change logic
    this.dispatchEvent(new CustomEvent('swiper:slideChange', { detail: { swiper: this.swiper } }));
  }

  handleResize() {
    // Handle resize events
    if (window.innerWidth >= this.config.desktopBreakpoint) {
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = null;
      }
      this.setupDesktopLayout();
    } else if (!this.swiper) {
      this.initializeSwiper();
    }
  }

  // Public methods for external control
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
    if (this.swiper && this.swiper.autoplay) {
      this.swiper.autoplay.start();
    }
  }

  stopAutoplay() {
    if (this.swiper && this.swiper.autoplay) {
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

  // Method to reinitialize after dynamic content changes
  refresh() {
    if (this.swiper) {
      this.swiper.update();
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
    // Create pagination container
    const pagination = document.createElement('div');
    pagination.className = 'swiper-slideshow__pagination';
    
    // Add pagination after the navigation
    const navigation = container.querySelector('.swiper-slideshow__navigation');
    if (navigation) {
      navigation.parentNode.insertBefore(pagination, navigation.nextSibling);
    } else {
      // If no navigation, add after swiper-wrapper
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

  getSlideCount() {
    const slides = this.querySelectorAll('.swiper-slide');
    return slides.length;
  }
}

// Register the custom element
customElements.define('swiper-slideshow', SwiperSlideshow);
