/**
 * Instagram Slideshow Custom Element
 * Automatically initializes Swiper with Instagram-style slideshow
 */
class InstagramSlideshow extends HTMLElement {
  constructor() {
    super();
    this.swiper = null;
    this.isInitialized = false;
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

    // Initialize Swiper
    this.swiper = new Swiper(sliderContainer, {
      // Basic settings
      slidesPerView: 1.25,
      spaceBetween: 20,
      loop: true,
      centeredSlides: true, // Fixed boolean value instead of string
      freeMode: false,
      autoplay: false,
      grabCursor: true,
      simulateTouch: true,
      preventClicks: true,
      preventClicksPropagation: true,
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
      },
      
      // Responsive breakpoints
      breakpoints: {
        768: {
          slidesPerView:'auto',
          centeredSlides: false,
          spaceBetween: 25,
          slidesOffsetBefore: 25
        }
      },

      // Navigation
      navigation: {
        nextEl: '.instagram-slideshow__nav-button--next',
        prevEl: '.instagram-slideshow__nav-button--prev',
      },

      // Pagination
      pagination: false,

      // Effects
      effect: 'slide',
      speed: 600,
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
        }
      }
    });

    // Pause autoplay when hovering over slides
    sliderContainer.addEventListener('mouseenter', () => {
      if (this.swiper && this.swiper.autoplay) {
        this.swiper.autoplay.stop();
      }
    });

    sliderContainer.addEventListener('mouseleave', () => {
      if (this.swiper && this.swiper.autoplay) {
        this.swiper.autoplay.start();
      }
    });

    this.isInitialized = true;
  }

  handleSwiperInit() {
    // Pause videos when slide changes
    const videos = this.swiper.slides[this.swiper.activeIndex].querySelectorAll('video');
    videos.forEach(video => {
      if (!video.paused) {
        video.pause();
      }
    });
  }

  handleSlideChange() {
    // Pause all videos when slide changes
    const allVideos = this.querySelectorAll('.instagram-slideshow__video');
    allVideos.forEach(video => {
      if (!video.paused) {
        video.pause();
      }
    });
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
}

// Register the custom element
customElements.define('instagram-slideshow', InstagramSlideshow);

