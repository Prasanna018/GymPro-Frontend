/**
 * Razorpay SDK Utility
 * Dynamically loads the Razorpay checkout script and provides a typed helper
 * to open the payment modal.
 */

declare global {
    interface Window {
        Razorpay: any;
    }
}

/** Load the Razorpay JS SDK script (idempotent — safe to call multiple times). */
export function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const existing = document.querySelector('script[src*="razorpay"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(true));
            existing.addEventListener('error', () => resolve(false));
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export interface RazorpayOptions {
    keyId: string;
    orderId: string;
    amount: number;           // in paise
    currency?: string;
    name?: string;
    description?: string;
    prefillName?: string;
    prefillEmail?: string;
    prefillContact?: string;
    onSuccess: (response: RazorpaySuccessResponse) => void;
    onDismiss?: () => void;
}

export interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

/**
 * Open the Razorpay checkout modal.
 * Loads the SDK if not already present.
 */
export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
    }

    const rzp = new window.Razorpay({
        key: options.keyId,
        order_id: options.orderId,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name || 'GymPro',
        description: options.description || 'Payment',
        prefill: {
            name: options.prefillName || '',
            email: options.prefillEmail || '',
            contact: options.prefillContact || '',
        },
        theme: {
            color: '#E11D48', // matches primary brand color
        },
        modal: {
            ondismiss: () => {
                options.onDismiss?.();
            },
        },
        handler: (response: RazorpaySuccessResponse) => {
            options.onSuccess(response);
        },
    });

    rzp.open();
}
