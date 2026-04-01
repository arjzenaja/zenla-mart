const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../services/category.service');

const getCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

const createCategoryHandler = async (req, res, next) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const newCategory = await createCategory({
      name,
      description,
      image,
      isActive
    });
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (error) {
    next(error);
  }
};

const updateCategoryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCategory = await updateCategory(id, updateData);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategoryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await deleteCategory(id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler
};
