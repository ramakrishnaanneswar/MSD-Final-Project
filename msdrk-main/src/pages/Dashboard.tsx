import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  totalQuantity: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    lowStockItems: 0,
    totalValue: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("*");

      if (error) throw error;

      if (products) {
        const totalValue = products.reduce(
          (sum, p) => sum + (p.quantity * p.unit_price),
          0
        );
        const lowStock = products.filter(
          (p) => p.quantity <= (p.reorder_level || 10)
        ).length;
        const totalQty = products.reduce((sum, p) => sum + p.quantity, 0);

        setStats({
          totalProducts: products.length,
          lowStockItems: lowStock,
          totalValue,
          totalQuantity: totalQty,
        });
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "Total Inventory Value",
      value: `$${stats.totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Total Quantity",
      value: stats.totalQuantity,
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your inventory management system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : card.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Navigate to the <strong>Products</strong> page to manage your inventory,
              add new products, or update existing ones.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
