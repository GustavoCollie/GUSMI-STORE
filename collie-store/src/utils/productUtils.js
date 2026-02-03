/**
 * Checks if a product is currently in a pre-order state.
 * A product is in pre-order if it has the is_preorder flag AND
 * either has no estimated_delivery_date or the date is in the future.
 */
export const isCurrentlyPreorder = (product) => {
    if (!product || !product.is_preorder) return false;

    if (!product.estimated_delivery_date) return true;

    const deliveryDate = new Date(product.estimated_delivery_date);
    const now = new Date();

    return now < deliveryDate;
};

/**
 * Gets the active price for a product based on its pre-order status.
 */
export const getActivePrice = (product) => {
    if (isCurrentlyPreorder(product) && product.preorder_price) {
        return parseFloat(product.preorder_price);
    }
    return parseFloat(product.retail_price || 0);
};
