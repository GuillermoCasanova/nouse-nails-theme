if (!customElements.get('purchase-options')) {
  customElements.define(
    'purchase-options',
    class PurchaseOptions extends HTMLElement {
      connectedCallback() {
        this.planOptions = this.querySelectorAll(
          '[data-selling-plan-option]'
        );
        this.onceOption = this.querySelector('[data-purchase-option="once"]');
        this.subscribeCard = this.querySelector('[data-subscribe-card]');

        this.addEventListener('change', this.syncForms.bind(this));
        this.subscribeCard?.addEventListener('click', () => {
          const firstPlan = this.planOptions[0];
          if (!firstPlan) return;
          firstPlan.checked = true;
          firstPlan.dispatchEvent(new Event('change', { bubbles: true }));
        });
        this.syncForms();
      }

      selectedPlanId() {
        const selectedPlan = this.querySelector(
          '[data-selling-plan-option]:checked'
        );
        if (selectedPlan) return selectedPlan.value;
        return '';
      }

      syncForms() {
        const planId = this.selectedPlanId();
        const root = this.closest('.product-section') || document;

        root.querySelectorAll('form[action*="/cart/add"]').forEach(form => {
          if (form.contains(this)) return;

          let input = form.querySelector('input[name="selling_plan"]');
          if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'selling_plan';
            form.appendChild(input);
          }
          input.value = planId;
        });
      }
    }
  );
}
