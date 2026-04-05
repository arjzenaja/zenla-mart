const prisma = require('../utils/prisma');

const getDashboardStats = async () => {
  const [userCount, orderCount, productCount, categoryCount, totalRevenue, pendingOrders, deliveredOrders] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.aggregate({
      where: { status: 'delivered' },
      _sum: { total: true }
    }),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.findMany({
      where: { status: 'delivered' },
      include: { items: true }
    })
  ]);
  
  // Calculate total products sold
  const totalProductsSold = deliveredOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  
  // Recent orders (last 5)
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { name: true } } }
  });
  
  return {
    stats: {
      totalUsers: userCount,
      totalOrders: orderCount,
      totalProducts: productCount,
      totalCategories: categoryCount,
      revenue: totalRevenue._sum.total || 0,
      pendingOrders,
      totalProductsSold
    },
    recentOrders
  };
};

const getSalesStats = async () => {
  const months = ["JAN", "FEB", "MAR", "APRIL", "MEI", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const currentYear = new Date().getFullYear();
  
  const orders = await prisma.order.findMany({
    where: {
      status: 'delivered',
      createdAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1)
      }
    }
  });

  const salesMap = {};
  months.forEach(m => salesMap[m] = 0);
  
  orders.forEach(order => {
    const monthIndex = order.createdAt.getMonth();
    const monthName = months[monthIndex];
    salesMap[monthName] += (order.total || 0);
  });
  
  return months.map(month => ({
    name: month,
    sales: salesMap[month]
  }));
};

module.exports = {
  getDashboardStats,
  getSalesStats
};
