const { getAllSlides } = require('../services/slide.service');

/**
 * GET /api/home-slides
 * Returns only active slides, ordered by order ASC
 * Response format matches client requirements
 */
const getHomeSlides = async (req, res, next) => {
  try {
    const slides = await getAllSlides();
    
    console.log(`[Home Slides API] Found ${slides.length} active slides`);
    
    // Map to client-friendly format
    const formattedSlides = slides.map(slide => ({
      id: slide.id,
      image_url: slide.image || slide.image_url || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      cta_text: slide.cta_text || slide.ctaText || '',
      cta_link: slide.cta_link || slide.ctaLink || slide.link || '',
      order: slide.order || 0
    }));
    
    console.log(`[Home Slides API] Returning ${formattedSlides.length} formatted slides`);
    
    // Return empty array if no slides (not an error)
    res.json(formattedSlides);
  } catch (error) {
    console.error('Error in getHomeSlides:', error);
    next(error);
  }
};

module.exports = {
  getHomeSlides
};
