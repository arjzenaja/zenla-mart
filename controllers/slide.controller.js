const {
  getAllSlides,
  getAllSlidesAdmin,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide
} = require('../services/slide.service');

const getSlides = async (req, res, next) => {
  try {
    // If user is authenticated and is admin, show all slides
    // Otherwise, show only active slides
    const isAdmin = req.user && req.user.role === 'admin';
    const slides = isAdmin ? await getAllSlidesAdmin() : await getAllSlides();
    
    res.json({
      success: true,
      slides
    });
  } catch (error) {
    next(error);
  }
};

const getSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await getSlideById(id);
    
    res.json({
      success: true,
      slide
    });
  } catch (error) {
    next(error);
  }
};

const createSlideHandler = async (req, res, next) => {
  try {
    const { title, subtitle, image, image_url, link, cta_text, cta_link, isActive, is_active, order } = req.body;

    // Get image from either field
    const slideImage = image || image_url;
    
    if (!slideImage || slideImage.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Slide image is required. Please upload an image first.'
      });
    }

    const newSlide = await createSlide({
      title,
      subtitle,
      image: slideImage,
      image_url: slideImage,
      link,
      cta_text,
      cta_link,
      isActive: isActive !== undefined ? isActive : is_active,
      order
    });
    
    res.status(201).json({
      success: true,
      message: 'Slide created successfully',
      slide: newSlide
    });
  } catch (error) {
    console.error('Error creating slide:', error);
    next(error);
  }
};

const updateSlideHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSlide = await updateSlide(id, updateData);
    
    res.json({
      success: true,
      message: 'Slide updated successfully',
      slide: updatedSlide
    });
  } catch (error) {
    next(error);
  }
};

const deleteSlideHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await deleteSlide(id);
    
    res.json({
      success: true,
      message: 'Slide deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlides,
  getSlide,
  createSlideHandler,
  updateSlideHandler,
  deleteSlideHandler
};
