import { supabase } from '@/integrations/supabase/client';
import { rheemProductData } from '@/data/rheem-products';
import { useToast } from '@/hooks/use-toast';

export interface ProductImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export const importRheemProducts = async (): Promise<ProductImportResult> => {
  const result: ProductImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: []
  };

  try {
    console.log('Starting Rheem product import...');
    
    for (const product of rheemProductData) {
      try {
        // Check if product already exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('model_number', product.model_number)
          .single();

        if (existingProduct) {
          console.log(`Product ${product.model_number} already exists, skipping...`);
          result.skipped++;
          continue;
        }

        // Insert new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            image_url: product.image_url,
            gallery_images: product.gallery_images,
            specifications: product.specifications,
            features: product.features.join('\n'),
            model_number: product.model_number,
            brand: product.brand,
            is_featured: product.is_featured,
            show_price: product.show_price,
            stock_status: product.stock_status,
            installation_manual_url: product.installation_manual_url,
            meta_title: product.meta_title,
            meta_description: product.meta_description,
            meta_keywords: product.meta_keywords.join(', '),
            is_active: true,
            quote_available: true
          });

        if (error) {
          console.error(`Error importing ${product.model_number}:`, error);
          result.errors.push(`${product.model_number}: ${error.message}`);
        } else {
          console.log(`Successfully imported ${product.model_number}`);
          result.imported++;
        }
      } catch (productError) {
        console.error(`Error processing ${product.model_number}:`, productError);
        result.errors.push(`${product.model_number}: ${productError.message}`);
      }
    }

    result.success = result.errors.length === 0;
    console.log('Product import completed:', result);
    
    return result;
  } catch (error) {
    console.error('Product import failed:', error);
    result.errors.push(`Import failed: ${error.message}`);
    return result;
  }
};

// Function to update existing products with new data
export const updateRheemProducts = async (): Promise<ProductImportResult> => {
  const result: ProductImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: []
  };

  try {
    for (const product of rheemProductData) {
      try {
        const { error } = await supabase
          .from('products')
          .upsert({
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            image_url: product.image_url,
            gallery_images: product.gallery_images,
            specifications: product.specifications,
            features: product.features.join('\n'),
            model_number: product.model_number,
            brand: product.brand,
            is_featured: product.is_featured,
            show_price: product.show_price,
            stock_status: product.stock_status,
            installation_manual_url: product.installation_manual_url,
            meta_title: product.meta_title,
            meta_description: product.meta_description,
            meta_keywords: product.meta_keywords.join(', '),
            is_active: true,
            quote_available: true
          }, {
            onConflict: 'model_number'
          });

        if (error) {
          result.errors.push(`${product.model_number}: ${error.message}`);
        } else {
          result.imported++;
        }
      } catch (productError) {
        result.errors.push(`${product.model_number}: ${productError.message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    result.errors.push(`Update failed: ${error.message}`);
    return result;
  }
};

// Function to generate placeholder images for products
export const generateProductImages = async (): Promise<void> => {
  // This would integrate with an AI image generation service
  // For now, we'll use placeholder images from Pexels
  const placeholderImages = {
    'Water Heaters': 'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=800',
    'HVAC Systems': 'https://images.pexels.com/photos/5439137/pexels-photo-5439137.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Heat Pumps': 'https://images.pexels.com/photos/9875449/pexels-photo-9875449.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Plumbing Products': 'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Solar Systems': 'https://images.pexels.com/photos/9875449/pexels-photo-9875449.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Industrial Systems': 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Water Treatment': 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800'
  };

  // Update products with placeholder images if no image exists
  for (const product of rheemProductData) {
    const placeholderUrl = placeholderImages[product.category] || placeholderImages['HVAC Systems'];
    
    await supabase
      .from('products')
      .update({
        image_url: placeholderUrl
      })
      .eq('model_number', product.model_number)
      .is('image_url', null);
  }
};