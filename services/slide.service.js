const prisma = require('../utils/prisma');

const getAllSlides = async () => {
  return await prisma.slide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
};

const getAllSlidesAdmin = async () => {
  return await prisma.slide.findMany({
    orderBy: { order: 'asc' }
  });
};

const getSlideById = async (id) => {
  const slide = await prisma.slide.findUnique({
    where: { id }
  });
  
  if (!slide) {
    throw new Error('Slide not found');
  }
  
  return slide;
};

const createSlide = async (slideData) => {
  const count = await prisma.slide.count();
  
  return await prisma.slide.create({
    data: {
      title: slideData.title || '',
      subtitle: slideData.subtitle || '',
      image: slideData.image || slideData.image_url || '',
      link: slideData.link || slideData.cta_link || '',
      cta_text: slideData.cta_text || slideData.ctaText || '',
      isActive: slideData.isActive !== undefined ? slideData.isActive : true,
      order: slideData.order || count + 1
    }
  });
};

const updateSlide = async (id, updateData) => {
  return await prisma.slide.update({
    where: { id },
    data: updateData
  });
};

const deleteSlide = async (id) => {
  await prisma.slide.delete({
    where: { id }
  });
  return true;
};

module.exports = {
  getAllSlides,
  getAllSlidesAdmin,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide
};
