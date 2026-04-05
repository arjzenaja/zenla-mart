const prisma = require('../utils/prisma');

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
};

const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id }
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  return category;
};

const createCategory = async (categoryData) => {
  const slug = generateSlug(categoryData.name);
  
  return await prisma.category.create({
    data: {
      name: categoryData.name,
      slug,
      description: categoryData.description || '',
      image: categoryData.image || '',
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true
    }
  });
};

const updateCategory = async (id, updateData) => {
  const data = { ...updateData };
  if (updateData.name) {
    data.slug = generateSlug(updateData.name);
  }

  return await prisma.category.update({
    where: { id },
    data
  });
};

const deleteCategory = async (id) => {
  await prisma.category.delete({
    where: { id }
  });
  return true;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
