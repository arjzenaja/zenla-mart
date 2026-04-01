const { getDashboardStats, getSalesStats } = require('../services/dashboard.service');

const getStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    next(error);
  }
};

const getSales = async (req, res, next) => {
  try {
    const sales = await getSalesStats();
    
    res.json({
      success: true,
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getSales
};
