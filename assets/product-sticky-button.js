class ProductStickyButton extends HTMLElement {
  constructor() {
    super();
    this.stickyButton = this.querySelector('[data-sticky-button]');
    this.sectionId = this.dataset.section;
    this.mainForm = document.querySelector(
      `product-form[data-section-id="${this.sectionId}"]`
    );
    this.mainSubmitButton = document.querySelector(
      `#ProductSubmitButton-${this.sectionId}`
    );
    this.stickySubmitButton = this.querySelector(
      `#ProductSubmitButtonSticky-${this.sectionId}`
    );
    this.stickyForm = this.querySelector('form');
    this.mainFormElement = this.mainForm?.querySelector('form');

    if (!this.stickyButton || !this.mainForm) return;

    this.init();
  }

  init() {
    this.syncVariantId();
    this.syncButtonState();

    document.addEventListener('variant:change', () => {
      this.syncVariantId();
      this.syncButtonState();
    });

    // Sync variant ID right before form submission to prevent race conditions
    if (this.stickyForm) {
      this.stickyForm.addEventListener(
        'submit',
        () => {
          // Sync variant ID synchronously right before submission
          this.syncVariantId();
        },
        { capture: true }
      );
    }

    if (this.mainSubmitButton) {
      const observer = new MutationObserver(() => {
        this.syncButtonState();
      });

      observer.observe(this.mainSubmitButton, {
        attributes: true,
        attributeFilter: ['disabled', 'aria-disabled'],
      });
    }

    this.handleScroll();
    window.addEventListener('scroll', () => this.handleScroll(), {
      passive: true,
    });
  }

  syncVariantId() {
    const mainVariantInput = this.mainFormElement?.querySelector(
      '.product-variant-id'
    );
    const stickyVariantInput = this.stickyForm?.querySelector(
      '.product-variant-id'
    );

    if (mainVariantInput && stickyVariantInput) {
      stickyVariantInput.value = mainVariantInput.value;
      stickyVariantInput.disabled = mainVariantInput.disabled;
    }
  }

  syncButtonState() {
    if (!this.mainSubmitButton || !this.stickySubmitButton) return;

    const isDisabled =
      this.mainSubmitButton.disabled ||
      this.mainSubmitButton.getAttribute('aria-disabled') === 'true';
    this.stickySubmitButton.disabled = isDisabled;

    const mainButtonText = this.mainSubmitButton
      .querySelector('span')
      ?.textContent.trim();
    if (mainButtonText) {
      const stickyButtonText = this.stickySubmitButton.querySelector('span');
      if (stickyButtonText) {
        stickyButtonText.textContent = mainButtonText;
      }
    }
  }

  handleScroll() {
    if (window.innerWidth >= 750) return;

    const scrollPosition = window.scrollY || window.pageYOffset;
    const shouldShow = scrollPosition > 200;

    if (shouldShow) {
      this.stickyButton.classList.remove('is-hidden');
    } else {
      this.stickyButton.classList.add('is-hidden');
    }
  }
}

customElements.define('product-sticky-button', ProductStickyButton);
