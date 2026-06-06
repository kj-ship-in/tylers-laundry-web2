/**
 * Delivery Fee Configuration
 * Define default delivery fees for different areas/zones in The Gambia
 * Fees are calculated automatically based on delivery address
 */
export const DELIVERY_FEE_CONFIG = {
    // Base delivery fee applied to all bookings
    BASE_DELIVERY_FEE: 20.0,
    // Zone-based delivery fees for The Gambia (based on distance/area)
    // Keywords are used to automatically detect zone from delivery address
    ZONES: {
        ZONE_1: {
            name: 'Banjul & Kombo',
            fee: 15.0,
            keywords: ['banjul', 'kombo', 'serekunda'],
        }, // Central area
        ZONE_2: {
            name: 'Serrekunda',
            fee: 18.0,
            keywords: ['serrekunda', 'kankuran'],
        }, // Close proximity
        ZONE_3: {
            name: 'Bakau',
            fee: 17.0,
            keywords: ['bakau', 'atlantic', 'beach'],
        }, // Tourist area
        ZONE_4: {
            name: 'Fajara',
            fee: 18.0,
            keywords: ['fajara', 'cape point'],
        }, // Residential area
        ZONE_5: {
            name: 'Kanifing',
            fee: 20.0,
            keywords: ['kanifing', 'pipeline', 'kairaba'],
        }, // Extended area
        ZONE_6: {
            name: 'Lamin',
            fee: 25.0,
            keywords: ['lamin', 'lamin junction', 'mandina'],
        }, // Far distance
        ZONE_7: {
            name: 'Brikama',
            fee: 30.0,
            keywords: ['brikama', 'brikamaba'],
        }, // Outside Kombo
        ZONE_8: {
            name: 'Soma',
            fee: 40.0,
            keywords: ['soma', 'soma junction'],
        }, // Far/regional
        ZONE_9: {
            name: 'Kaur',
            fee: 35.0,
            keywords: ['kaur', 'ker-kaur', 'jarra'],
        }, // Regional
        ZONE_10: {
            name: 'Cashew',
            fee: 50.0,
            keywords: ['cashew', 'kaur direction'],
        }, // Very far distance
    },
    // Service-specific delivery fee surcharges (optional)
    SERVICE_SURCHARGES: {
        EXPRESS: 10.0, // Express service surcharge
        PREMIUM: 5.0, // Premium service surcharge
        STANDARD: 0.0, // No surcharge
    },
    // Weight-based surcharges (optional, per kg)
    WEIGHT_BASED: {
        enabled: false,
        surchargePerKg: 2.0,
        thresholdKg: 10, // Apply surcharge if weight > 10kg
    },
    // Discount for bulk orders
    BULK_DISCOUNT: {
        enabled: false,
        percentageDiscount: 5, // 5% discount
        minimumAmountRequired: 100, // Apply discount if total > $100
    },
};
/**
 * Detect delivery zone from delivery address
 * @param address - Delivery address string
 * @returns Zone key (e.g., 'ZONE_1') or undefined if no match found
 */
export const detectZoneFromAddress = (address) => {
    if (!address)
        return undefined;
    const lowerAddress = address.toLowerCase();
    // Iterate through zones and check keywords
    for (const [zoneKey, zoneConfig] of Object.entries(DELIVERY_FEE_CONFIG.ZONES)) {
        if (zoneConfig.keywords?.some(keyword => lowerAddress.includes(keyword))) {
            return zoneKey;
        }
    }
    // Default to ZONE_1 if no match found
    return 'ZONE_1';
};
/**
 * Get delivery fee based on delivery address and service type
 * Automatically detects zone from delivery address
 * @param deliveryAddress - Full delivery address (used to detect zone)
 * @param serviceType - Type of service (optional)
 * @param weight - Weight of items in kg (optional)
 * @returns Calculated delivery fee
 */
export const calculateDeliveryFee = (deliveryAddress, serviceType, weight) => {
    let fee = DELIVERY_FEE_CONFIG.BASE_DELIVERY_FEE;
    // Detect zone from delivery address
    if (deliveryAddress) {
        const detectedZone = detectZoneFromAddress(deliveryAddress);
        if (detectedZone) {
            const zoneConfig = DELIVERY_FEE_CONFIG.ZONES[detectedZone];
            fee = zoneConfig.fee;
        }
    }
    // Add service surcharge if service type provided
    if (serviceType &&
        DELIVERY_FEE_CONFIG.SERVICE_SURCHARGES[serviceType]) {
        const surcharge = DELIVERY_FEE_CONFIG.SERVICE_SURCHARGES[serviceType];
        fee += surcharge;
    }
    // Add weight-based surcharge if enabled and weight provided
    if (DELIVERY_FEE_CONFIG.WEIGHT_BASED.enabled &&
        weight &&
        weight > DELIVERY_FEE_CONFIG.WEIGHT_BASED.thresholdKg) {
        const weightSurcharge = (weight - DELIVERY_FEE_CONFIG.WEIGHT_BASED.thresholdKg) *
            DELIVERY_FEE_CONFIG.WEIGHT_BASED.surchargePerKg;
        fee += weightSurcharge;
    }
    return Math.round(fee * 100) / 100; // Round to 2 decimal places
};
/**
 * Apply bulk discount if applicable
 * @param subtotal - Subtotal before delivery fee
 * @param discount - Current discount amount
 * @returns Adjusted discount amount
 */
export const applyBulkDiscount = (subtotal, discount = 0) => {
    if (DELIVERY_FEE_CONFIG.BULK_DISCOUNT.enabled &&
        subtotal >= DELIVERY_FEE_CONFIG.BULK_DISCOUNT.minimumAmountRequired) {
        const bulkDiscount = (subtotal * DELIVERY_FEE_CONFIG.BULK_DISCOUNT.percentageDiscount) / 100;
        return discount + bulkDiscount;
    }
    return discount;
};
