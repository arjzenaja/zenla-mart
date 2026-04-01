const { readData, writeData, generateId } = require('../utils/dataHelper.util');

const getAllBanners = async () => {
  const banners = await readData('banners.json');
  return banners.filter(b => b.isActive);
};

const getAllBannersAdmin = async () => {
  const banners = await readData('banners.json');
  return banners;
};

const getBannerById = async (id) => {
  const banners = await readData('banners.json');
  const banner = banners.find(b => b.id === id);
  
  if (!banner) {
    throw new Error('Banner not found');
  }
  
  return banner;
};

const createBanner = async (bannerData) => {
  const banners = await readData('banners.json');
  
  const newBanner = {
    id: generateId(),
    title: bannerData.title || '',
    image: bannerData.image,
    link: bannerData.link || '',
    isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
    order: bannerData.order || banners.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  banners.push(newBanner);
  await writeData('banners.json', banners);
  
  return newBanner;
};

const updateBanner = async (id, updateData) => {
  const banners = await readData('banners.json');
  const bannerIndex = banners.findIndex(b => b.id === id);
  
  if (bannerIndex === -1) {
    throw new Error('Banner not found');
  }

  banners[bannerIndex] = {
    ...banners[bannerIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  await writeData('banners.json', banners);
  
  return banners[bannerIndex];
};

const deleteBanner = async (id) => {
  const banners = await readData('banners.json');
  const bannerIndex = banners.findIndex(b => b.id === id);
  
  if (bannerIndex === -1) {
    throw new Error('Banner not found');
  }

  banners.splice(bannerIndex, 1);
  await writeData('banners.json', banners);
  
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
