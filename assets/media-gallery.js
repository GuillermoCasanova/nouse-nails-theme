if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super();
        this.elements = {
          liveRegion: this.querySelector('[id^="GalleryStatus"]'),
          viewer: this.querySelector('[id^="GalleryViewer"]'),
          thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
        };
        this.mql = window.matchMedia('(min-width: 750px)');
        this.zoomBehavior = this.dataset.zoomBehavior || 'inside';

        this._initImageZoom();
        if (!this.elements.thumbnails) return;

        this.elements.viewer.addEventListener(
          'slideChanged',
          debounce(this.onSlideChanged.bind(this), 500)
        );
        this.elements.thumbnails
          .querySelectorAll('[data-target]')
          .forEach(mediaToSwitch => {
            mediaToSwitch
              .querySelector('button')
              .addEventListener(
                'click',
                this.setActiveMedia.bind(
                  this,
                  mediaToSwitch.dataset.target,
                  false
                )
              );
          });
        if (
          this.dataset.desktopLayout.includes('thumbnail') &&
          this.mql.matches
        )
          this.removeListSemantic();
      }

      onSlideChanged(event) {
        const thumbnail = this.elements.thumbnails.querySelector(
          `[data-target="${event.detail.currentElement.dataset.mediaId}"]`
        );
        this.setActiveThumbnail(thumbnail);
      }

      setActiveMedia(mediaId, prepend) {
        const activeMedia =
          this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`) ||
          this.elements.viewer.querySelector('[data-media-id]');
        if (!activeMedia) {
          return;
        }
        this.elements.viewer
          .querySelectorAll('[data-media-id]')
          .forEach(element => {
            element.classList.remove('is-active');
          });
        activeMedia?.classList?.add('is-active');

        if (prepend) {
          activeMedia.parentElement.firstChild !== activeMedia &&
            activeMedia.parentElement.prepend(activeMedia);

          if (this.elements.thumbnails) {
            const activeThumbnail = this.elements.thumbnails.querySelector(
              `[data-target="${mediaId}"]`
            );
            activeThumbnail.parentElement.firstChild !== activeThumbnail &&
              activeThumbnail.parentElement.prepend(activeThumbnail);
          }

          if (this.elements.viewer.slider) this.elements.viewer.resetPages();
        }

        this.preventStickyHeader();
        window.setTimeout(() => {
          if (!this.mql.matches || this.elements.thumbnails) {
            activeMedia.parentElement.scrollTo({
              left: activeMedia.offsetLeft,
            });
          }
          const activeMediaRect = activeMedia.getBoundingClientRect();
          // Don't scroll if the image is already in view
          if (activeMediaRect.top > -0.5) return;
          const top = activeMediaRect.top + window.scrollY;
          window.scrollTo({ top: top, behavior: 'smooth' });
        });
        this.playActiveMedia(activeMedia);

        if (!this.elements.thumbnails) return;
        const activeThumbnail = this.elements.thumbnails.querySelector(
          `[data-target="${mediaId}"]`
        );
        this.setActiveThumbnail(activeThumbnail);
        this.announceLiveRegion(
          activeMedia,
          activeThumbnail.dataset.mediaPosition
        );
      }

      setActiveThumbnail(thumbnail) {
        if (!this.elements.thumbnails || !thumbnail) return;

        this.elements.thumbnails
          .querySelectorAll('button')
          .forEach(element => element.removeAttribute('aria-current'));
        thumbnail.querySelector('button').setAttribute('aria-current', true);
        if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return;

        this.elements.thumbnails.slider.scrollTo({
          left: thumbnail.offsetLeft,
        });
      }

      announceLiveRegion(activeItem, position) {
        const image = activeItem.querySelector(
          '.product__modal-opener--image img'
        );
        if (!image) return;
        image.onload = () => {
          this.elements.liveRegion.setAttribute('aria-hidden', false);
          this.elements.liveRegion.innerHTML =
            window.accessibilityStrings.imageAvailable.replace(
              '[index]',
              position
            );
          setTimeout(() => {
            this.elements.liveRegion.setAttribute('aria-hidden', true);
          }, 2000);
        };
        image.src = image.src;
      }

      playActiveMedia(activeItem) {
        window.pauseAllMedia();
        const deferredMedia = activeItem.querySelector('.deferred-media');
        if (deferredMedia) deferredMedia.loadContent(false);
      }

      preventStickyHeader() {
        this.stickyHeader =
          this.stickyHeader || document.querySelector('sticky-header');
        if (!this.stickyHeader) return;
        this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
      }

      removeListSemantic() {
        if (!this.elements.viewer.slider) return;
        this.elements.viewer.slider.setAttribute('role', 'presentation');
        this.elements.viewer.sliderItems.forEach(slide =>
          slide.setAttribute('role', 'presentation')
        );
      }

      _initImageZoom() {
        this.addEventListener('click', (e) => {
          const wrapper = e.target.closest('[data-image-zoom-wrapper]');
          if (!wrapper) return;
          const zoomUrl = wrapper.getAttribute('data-zoom');
          if (!zoomUrl) return;
          e.preventDefault();
          e.stopPropagation();
          if (this.zoomBehavior === 'modal') {
            this._openZoomOverlay(zoomUrl);
          } else {
            this._toggleZoomInside(wrapper, zoomUrl);
          }
        });
      }

      _toggleZoomInside(wrapper, zoomUrl) {
        if (wrapper.classList.contains('product-media-gallery__zoom-inside--active')) {
          this._closeZoomInside(wrapper);
          return;
        }
        this._closeAnyZoomInside();
        wrapper.classList.add('product-media-gallery__zoom-inside--active');
        const img = wrapper.querySelector('[data-image-zoom]');
        if (img && zoomUrl && img.src !== zoomUrl) {
          wrapper.setAttribute('data-zoom-original-src', img.src || '');
          img.src = zoomUrl;
        }
        this._zoomInsideWrapper = wrapper;
        this._zoomInsideClickOutside = (e) => {
          if (wrapper.contains(e.target)) return;
          this._closeZoomInside(wrapper);
          document.removeEventListener('click', this._zoomInsideClickOutside);
          document.removeEventListener('keydown', this._zoomInsideKeydown);
        };
        this._zoomInsideKeydown = (e) => {
          if (e.code === 'Escape') {
            this._closeZoomInside(wrapper);
            document.removeEventListener('click', this._zoomInsideClickOutside);
            document.removeEventListener('keydown', this._zoomInsideKeydown);
          }
        };
        document.addEventListener('click', this._zoomInsideClickOutside);
        document.addEventListener('keydown', this._zoomInsideKeydown);
      }

      _closeZoomInside(wrapper) {
        if (!wrapper) return;
        wrapper.classList.remove('product-media-gallery__zoom-inside--active');
        const img = wrapper.querySelector('[data-image-zoom]');
        const originalSrc = wrapper.getAttribute('data-zoom-original-src');
        if (img && originalSrc) {
          img.src = originalSrc;
          wrapper.removeAttribute('data-zoom-original-src');
        }
        if (this._zoomInsideClickOutside) {
          document.removeEventListener('click', this._zoomInsideClickOutside);
          this._zoomInsideClickOutside = null;
        }
        if (this._zoomInsideKeydown) {
          document.removeEventListener('keydown', this._zoomInsideKeydown);
          this._zoomInsideKeydown = null;
        }
        if (this._zoomInsideWrapper === wrapper) this._zoomInsideWrapper = null;
      }

      _closeAnyZoomInside() {
        const active = this.querySelector('.product-media-gallery__zoom-inside--active');
        if (active) this._closeZoomInside(active);
      }

      _openZoomOverlay(zoomUrl) {
        if (this._zoomOverlay) return;
        const overlay = document.createElement('div');
        overlay.className = 'product-media-gallery__zoom-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
          <button type="button" class="product-media-gallery__zoom-close" aria-label="Close zoom"></button>
          <div class="product-media-gallery__zoom-backdrop"></div>
          <img class="product-media-gallery__zoom-image" src="${zoomUrl}" alt="" loading="eager">
        `;
        const close = () => this._closeZoomOverlay();
        overlay.querySelector('.product-media-gallery__zoom-close').addEventListener('click', close);
        overlay.querySelector('.product-media-gallery__zoom-backdrop').addEventListener('click', close);
        const onKeydown = (e) => {
          if (e.code === 'Escape') {
            close();
            document.removeEventListener('keydown', onKeydown);
          }
        };
        document.addEventListener('keydown', onKeydown);
        this._zoomKeydown = onKeydown;
        this._zoomOverlay = overlay;
        this.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('is-open'));
      }

      _closeZoomOverlay() {
        if (!this._zoomOverlay) return;
        if (this._zoomKeydown) document.removeEventListener('keydown', this._zoomKeydown);
        this._zoomOverlay.classList.remove('is-open');
        const overlay = this._zoomOverlay;
        this._zoomOverlay = null;
        this._zoomKeydown = null;
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      }
    }
  );
}
