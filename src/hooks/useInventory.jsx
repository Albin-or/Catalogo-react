import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

    const models = [
    { id: 'corolla', label: 'Corolla' },
    { id: 'yaris', label: 'Yaris' },
    { id: 'camry', label: 'Camry' },
    { id: 'terios', label: 'Terios' },
    { id: 'starlet', label: 'Starlet' },
    { id: 'hilux', label: 'Hilux' },
    { id: 'fortuner', label: 'Fortuner' },
    { id: '4runner', label: '4Runner' },
    { id: 'meru', label: 'Meru' },
    { id: 'prado', label: 'Prado' },
    { id: 'autana', label: 'Autana' },
    { id: 'landcruiser', label: 'Land Cruiser' }
  ];

  const categories = [
    { id: 'filtros', label: 'Filtros' },
    { id: 'aceite', label: 'Aceite' },
    { id: 'motor', label: 'Motor' },
    { id: 'suspension', label: 'Suspensión' },
    { id: 'gasolina', label: 'Gasolina' },
    { id: 'electrico', label: 'Eléctrico' },
    { id: 'croche', label: 'Embragues / Croches' },
    { id: 'direccion', label: 'Dirección hidraulica' },
    { id: 'carroceria', label: 'Carrocería' },
    { id: 'otros', label: 'Otros' },
  ];

  const stores = [
    { id: 'almacen1', label: 'Almacén Toyosur' },
    { id: 'almacen2', label: 'Toyocars Delicias' },
  ];

  const normalizeBrandData = (brand, productId) => ({
    product_id: productId,
    marca: brand?.marca ?? '',
    precio1: Number(brand?.precio1) || 0,
    precio2: Number(brand?.precio2) || 0,
    cantidad: Number(brand?.cantidad) || 0,
    almacen: brand?.almacen ?? '',
  });
  
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select(`
          id,
          numero_parte,
          nombre,
          descripcion,
          modelo,
          categoria,
          imagen,
          imagen,
          created_at,
          product_brands (
            id,
            marca,
            precio1,
            precio2,
            cantidad,
            almacen
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const addProduct = async (productData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { product_brands, almacen: _productStore, ...newProduct } = productData;
      const normalizedProduct = {
        ...newProduct,
        imagen: newProduct?.imagen?.trim() || null,
      };

      const { data: mainProduct, error: prodError } = await supabase
        .from('products')
        .insert([normalizedProduct])
        .select()
        .single();

      if (prodError) throw prodError;
      
      let finalBrands = [];
      
      if (product_brands && product_brands.length > 0) {
        const brandsWithId = product_brands.map((brand) => normalizeBrandData(brand, mainProduct.id));

        const { data: insertedBrands, error: brandsError } = await supabase
          .from('product_brands')
          .insert(brandsWithId)
          .select();

        if (brandsError) throw brandsError;
        finalBrands = insertedBrands || [];
      }

      const fullProduct = { ...mainProduct, product_brands: finalBrands };
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

  const updateProduct = async (updatedProduct) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { id, product_brands, almacen: _productStore, ...payload } = updatedProduct;

      const { data: mainProductData, error: prodError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select();

      if (prodError) throw prodError;

      const mainProduct = Array.isArray(mainProductData) && mainProductData.length > 0
        ? mainProductData[0]
        : { id, ...payload };

      const { error: deleteError } = await supabase
        .from('product_brands')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      let finalBrands = [];
      
      if (product_brands && product_brands.length > 0) {
        const brandsWithId = product_brands.map((brand) => normalizeBrandData(brand, id));

        const { data: insertedBrands, error: brandsError } = await supabase
          .from('product_brands')
          .insert(brandsWithId)
          .select();

        if (brandsError) throw brandsError;
        finalBrands = insertedBrands || [];
      }

      const fullProduct = { ...mainProduct, product_brands: finalBrands };
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === id ? fullProduct : p)
      );
      return { success: true };

    } catch (err) {
      console.error(err);
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
      console.error(err);
      setError(err.message || 'Error al eliminar el producto');
      return { success: false, error: err };
    }
  };
  
  const addBrandToProduct = async (productId, brandData) => {
  setIsSubmitting(true);
  setError(null);
  try {
    // 1. Estructuramos el nuevo registro apuntando al producto
    const newBrandRow = {
      product_id: productId,
      marca: brandData?.marca ?? '',
      precio1: Number(brandData?.precio1) || 0,
      precio2: Number(brandData?.precio2) || 0,
      cantidad: Number(brandData?.cantidad) || 0,
    };

    // 2. Insertamos la nueva fila directamente en la tabla de marcas
    const { data, error: supabaseError } = await supabase
      .from('product_brands')
      .insert([newBrandRow])
      .select()
      .single();

    if (supabaseError) throw supabaseError;

    // 3. Actualizamos el estado local de React de forma inmutable
    setProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            // Mantenemos las marcas existentes y adicionamos la nueva que devolvió Supabase
            product_brands: [...(product.product_brands || []), data]
          };
        }
        return product;
      })
    );

    return { success: true, data };
  } catch (err) {
    console.error(err);
    setError(err.message || 'Error al añadir la marca');
    return { success: false, error: err };
  } finally {
    setIsSubmitting(false);
  }
};


  return { 
    products, 
    loading, 
    isSubmitting, 
    error,
    stores,
    categories,
    models, 
    refetch: fetchProducts,
    addProduct, 
    updateProduct, 
    deleteProduct,
    addBrandToProduct 
  };
}
