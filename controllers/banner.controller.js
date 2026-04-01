const {
  getAllBanners,
  getAllBannersAdmin,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../services/banner.service');

const getBanners = async (req, res, next) => {
  try {
    // If user is authenticated and is admin, show all banners
    // Otherwise, show only active banners
    const isAdmin = req.user && req.user.role === 'admin';
    const banners = isAdmin ? await getAllBannersAdmin() : await getAllBanners();
    
    res.json({
      success: true,
      banners
    });
  } catch (error) {
    next(error);
  }
};

const getBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await getBannerById(id);
    
    res.json({
      success: true,
      banner
    });
  } catch (error) {
    next(error);
  }
};

const createBannerHandler = async (req, res, next) => {
  try {
    const { title, image, link, isActive, order } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required'
      });
    }

    const newBanner = await createBanner({
      title,
      image,
      link,
      isActive,
      order
    });
    
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner: newBanner
    });
  } catch (error) {
    next(error);
  }
};

const updateBannerHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedBanner = await updateBanner(id, updateData);
    
    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner: updatedBanner
    });
  } catch (error) {
    next(error);
  }
};

const deleteBannerHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await deleteBanner(id);
    
    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners,
  getBanner,
  createBannerHandler,
  updateBannerHandler,
  deleteBannerHandler
};
