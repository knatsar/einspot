import { useCallback, useEffect, useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMenuStore } from '@/stores/menu-operations-store';
import { withRetry } from '@/utils/retry';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DragHandleDots2Icon,
  TrashIcon,
  PlusIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons';

const menuItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  url: z.string().min(1, 'URL is required'),
  parent_id: z.string().nullable(),
  order: z.number(),
  icon: z.string().optional(),
});

type MenuItem = z.infer<typeof menuItemSchema>;

export function MenuManager() {
  const { toast } = useToast();
  const {
    items: menuItems,
    selectedItems,
    operations,
    initializeOperation,
    setOperationLoading,
    setOperationError,
    clearOperation,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    toggleSelected,
    clearSelected,
    reorderItems
  } = useMenuStore();

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const form = useForm<MenuItem>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      title: '',
      url: '',
      parent_id: null,
      order: 0,
      icon: '',
    },
  });

  const loadMenuItems = useCallback(async () => {
    const operationId = 'load-items';
    try {
      useMenuStore.getState().initializeOperation('create', operationId);
      
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('order');
        
        if (error) throw error;
        return data;
      }, {
        maxAttempts: 3,
        retryableErrors: (error) => {
          // Retry on network errors or specific Supabase errors
          return error.code === 'NETWORK_ERROR' || 
                 error.code === 'CONNECTION_ERROR' ||
                 error.code?.startsWith('20');
        }
      });

      setItems(result || []);
      useMenuStore.getState().clearOperation(operationId);
    } catch (error) {
      console.error('Error loading menu items:', error);
      useMenuStore.getState().setOperationError(operationId, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast, setItems]);

  const onSubmit = async (data: MenuItem) => {
    const operationId = editingItem?.id || 'new-item';
    const store = useMenuStore.getState();
    
    try {
      store.initializeOperation(
        editingItem?.id ? 'update' : 'create',
        operationId
      );

      // Apply optimistic update
      if (editingItem?.id) {
        store.updateItem(editingItem.id, data);
      } else {
        store.addItem({ ...data, id: operationId, order: store.items.length });
      }

      await withRetry(async () => {
        if (editingItem?.id) {
          const { error } = await supabase
            .from('menu_items')
            .update({
              title: data.title,
              url: data.url,
              parent_id: data.parent_id,
              icon: data.icon,
              updated_at: new Date().toISOString(),
            })
            .eq('id', editingItem.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('menu_items')
            .insert({
              ...data,
              order: store.items.length,
            });

          if (error) throw error;
        }
      }, {
        maxAttempts: 3,
        retryableErrors: (error) => {
          // Retry on network errors or specific Supabase errors
          return error.code === 'NETWORK_ERROR' || 
                 error.code === 'CONNECTION_ERROR' ||
                 error.code?.startsWith('20');
        }
      });

      store.clearOperation(operationId);
      form.reset();
      setEditingItem(null);
      
      toast({
        title: 'Success',
        description: editingItem?.id 
          ? 'Menu item updated successfully'
          : 'Menu item created successfully',
      });

      // Refresh the list to ensure consistency
      await loadMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      store.setOperationError(operationId, error as Error);
      
      // Revert optimistic update
      await loadMenuItems();
      
      toast({
        title: 'Error',
        description: 'Failed to save menu item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReorder = async (newOrder: MenuItem[]) => {
    try {
      // Update the order in the UI immediately
      setMenuItems(newOrder);

      // Prepare the updates
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      // Update the database
      const { error } = await supabase
        .from('menu_items')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Error reordering menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder menu items',
        variant: 'destructive',
      });
      // Reload the original order
      loadMenuItems();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
      loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full">
        <CardHeader>
          <CardTitle>Menu Management</CardTitle>
          <CardDescription>
            Create, edit, and arrange menu items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Menu Item Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon (Material Icon name)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current rounded-full animate-spin" />
                      {editingItem ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingItem ? 'Update Menu Item' : 'Add Menu Item'
                  )}
                </Button>
              </form>
            </Form>

            {/* Menu Items List */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Menu Items</h3>
              <Reorder.Group axis="y" values={menuItems} onReorder={handleReorder}>
                {menuItems.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className="flex items-center gap-4 p-3 bg-card rounded-lg shadow-sm mb-2"
                  >
                    <DragHandleDots2Icon className="cursor-move" />
                    <span className="flex-grow">{item.title}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingItem(item)}
                      >
                        <Pencil1Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => item.id && handleDelete(item.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </ErrorBoundary>
  );
}
