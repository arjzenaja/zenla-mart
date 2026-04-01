const { readData, writeData, generateId } = require('../utils/dataHelper.util');

const getAllSlides = async () => {
  const slides = await readData('slides.json');
  // Filter only active slides (support both isActive and is_active field names)
  // A slide is active if isActive === true OR is_active === true (default to true if undefined)
  const activeSlides = slides.filter(s => {
    const isActive = s.isActive !== undefined ? s.isActive : (s.is_active !== undefined ? s.is_active : true);
    return isActive === true;
  });
  
  return activeSlides.sort((a, b) => (a.order || 0) - (b.order || 0));
};

const getAllSlidesAdmin = async () => {
  const slides = await readData('slides.json');
  return slides.sort((a, b) => a.order - b.order);
};

const getSlideById = async (id) => {
  const slides = await readData('slides.json');
  const slide = slides.find(s => s.id === id);
  
  if (!slide) {
    throw new Error('Slide not found');
  }
  
  return slide;
};

const createSlide = async (slideData) => {
  const slides = await readData('slides.json');
  
  const newSlide = {
    id: generateId(),
    title: slideData.title || '',
    subtitle: slideData.subtitle || '',
    image: slideData.image || slideData.image_url || '',
    image_url: slideData.image_url || slideData.image || '',
    link: slideData.link || slideData.cta_link || '',
    cta_text: slideData.cta_text || slideData.ctaText || '',
    cta_link: slideData.cta_link || slideData.ctaLink || slideData.link || '',
    isActive: slideData.isActive !== undefined ? slideData.isActive : (slideData.is_active !== undefined ? slideData.is_active : true),
    order: slideData.order || slides.length + 1,
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  slides.push(newSlide);
  await writeData('slides.json', slides);
  
  return newSlide;
};

const updateSlide = async (id, updateData) => {
  const slides = await readData('slides.json');
  const slideIndex = slides.findIndex(s => s.id === id);
  
  if (slideIndex === -1) {
    throw new Error('Slide not found');
  }

  slides[slideIndex] = {
    ...slides[slideIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  await writeData('slides.json', slides);
  
  return slides[slideIndex];
};

const deleteSlide = async (id) => {
  const slides = await readData('slides.json');
  const slideIndex = slides.findIndex(s => s.id === id);
  
  if (slideIndex === -1) {
    throw new Error('Slide not found');
  }

  slides.splice(slideIndex, 1);
  await writeData('slides.json', slides);
  
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
