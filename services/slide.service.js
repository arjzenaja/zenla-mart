const prisma = require('../utils/prisma');

// Ensure slide image URLs are absolute
const normalizeImageUrl = (slide) => {
  if (!slide || !slide.image) return slide;
  // If image is already a full URL, leave it as-is
  if (slide.image.startsWith('http://') || slide.image.startsWith('https://')) return slide;
  // Prepend the server base URL to relative paths
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  return { ...slide, image: `${baseUrl}${slide.image}` };
};

const getAllSlides = async () => {
  const slides = await prisma.slide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
  return slides.map(normalizeImageUrl);
};

const getAllSlidesAdmin = async () => {
  const slides = await prisma.slide.findMany({
    orderBy: { order: 'asc' }
  });
  return slides.map(normalizeImageUrl);
};

const getSlideById = async (id) => {
  const slide = await prisma.slide.findUnique({
    where: { id }
  });

  if (!slide) {
    throw new Error('Slide not found');
  }

  return normalizeImageUrl(slide);
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
