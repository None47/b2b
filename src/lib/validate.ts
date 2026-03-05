export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateGST(gst: string): boolean {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        gst.trim().toUpperCase()
    );
}

export function validatePAN(pan: string): boolean {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

export function validatePincode(pin: string): boolean {
    return /^[1-9][0-9]{5}$/.test(pin.trim());
}

export function sanitize(str: string): string {
    return str.trim().replace(/<[^>]*>/g, "");
}
