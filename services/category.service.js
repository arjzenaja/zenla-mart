const { readData, writeData, generateId } = require('../utils/dataHelper.util');

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
  const categories = await readData('categories.json');
  return categories;
};

const getCategoryById = async (id) => {
  const categories = await readData('categories.json');
  const category = categories.find(c => c.id === id);
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  return category;
};

const createCategory = async (categoryData) => {
  const categories = await readData('categories.json');
  
  const newCategory = {
    id: generateId(),
    name: categoryData.name,
    slug: generateSlug(categoryData.name),
    description: categoryData.description || '',
    image: categoryData.image || '',
    isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  categories.push(newCategory);
  await writeData('categories.json', categories);
  
  return newCategory;
};

const updateCategory = async (id, updateData) => {
  const categories = await readData('categories.json');
  const categoryIndex = categories.findIndex(c => c.id === id);
  
  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  // Generate new slug if name is being updated
  const updatedData = { ...updateData };
  if (updateData.name) {
    updatedData.slug = generateSlug(updateData.name);
  }

  categories[categoryIndex] = {
    ...categories[categoryIndex],
    ...updatedData,
    updatedAt: new Date().toISOString()
  };

  await writeData('categories.json', categories);
  
  return categories[categoryIndex];
};

const deleteCategory = async (id) => {
  const categories = await readData('categories.json');
  const categoryIndex = categories.findIndex(c => c.id === id);
  
  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  categories.splice(categoryIndex, 1);
  await writeData('categories.json', categories);
  
  return true;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
