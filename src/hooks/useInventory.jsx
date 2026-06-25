import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }); // Mejora: Muestra siempre lo más nuevo primero

      if (supabaseError) throw supabaseError;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const addProduct = async (newProduct) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (supabaseError) throw supabaseError;
      
      if (data && data.length > 0) {
        setProducts(prevProducts => [data[0], ...prevProducts]); // Lo añade al inicio de la lista
        return { success: true };
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message || 'Error al añadir el producto');
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProduct = async (updatedProduct) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Separación segura: extraemos el id y agrupamos el resto en 'payload'
      const { id, ...payload } = updatedProduct;

      const { data, error: supabaseError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select();

      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === id ? data[0] : p)
        );
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Error al actualizar el producto');
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  };

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
      console.error('Error deleting product:', err);
      setError(err.message || 'Error al eliminar el producto');
      return { success: false, error: err };
    }
  };

  return { 
    products, 
    loading, 
    isSubmitting, 
    error, 
    refetch: fetchProducts,
    addProduct, 
    updateProduct, 
    deleteProduct 
  };
}
