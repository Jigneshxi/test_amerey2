const { verifyJwt } = require('../../middleware/auth');
const { getSalesData } = require('../../../MOD-022/sales_data_service');
const { getInventoryData } = require('../../../MOD-024/inventory_service');

async function generateAffiliateReport() {
    try {
        // Validate JWT - crucial security step
        const user = await verifyJwt(req, res);
        if (!user) {
            return { status: 401, body: { message: 'Unauthorized' } };
        }

        const salesData = await getSalesData();
        const inventoryData = await getInventoryData();

        if (!salesData || salesData.length === 0) {
            return { status: 200, body: { revenue: 0, totalSales: 0, inventoryTurnover: 0, topSellingProduct: null } };
        }

        let totalRevenue = 0;
        let totalSales = 0;
        const productSales = {};

        for (const sale of salesData) {
            totalRevenue += sale.price * sale.quantity;
            totalSales += sale.quantity;
            if (productSales[sale.productName]) {
                productSales[sale.productName] += sale.quantity;
            } else {
                productSales[sale.productName] = sale.quantity;
            }
        }

        let topSellingProduct = null;
        let maxSales = 0;
        for (const product in productSales) {
            if (productSales[product] > maxSales) {
                maxSales = productSales[product];
                topSellingProduct = product;
            }
        }

        let inventoryTurnover = 0;
        if (inventoryData && inventoryData.length > 0) {
            const totalInventoryValue = inventoryData.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
            if (totalRevenue > 0 && totalInventoryValue > 0) {
                inventoryTurnover = totalRevenue / totalInventoryValue;
            }
        }
    
        return {
            status: 200,
            body: {
                revenue: totalRevenue,
                totalSales: totalSales,
                inventoryTurnover: inventoryTurnover,
                topSellingProduct: topSellingProduct
            }
        };

    } catch (error) {
        console.error("Error generating affiliate report:", error);
        return { status: 500, body: { message: 'Internal server error' } };
    }
}

module.exports = { generateAffiliateReport };