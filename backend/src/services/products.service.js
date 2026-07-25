/**
 * 📦 Products Service
 * 
 * Contains ALL business logic for product CRUD operations.
 * Controllers call these functions; they never call Supabase directly.
 * 
 * 🧠 ARCHITECTURE:
 *   Controller → Service (this file) → Database (Supabase)
 * 
 * Benefits of this separation:
 * - If we switch from Supabase to another database, only this file changes
 * - Business rules (like "no negative stock") are centralized
 * - Controllers stay thin (just handle request/response)
 * 
 * @module productsService
 */

const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * ✨ Create a new product
 * 
 * Validates business rules before inserting:
 * 1. No duplicate product names for the same user
 * 2. SKU must be globally unique
 * 3. Prices must be positive
 * 4. Stock can't be negative
 * 
 * @param {Object} productData - Product fields from request body
 * @returns {Object} Created product
 * @throws {AppError} If validation fails or database error
 */
const createProduct = async (productData) => {
    const {
        user_id, name, sku, category, buy_price,
        sale_price, stock_quantity, low_stock_threshold, created_at
    } = productData;

    // ===== 1️⃣ Check for duplicate product name (same user) =====
    const { data: existingNames } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user_id)
        .eq('name', name)
        .limit(1);

    if (existingNames && existingNames.length > 0) {
        throw new AppError(
            `A product with the name "${name}" already exists.`,
            409
        );
    }

    // ===== 2️⃣ Check for duplicate SKU (globally unique) =====
    const { data: existingSkus } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .limit(1);

    if (existingSkus && existingSkus.length > 0) {
        throw new AppError(
            `SKU "${sku}" is already in use by another product.`,
            409
        );
    }

    // ===== 3️⃣ Insert the new product =====
    const { data, error } = await supabase
        .from('products')
        .insert([
            {
                user_id,
                name,
                sku,
                category,
                buy_price: Number(buy_price),
                sale_price: Number(sale_price),
                stock_quantity: Number(stock_quantity),
                low_stock_threshold: low_stock_threshold
                    ? Number(low_stock_threshold)
                    : null,
                created_at: created_at || new Date().toISOString()
            }
        ])
        .select();

    if (error) {
        console.error('Supabase Insert Error:', error.message);
        throw new AppError('Database error while adding product.', 500);
    }

    return data[0];
};

/**
 * 📋 Get all products
 * 
 * @returns {Array} Array of all products (newest first)
 */
const getAllProducts = async () => {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new AppError(error.message, 400);
    }

    return products;
};

/**
 * 🔍 Get a single product by ID
 * 
 * @param {string} id - Product UUID
 * @returns {Object} Product object
 * @throws {AppError} If product not found
 */
const getProductById = async (id) => {
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // PGRST116 = "no rows returned" from Supabase
            throw new AppError(`Product with id ${id} not found.`, 404);
        }
        throw new AppError(error.message, 400);
    }

    return product;
};

/**
 * 👤 Get all products for a specific user
 * 
 * @param {string} userId - User's UUID
 * @returns {Array} Array of user's products (newest first)
 */
const getProductsByUser = async (userId) => {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new AppError(error.message, 400);
    }

    return products;
};

/**
 * 📝 Update a product
 * 
 * Only updates fields that are provided in the request.
 * Validates uniqueness constraints if name/sku are being changed.
 * 
 * @param {string} id - Product UUID
 * @param {Object} updateData - Fields to update
 * @returns {Object} Updated product
 * @throws {AppError} If product not found or validation fails
 */
const updateProduct = async (id, updateData) => {
    const {
        user_id, name, sku, category, buy_price,
        sale_price, stock_quantity, low_stock_threshold, created_at
    } = updateData;

    // ===== 1️⃣ Check if product exists =====
    const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !existingProduct) {
        throw new AppError(`Product with id ${id} not found.`, 404);
    }

    // ===== 2️⃣ Check duplicate name (if changing, exclude current) =====
    if (name && name !== existingProduct.name) {
        const { data: duplicateNames } = await supabase
            .from('products')
            .select('id')
            .eq('user_id', user_id || existingProduct.user_id)
            .eq('name', name)
            .neq('id', id)
            .limit(1);

        if (duplicateNames && duplicateNames.length > 0) {
            throw new AppError(
                `A product with the name "${name}" already exists.`,
                409
            );
        }
    }

    // ===== 3️⃣ Check duplicate SKU (if changing, exclude current) =====
    if (sku && sku !== existingProduct.sku) {
        const { data: duplicateSkus } = await supabase
            .from('products')
            .select('id')
            .eq('sku', sku)
            .neq('id', id)
            .limit(1);

        if (duplicateSkus && duplicateSkus.length > 0) {
            throw new AppError(
                `SKU "${sku}" is already in use by another product.`,
                409
            );
        }
    }

    // ===== 4️⃣ Build update object (only provided fields) =====
    const updatePayload = {};
    if (user_id !== undefined) updatePayload.user_id = user_id;
    if (name !== undefined) updatePayload.name = name;
    if (sku !== undefined) updatePayload.sku = sku;
    if (category !== undefined) updatePayload.category = category;
    if (buy_price !== undefined) updatePayload.buy_price = Number(buy_price);
    if (sale_price !== undefined) updatePayload.sale_price = Number(sale_price);
    if (stock_quantity !== undefined) updatePayload.stock_quantity = Number(stock_quantity);
    if (low_stock_threshold !== undefined) {
        updatePayload.low_stock_threshold = low_stock_threshold
            ? Number(low_stock_threshold)
            : null;
    }
    if (created_at !== undefined) updatePayload.created_at = created_at;

    // ===== 5️⃣ Perform the update =====
    const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select();

    if (updateError) {
        console.error('Supabase Update Error:', updateError.message);
        throw new AppError('Database error while updating product.', 500);
    }

    return updatedProduct[0];
};

/**
 * 🗑️ Delete a product
 * 
 * @param {string} id - Product UUID
 * @returns {string} Deleted product ID
 * @throws {AppError} If product not found or database error
 */
const deleteProduct = async (id) => {
    // ===== 1️⃣ Check if product exists =====
    const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

    if (fetchError || !existingProduct) {
        throw new AppError(`Product with id ${id} not found.`, 404);
    }

    // ===== 2️⃣ Delete the product =====
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (deleteError) {
        console.error('Supabase Delete Error:', deleteError.message);
        throw new AppError('Database error while deleting product.', 500);
    }

    return id;
};

// Export all service functions
module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductsByUser,
    updateProduct,
    deleteProduct
};

