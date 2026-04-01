const { readData } = require('../utils/dataHelper.util');

const getDashboardStats = async () => {
  const users = await readData('users.json');
  const orders = await readData('orders.json');
  const products = await readData('products.json');
  const categories = await readData('categories.json');
  
  // Calculate revenue
  const revenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + order.total, 0);
  
  // Calculate pending orders
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  // Calculate total products sold
  const totalProductsSold = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
  
  // Recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  return {
    stats: {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCategories: categories.length,
      revenue,
      pendingOrders,
      totalProductsSold
    },
    recentOrders
  };
};

const getSalesStats = async () => {
  const orders = await readData('orders.json');
  const months = ["JAN", "FEB", "MAR", "APRIL", "MEI", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  
  const currentYear = new Date().getFullYear();
  
  // Initialize map with 0 for all months
  const salesMap = {};
  months.forEach(m => salesMap[m] = 0);
  
  // Sum up total for delivered orders in the current year
  orders.forEach(order => {
    if (order.status === 'delivered') {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        const monthName = months[monthIndex];
        salesMap[monthName] += (order.total || 0);
      }
    }
  });
  
  // Format for the chart: [{ name: 'JAN', sales: 100 }, ...]
  const formattedSales = months.map(month => ({
    name: month,
    sales: salesMap[month]
  }));
  
  return formattedSales;
};

module.exports = {
  getDashboardStats,
  getSalesStats
};
