import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { importRheemProducts, updateRheemProducts, generateProductImages, type ProductImportResult } from '@/utils/productDataImporter';
import { rheemProductData } from '@/data/rheem-products';
import { Download, Upload, RefreshCw, Package, CheckCircle, AlertCircle } from 'lucide-react';

const AdminProductImporter = () => {
  const [importing, setImporting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [importResult, setImportResult] = useState<ProductImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleImportProducts = async () => {
    setImporting(true);
    setProgress(0);
    setImportResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await importRheemProducts();
      
      clearInterval(progressInterval);
      setProgress(100);
      setImportResult(result);

      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.imported} products successfully`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `Imported ${result.imported} products, ${result.errors.length} errors`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import products. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateProducts = async () => {
    setUpdating(true);
    try {
      const result = await updateRheemProducts();
      setImportResult(result);

      if (result.success) {
        toast({
          title: "Update Successful",
          description: `Updated ${result.imported} products successfully`,
        });
      } else {
        toast({
          title: "Update Completed with Errors",
          description: `Updated ${result.imported} products, ${result.errors.length} errors`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update products. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateImages = async () => {
    setGeneratingImages(true);
    try {
      await generateProductImages();
      toast({
        title: "Images Generated",
        description: "Product placeholder images have been generated",
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Image Generation Failed",
        description: "Failed to generate product images",
        variant: "destructive",
      });
    } finally {
      setGeneratingImages(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rheem Product Importer</h2>
          <p className="text-muted-foreground">Import official Rheem product catalog data</p>
        </div>
      </div>

      {/* Product Data Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rheemProductData.length}</div>
            <p className="text-xs text-muted-foreground">Ready to import</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(rheemProductData.map(p => p.category))].length}
            </div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Featured Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rheemProductData.filter(p => p.is_featured).length}
            </div>
            <p className="text-xs text-muted-foreground">Featured items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Price Hidden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rheemProductData.filter(p => !p.show_price).length}
            </div>
            <p className="text-xs text-muted-foreground">Contact for price</p>
          </CardContent>
        </Card>
      </div>

      {/* Import Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Import New Products
            </CardTitle>
            <CardDescription>
              Import all Rheem products into the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleImportProducts} 
              disabled={importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Import Products
                </>
              )}
            </Button>
            
            {importing && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  Importing products... {progress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Update Existing
            </CardTitle>
            <CardDescription>
              Update existing products with latest data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleUpdateProducts} 
              disabled={updating}
              variant="outline"
              className="w-full"
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Update Products
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Generate Images
            </CardTitle>
            <CardDescription>
              Generate placeholder images for products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGenerateImages} 
              disabled={generatingImages}
              variant="outline"
              className="w-full"
            >
              {generatingImages ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Generate Images
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Errors:</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Categories Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>
            Preview of Rheem product categories to be imported
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...new Set(rheemProductData.map(p => p.category))].map(category => {
              const categoryProducts = rheemProductData.filter(p => p.category === category);
              return (
                <div key={category} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{category}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {categoryProducts.length} products
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {categoryProducts.slice(0, 3).map(product => (
                      <Badge key={product.id} variant="outline" className="text-xs">
                        {product.model_number}
                      </Badge>
                    ))}
                    {categoryProducts.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{categoryProducts.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductImporter;