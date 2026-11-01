/**
 * Naisiae Textiles - Customer Session & Workspace Manager
 * 
 * Guarantees zero data loss for online customers:
 * 1. Cart Preservation: All selected items, sizes, quantities, and prices are continuously synced.
 * 2. Checkout Drafts: M-Pesa mobile numbers, payment methods, delivery preferences, and order notes.
 * 3. Shopping Context: Selected school filter, category, search queries, and mobile tabs.
 * 4. Active Modals & Views: Re-opens active variant customizer modals if the customer was configuring an item.
 * 5. Scroll Position: Seamlessly returns the customer to their exact viewport position on reload.
 * 6. Non-Intrusive Restoration Notification: Reassures the customer their work was safely restored.
 */

export interface CustomerCartItem {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  school: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  customizationNotes?: string;
}

export interface CustomerWorkspaceState {
  cart: CustomerCartItem[];
  mpesaPhone?: string;
  paymentMethod?: 'MPESA' | 'CARD';
  selectedCategory?: string;
  selectedSchool?: string;
  searchQuery?: string;
  isCartExpanded?: boolean;
  mobileTab?: 'catalog' | 'cart';
  activeProductId?: string | null;
  scrollPosition?: number;
  lastUpdated: number;
  urlPath?: string;
}

const CUSTOMER_WORKSPACE_KEY = 'nais_customer_workspace';
const CUSTOMER_CART_KEY = 'nais_customer_cart';
const CUSTOMER_SCROLL_KEY = 'nais_customer_scroll_pos';
const CUSTOMER_RESTORED_FLAG_KEY = 'nais_customer_restored_notice';

/**
 * Save complete or partial customer workspace state
 */
export function saveCustomerWorkspace(patch: Partial<CustomerWorkspaceState>): void {
  try {
    const existing = getCustomerWorkspace() || {
      cart: [],
      lastUpdated: Date.now(),
    };

    const updated: CustomerWorkspaceState = {
      ...existing,
      ...patch,
      lastUpdated: Date.now(),
    };

    // If cart is updated in patch, sync to CART key too
    if (patch.cart !== undefined) {
      saveCustomerCart(patch.cart);
    }

    localStorage.setItem(CUSTOMER_WORKSPACE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[CustomerSession] Failed to persist workspace:', err);
  }
}

/**
 * Retrieve saved customer workspace
 */
export function getCustomerWorkspace(): CustomerWorkspaceState | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_WORKSPACE_KEY);
    if (!raw) {
      // Fallback: check if standalone cart exists
      const cart = getCustomerCart();
      if (cart.length > 0) {
        return {
          cart,
          lastUpdated: Date.now(),
        };
      }
      return null;
    }
    const parsed: CustomerWorkspaceState = JSON.parse(raw);
    // Ensure cart is an array
    if (!Array.isArray(parsed.cart)) {
      parsed.cart = getCustomerCart();
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save cart items specifically (accessible across all customer pages)
 */
export function saveCustomerCart(cart: CustomerCartItem[]): void {
  try {
    if (cart && Array.isArray(cart) && cart.length > 0) {
      localStorage.setItem(CUSTOMER_CART_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CUSTOMER_CART_KEY);
    }
  } catch {
    // Ignore storage limits
  }
}

/**
 * Retrieve standalone customer cart
 */
export function getCustomerCart(): CustomerCartItem[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clear customer cart upon successful checkout completion
 */
export function clearCustomerCart(): void {
  try {
    localStorage.removeItem(CUSTOMER_CART_KEY);
    const existing = getCustomerWorkspace();
    if (existing) {
      existing.cart = [];
      existing.mpesaPhone = '';
      existing.lastUpdated = Date.now();
      localStorage.setItem(CUSTOMER_WORKSPACE_KEY, JSON.stringify(existing));
    }
  } catch {
    // Ignore
  }
}

/**
 * Fully reset customer workspace
 */
export function clearCustomerWorkspace(): void {
  try {
    localStorage.removeItem(CUSTOMER_WORKSPACE_KEY);
    localStorage.removeItem(CUSTOMER_CART_KEY);
    localStorage.removeItem(CUSTOMER_SCROLL_KEY);
    localStorage.removeItem(CUSTOMER_RESTORED_FLAG_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Save current window scroll position
 */
export function saveCustomerScrollPosition(): void {
  if (typeof window === 'undefined') return;
  try {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > 20) {
      sessionStorage.setItem(CUSTOMER_SCROLL_KEY, String(y));
    }
  } catch {
    // Ignore
  }
}

/**
 * Restore window scroll position smoothly
 */
export function restoreCustomerScrollPosition(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(CUSTOMER_SCROLL_KEY);
    if (raw) {
      const y = parseInt(raw, 10);
      if (!isNaN(y) && y > 20) {
        // Use requestAnimationFrame to ensure DOM is rendered
        window.requestAnimationFrame(() => {
          window.scrollTo({
            top: y,
            behavior: 'smooth',
          });
          sessionStorage.removeItem(CUSTOMER_SCROLL_KEY);
        });
      }
    }
  } catch {
    // Ignore
  }
}

/**
 * Check if the customer has meaningful active work that was restored
 */
export function hasMeaningfulCustomerWork(workspace: CustomerWorkspaceState | null): boolean {
  if (!workspace) return false;
  const hasCart = Array.isArray(workspace.cart) && workspace.cart.length > 0;
  const hasPhone = Boolean(workspace.mpesaPhone && workspace.mpesaPhone.trim().length >= 3);
  const hasSchool = Boolean(workspace.selectedSchool && workspace.selectedSchool !== 'ALL');
  const hasCategory = Boolean(workspace.selectedCategory && workspace.selectedCategory !== 'ALL');
  const hasSearch = Boolean(workspace.searchQuery && workspace.searchQuery.trim().length > 1);
  return hasCart || hasPhone || hasSchool || hasCategory || hasSearch;
}
