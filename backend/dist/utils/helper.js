export const getRandomRecentDate = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return new Date(thirtyDaysAgo.getTime() +
        Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
};
export const getFutureDate = (monthsAhead = 12) => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + monthsAhead, now.getDate());
};
export const getRelativeExpiry = (expiryDate) => {
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 60) {
        return `${diffMins} minutes`;
    }
    else if (diffHours < 24) {
        return `${diffHours} hours`;
    }
    else {
        return `${diffDays} days`;
    }
};
export const generateTransactionId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN-${timestamp}-${random}`;
};
