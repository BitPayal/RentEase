const applyDynamicPricing = (products) => {
    const today = new Date().getDay();
    const isOffPeak = today === 2 || today === 3; // Tuesday and Wednesday get a 10% discount

    if (!Array.isArray(products)) {
        let finalPrice = parseFloat(products.pricePerDay);
        if (isOffPeak && !isNaN(finalPrice)) finalPrice = Math.floor(finalPrice * 0.90);
        return { ...products._doc, pricePerDay: finalPrice, isOffPeakDiscounted: isOffPeak };
    }

    return products.map(product => {
        let finalPrice = parseFloat(product.pricePerDay);
        if (isOffPeak && !isNaN(finalPrice)) finalPrice = Math.floor(finalPrice * 0.90);
        return { ...product._doc, pricePerDay: finalPrice, isOffPeakDiscounted: isOffPeak };
    });
};

module.exports = applyDynamicPricing;
