/**
 * Social Video Player Custom Element
 * Plays video on hover (desktop) or tap (mobile)
 */
class SocialVideoPlayer extends HTMLElement {
  constructor() {
    super();
    this.video = null;
    this.isPlaying = false;
    this.isTouchDevice = false;
    this.hasInteracted = false;
    this.observer = null;
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
    this.handleVideoReady = this.handleVideoReady.bind(this);
    this.handleVideoPlay = this.handleVideoPlay.bind(this);
    this.handleVideoPause = this.handleVideoPause.bind(this);
    this.handleVideoEnded = this.handleVideoEnded.bind(this);
  }

  connectedCallback() {
    this.video = this.querySelector('video');
    if (!this.video) return;

    this.toggle = this.querySelector('[data-social-video-toggle]');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.onReducedMotionChange = this.handleReducedMotionChange.bind(this);
    this.onToggle = this.handleToggle.bind(this);

    // Detect touch device
    this.isTouchDevice = this.detectTouchDevice();

    // Set initial state
    this.video.muted = true;
    this.video.loop = true;
    this.video.preload = 'metadata';

    this.setupPlaybackMode();

    // Handle video events
    this.video.addEventListener('loadedmetadata', this.handleVideoReady);
    this.video.addEventListener('play', this.handleVideoPlay);
    this.video.addEventListener('pause', this.handleVideoPause);
    this.video.addEventListener('ended', this.handleVideoEnded);

    if (this.toggle) {
      this.toggle.addEventListener('click', this.onToggle);
      this.syncControl();
    }

    if (typeof this.reducedMotion.addEventListener === 'function') {
      this.reducedMotion.addEventListener('change', this.onReducedMotionChange);
    } else {
      this.reducedMotion.addListener(this.onReducedMotionChange);
    }
  }

  disconnectedCallback() {
    this.removeHoverEvents();
    this.removeTouchEvents();

    if (this.video) {
      this.video.removeEventListener('loadedmetadata', this.handleVideoReady);
      this.video.removeEventListener('play', this.handleVideoPlay);
      this.video.removeEventListener('pause', this.handleVideoPause);
      this.video.removeEventListener('ended', this.handleVideoEnded);
    }

    if (this.toggle) {
      this.toggle.removeEventListener('click', this.onToggle);
    }

    if (this.reducedMotion) {
      if (typeof this.reducedMotion.removeEventListener === 'function') {
        this.reducedMotion.removeEventListener(
          'change',
          this.onReducedMotionChange
        );
      } else {
        this.reducedMotion.removeListener(this.onReducedMotionChange);
      }
    }

    // Disconnect observer if it exists
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  prefersReducedMotion() {
    return this.reducedMotion && this.reducedMotion.matches;
  }

  setupPlaybackMode() {
    this.removeHoverEvents();
    this.removeTouchEvents();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.prefersReducedMotion()) {
      this.pauseVideo();
      if (this.isTouchDevice) {
        this.setupTouchEvents();
      }
      return;
    }

    if (this.isTouchDevice) {
      this.setupTouchEvents();
    } else if (!this.hasAttribute('data-autoplay')) {
      this.setupHoverEvents();
    }

    if (this.hasAttribute('data-autoplay')) {
      this.setupAutoplay();
    }
  }

  handleReducedMotionChange() {
    this.setupPlaybackMode();
    this.syncControl();
  }

  handleToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.video) return;

    if (this.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  syncControl() {
    if (!this.toggle) return;

    const paused = !this.isPlaying;
    const pauseIcon = this.toggle.querySelector('[data-icon-pause]');
    const playIcon = this.toggle.querySelector('[data-icon-play]');
    const label = paused
      ? this.toggle.getAttribute('data-label-play')
      : this.toggle.getAttribute('data-label-pause');

    this.toggle.setAttribute('aria-label', label);

    if (pauseIcon) pauseIcon.hidden = paused;
    if (playIcon) playIcon.hidden = !paused;
  }

  setupAutoplay() {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.playVideo();
          } else {
            this.pauseVideo();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of element is visible
      }
    );

    this.observer.observe(this);
  }

  detectTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  setupHoverEvents() {
    this.addEventListener('mouseenter', this.handleMouseEnter);
    this.addEventListener('mouseleave', this.handleMouseLeave);
  }

  setupTouchEvents() {
    this.addEventListener('click', this.handleTouch);
    this.addEventListener('touchend', this.handleTouch);
  }

  removeHoverEvents() {
    this.removeEventListener('mouseenter', this.handleMouseEnter);
    this.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  removeTouchEvents() {
    this.removeEventListener('click', this.handleTouch);
    this.removeEventListener('touchend', this.handleTouch);
  }

  handleMouseEnter() {
    if (!this.video || this.isPlaying) return;
    this.playVideo();
  }

  handleMouseLeave() {
    if (!this.video) return;
    this.pauseVideo();
  }

  handleTouch(event) {
    if (event.target.closest('[data-social-video-toggle]')) return;

    event.preventDefault();

    if (!this.video) return;

    if (this.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  handleVideoReady() {
    // Video metadata is loaded
    this.classList.add('video-ready');

    // Add touch indicator for mobile
    if (this.isTouchDevice) {
      this.classList.add('touch-device');
    }
  }

  handleVideoPlay() {
    this.isPlaying = true;
    this.classList.add('video-playing');
    this.classList.remove('video-paused');
    this.syncControl();
  }

  handleVideoPause() {
    this.isPlaying = false;
    this.classList.remove('video-playing');
    this.classList.add('video-paused');
    this.syncControl();
  }

  handleVideoEnded() {
    // Restart video if it's still being hovered (desktop) or if it's a touch device
    if (this.isTouchDevice) {
      // For touch devices, don't auto-restart - let user tap again
      return;
    }

    if (this.matches(':hover')) {
      this.video.currentTime = 0;
      this.playVideo();
    }
  }

  async playVideo() {
    if (!this.video || this.isPlaying) return;

    // Lazily assign src from data-src on first play so the browser doesn't
    // fetch all video files on page load
    const source = this.video.querySelector('source[data-src]');
    if (source) {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
      this.video.load();
    }

    try {
      if (this.video.ended) {
        this.video.currentTime = 0;
      }

      await this.video.play();
    } catch (error) {
      console.warn('Could not play video:', error);
    }
  }

  pauseVideo() {
    if (!this.video || !this.isPlaying) return;

    this.video.pause();
  }

  // Public methods for external control
  play() {
    this.playVideo();
  }

  pause() {
    this.pauseVideo();
  }

  stop() {
    if (this.video) {
      this.video.pause();
      this.video.currentTime = 0;
    }
  }
}

// Register the custom element
customElements.define('social-video-player', SocialVideoPlayer);

// // Initialize existing elements on page load
// document.addEventListener('DOMContentLoaded', () => {
//   // Convert existing video blocks to custom elements
//   const videoBlocks = document.querySelectorAll('[data-video-block]');

//   videoBlocks.forEach(block => {
//     // Create the custom element
//     const socialPlayer = document.createElement('social-video-player');

//     // Move the content into the custom element
//     while (block.firstChild) {
//       socialPlayer.appendChild(block.firstChild);
//     }

//     // Replace the original block with the custom element
//     block.parentNode.replaceChild(socialPlayer, block);
//   });
// });

// // Export for module usage
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = SocialVideoPlayer;
// }
