const prisma = require('../utils/prisma');

const getAllBanners = async () => {
  return await prisma.banner.findMany({
    where: { isActive: true }
  });
};

const getAllBannersAdmin = async () => {
  return await prisma.banner.findMany();
};

const getBannerById = async (id) => {
  const banner = await prisma.banner.findUnique({
    where: { id }
  });
  
  if (!banner) {
    throw new Error('Banner not found');
  }
  
  return banner;
};

const createBanner = async (bannerData) => {
  return await prisma.banner.create({
    data: {
      title: bannerData.title || '',
      image: bannerData.image,
      link: bannerData.link || '',
      isActive: bannerData.isActive !== undefined ? bannerData.isActive : true
    }
  });
};

const updateBanner = async (id, updateData) => {
  return await prisma.banner.update({
    where: { id },
    data: updateData
  });
};

const deleteBanner = async (id) => {
  await prisma.banner.delete({
    where: { id }
  });
  return true;
};

module.exports = {
  getAllBanners,
  getAllBannersAdmin,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
};
