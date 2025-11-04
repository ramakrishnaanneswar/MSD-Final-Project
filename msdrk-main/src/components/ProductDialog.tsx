import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  description: z.string().max(500).optional(),
  sku: z.string().max(50).optional(),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  unit_price: z.number().min(0, "Price must be 0 or greater"),
  reorder_level: z.number().min(0, "Reorder level must be 0 or greater"),
});

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  reorder_level: number | null;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

const ProductDialog = ({ open, onOpenChange, product }: ProductDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    quantity: 0,
    unit_price: 0,
    reorder_level: 10,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        sku: product.sku || "",
        quantity: product.quantity,
        unit_price: product.unit_price,
        reorder_level: product.reorder_level || 10,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        sku: "",
        quantity: 0,
        unit_price: 0,
        reorder_level: 10,
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = productSchema.parse(formData);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            ...validatedData,
            description: validatedData.description || null,
            sku: validatedData.sku || null,
          })
          .eq("id", product.id);

        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert({
          name: validatedData.name,
          description: validatedData.description || null,
          sku: validatedData.sku || null,
          quantity: validatedData.quantity,
          unit_price: validatedData.unit_price,
          reorder_level: validatedData.reorder_level,
          user_id: user.id,
        });

        if (error) throw error;
        toast.success("Product created successfully");
      }

      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to save product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product information below."
              : "Fill in the details to add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unit_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level *</Label>
              <Input
                id="reorder_level"
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_level: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Alert when quantity falls below this level
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
