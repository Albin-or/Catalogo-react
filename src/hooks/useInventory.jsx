import { useState, useEffect, useCallback, createContext, useContext } from 'react';  
import { supabase } from '../supabaseClient';

const InventoryContext = createContext(null);

function useInventoryState() {  
  const [products, setProducts] = useState([]);  
  const [models, setModels] = useState([]);  
  const [categories, setCategories] = useState([]);  
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);  
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [error, setError] = useState(null);

  // Helper para normalizar los datos del inventario (product_stocks)  
  const normalizeStockData = (stock, productId) => ({  
    product_id: productId,  
    brand_id: Number(stock?.brand_id),  
    store_id: stock?.store_id ?? '',  
    price_1: Number(stock?.price_1) || 0,  
    price_2: Number(stock?.price_2) || 0,  
    quantity: Number(stock?.quantity) || 0,  
  });

  // 1. Cargar Catálogos Iniciales (Modelos, Categorías, Almacenes)  
  const fetchMetadata = useCallback(async () => {  
    try {  
      const [modelsRes, categoriesRes, storesRes] = await Promise.all([  
        supabase.from('models').select('id, label').order('label'),  
        supabase.from('categories').select('id, label').order('label'),  
        supabase.from('stores').select('id, label').order('label')  
      ]);

      if (modelsRes.error) throw modelsRes.error;  
      if (categoriesRes.error) throw categoriesRes.error;  
      if (storesRes.error) throw storesRes.error;

      setModels(modelsRes.data || []);  
      setCategories(categoriesRes.data || []);  
      setStores(storesRes.data || []);  
    } catch (err) {  
      console.error('Error cargando catálogos:', err);  
      setError(err.message || 'Error al cargar catálogos iniciales');  
    }  
  }, []);

  // 2. Cargar Productos con sus Existencias y Marcas (Relación Anidada)  
  const fetchProducts = useCallback(async () => {  
    setLoading(true);  
    setError(null);  
    try {  
      const { data, error: supabaseError } = await supabase  
        .from('products')  
        .select(`
          id, 
          part_number, 
          name, 
          description, 
          model_id, 
          model_ids, 
          category_id, 
          image_url, 
          created_at, 
          product_stocks ( 
            id, 
            brand_id, 
            store_id, 
            price_1, 
            price_2, 
            quantity, 
            brands ( id, name ) 
          )
        `)  
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;  
      setProducts(data || []);  
    } catch (err) {  
      console.error(err);  
      setError(err.message || 'Error al cargar los productos');  
    } finally {  
      setLoading(false);  
    }  
  }, []);

  // Inicialización de datos al montar el componente  
  useEffect(() => {  
    async function init() {  
      await fetchMetadata();  
      await fetchProducts();  
    }  
    init();  
  }, [fetchMetadata, fetchProducts]);

  // 3. Añadir Producto Nuevo con sus Existencias  
  const addProduct = async (productData) => {  
    setIsSubmitting(true);  
    setError(null);  
    try {  
      const { product_stocks, ...newProduct } = productData;
      const trimmedPartNumber = newProduct.part_number?.trim() || '';

      const selectedModelIds = Array.isArray(productData.model_ids)
        ? Array.from(new Set(productData.model_ids.map(id => String(id)).filter(Boolean)))
        : [];

      if (trimmedPartNumber) {
        const { data: existingProducts, error: partNumberCheckError } = await supabase
          .from('products')
          .select('id')
          .eq('part_number', trimmedPartNumber);

        if (partNumberCheckError) throw partNumberCheckError;

        if (Array.isArray(existingProducts) && existingProducts.length > 0) {
          const duplicateError = new Error('El número de parte ya existe. No se puede agregar un producto duplicado.');
          setError(duplicateError.message);
          return { success: false, error: duplicateError };
        }
      }

      const normalizedProduct = {  
        part_number: trimmedPartNumber,  
        name: newProduct.name,  
        description: newProduct.description,  
        model_id: selectedModelIds[0] || newProduct.model_id || null,  
        model_ids: selectedModelIds,
        category_id: newProduct.category_id,  
        image_url: newProduct?.image_url?.trim() || null,  
      };

      const { data: mainProduct, error: prodError } = await supabase 
        .from('products') 
        .insert([normalizedProduct]) 
        .select() 
        .single();

      if (prodError) throw prodError;

      let finalStocks = [];  
      if (product_stocks && product_stocks.length > 0) {  
        const stocksWithId = product_stocks.map((stock) => normalizeStockData(stock, mainProduct.id));  
        const { data: insertedStocks, error: stocksError } = await supabase  
          .from('product_stocks')  
          .insert(stocksWithId)  
          .select(`
            id, 
            brand_id, 
            store_id, 
            price_1, 
            price_2, 
            quantity, 
            brands ( id, name )
          `);

        if (stocksError) throw stocksError;  
        finalStocks = insertedStocks || [];  
      }

      const fullProduct = { ...mainProduct, product_stocks: finalStocks };  
      setProducts(prevProducts => [fullProduct, ...prevProducts]);  
      return { success: true };  
    } catch (err) {  
      console.error(err);  
      setError(err.message || 'Error al añadir el producto');  
      return { success: false, error: err };  
    } finally {  
      setIsSubmitting(false);  
    }  
  };

  // 4. Actualizar Producto e Inventario  
  const updateProduct = async (updatedProduct) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { id, ...payload } = updatedProduct;

      // Saneamos los datos para actualizar ÚNICAMENTE la información del producto
      const normalizedPayload = {
        part_number: payload.part_number,
        name: payload.name,
        description: payload.description,
        model_id: payload.model_id,
        category_id: payload.category_id,
        image_url: payload?.image_url?.trim() || null,
      };

      const { data: mainProductData, error: prodError } = await supabase
        .from('products')
        .update(normalizedPayload)
        .eq('id', id)
        .select();

      if (prodError) throw prodError;
      
      const updatedMainProduct = Array.isArray(mainProductData) && mainProductData.length > 0 
        ? mainProductData[0] 
        : { id, ...normalizedPayload };

      // Actualizamos el estado local mezclando la info base nueva con el stock que ya existía
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === id) {
          return {
            ...p,                 // Conserva intacto el arreglo 'product_stocks' actual
            ...updatedMainProduct // Pisa los datos base editados (nombre, nro de parte, etc.)
          };
        }
        return p;
      }));

      return { success: true };
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al actualizar el producto');
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Eliminar Producto (Borra existencias automáticamente por CASCADE)  
  const deleteProduct = async (productId) => {  
    setError(null);  
    try {  
      const { error: supabaseError } = await supabase  
        .from('products')  
        .delete()  
        .eq('id', productId);

      if (supabaseError) throw supabaseError;  
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));  
      return { success: true };  
    } catch (err) {  
      console.error(err);  
      setError(err.message || 'Error al eliminar el producto');  
      return { success: false, error: err };  
    }  
  };

  // 6. Añadir una existencia directa de Almacén/Marca a un producto existente  
  const addStockToProduct = async (productId, stockData) => {  
    setIsSubmitting(true);  
    setError(null);  
    try {  
      const newStockRow = normalizeStockData(stockData, productId);

      const { data, error: supabaseError } = await supabase  
        .from('product_stocks')  
        .insert([newStockRow])  
        .select(`
          id, 
          brand_id, 
          store_id, 
          price_1, 
          price_2, 
          quantity, 
          brands ( id, name )
        `)  
        .single();

      if (supabaseError) throw supabaseError;

      setProducts(prevProducts => prevProducts.map(product => {  
        if (product.id === productId) {  
          return {  
            ...product,  
            product_stocks: [...(product.product_stocks || []), data]  
          };  
        }  
        return product;  
      }));

      return { success: true, data };  
    } catch (err) {  
      console.error(err);  
      setError(err.message || 'Error al añadir inventario');  
      return { success: false, error: err };  
    } finally {  
      setIsSubmitting(false);  
    }  
  };

  const restockProduct = async (stocksArray) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!Array.isArray(stocksArray) || stocksArray.length === 0) {
        return { success: false, error: 'No hay existencias para cargar' };
      }

      const promises = stocksArray.map((stock) =>
        supabase.rpc('upsert_product_stock_v2', {
          p_product_id: Number(stock.product_id),
          p_brand_id: Number(stock.brand_id),
          p_store_id: stock.store_id,
          p_price_1: Number(stock.price_1) || 0,
          p_price_2: Number(stock.price_2) || 0,
          p_quantity_to_add: Number(stock.quantity) || 0,
        })
      );

      await Promise.all(promises);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError(err.message || 'Error en el proceso de cargo');
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutInventory = async (cartItems) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return { success: false, error: 'No hay artículos para descartar' };
      }

      const promises = cartItems.map((item) =>
        supabase.rpc('decrease_product_stock_v2', {
          p_stock_id: Number(item.stock_id),
          p_quantity_to_sub: Number(item.quantity),
        })
      );

      await Promise.all(promises);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      console.error('Error en el descargo de inventario:', err);
      setError(err.message || 'Error al procesar el descargo');
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBrand = async (brandName) => {
    try {
      const trimmedName = brandName?.trim();
      if (!trimmedName) return { success: false, error: 'El nombre no puede estar vacío' };

      // Insertamos la nueva marca en la base de datos
      const { data, error: supabaseError } = await supabase
        .from('brands')
        .insert([{ name: trimmedName }])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Retornamos la marca creada para que el componente frontend la use de inmediato
      return { success: true, data };
    } catch (err) {
      console.error('Error al crear marca:', err);
      return { success: false, error: err.message };
    }
  };



  return {  
    products,  
    models,  
    categories,  
    stores,  
    loading,  
    isSubmitting,  
    error,  
    refetch: fetchProducts,  
    addProduct,  
    updateProduct,  
    deleteProduct,  
    addStockToProduct,
    restockProduct,
    checkoutInventory,
    addBrand
  };  
}

export function InventoryProvider({ children }) {
  const value = useInventoryState();

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  return context ?? useInventoryState();
}