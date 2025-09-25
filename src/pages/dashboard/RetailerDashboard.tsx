import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Store, ShoppingCart, Package, TrendingUp, User, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/hooks/useInventory";
import { useProfile } from "@/hooks/useProfile";
import ProfileDialog from "@/components/ProfileDialog";

const RetailerDashboard = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { profile, revenue } = useProfile();
  const { purchases, purchaseFromDistributor, fetchAvailableInventory } = useInventory();
  const [availableInventory, setAvailableInventory] = useState<any[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const inventory = await fetchAvailableInventory();
      setAvailableInventory(inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handlePurchase = async () => {
    if (!selectedInventory || !purchaseQuantity) return;

    const quantity = parseInt(purchaseQuantity);
    if (quantity <= 0 || quantity > selectedInventory.quantity_available) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity within available stock.",
        variant: "destructive",
      });
      return;
    }

    try {
      await purchaseFromDistributor(selectedInventory.id, quantity);
      
      // Update local state immediately for better UX
      setAvailableInventory(prev => 
        prev.map(item => 
          item.id === selectedInventory.id 
            ? { ...item, quantity_available: item.quantity_available - quantity }
            : item
        ).filter(item => item.quantity_available > 0)
      );
      
      toast({
        title: "Purchase Successful",
        description: `Successfully purchased ${quantity} kg.`,
      });

      setSelectedInventory(null);
      setPurchaseQuantity("");
      
      // Refetch from server after a short delay to ensure consistency
      setTimeout(() => {
        fetchInventory();
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete purchase. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getQualityBadge = (grade: string) => {
    switch(grade) {
      case 'A': return <Badge variant="quality-a">Grade A</Badge>;
      case 'B': return <Badge variant="quality-b">Grade B</Badge>;
      case 'C': return <Badge variant="quality-c">Grade C</Badge>;
      default: return <Badge variant="unverified">No Grade</Badge>;
    }
  };

  const totalSpent = purchases.reduce((acc, purchase) => acc + purchase.total_cost, 0);
  const totalQuantity = purchases.reduce((acc, purchase) => acc + purchase.quantity_purchased, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile?.full_name || 'Retailer'}!
            </h1>
            <p className="text-muted-foreground">Purchase crops from distributors for retail sales</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg">
                <User className="w-5 h-5 mr-2" />
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={signOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity} kg</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{revenue.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          </TabsList>
          
          <TabsContent value="marketplace" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Available Inventory</h2>
              {loading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Loading available inventory...</p>
                  </CardContent>
                </Card>
              ) : availableInventory.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No inventory available at the moment.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableInventory.map((item: any) => (
                    <Card key={item.id} className="shadow-elegant">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{item.batch.crop_name}</CardTitle>
                          {getQualityBadge(item.batch.quality_grade)}
                        </div>
                        <CardDescription>
                          {item.profiles?.company_name || item.profiles?.full_name || 'Distributor'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available:</span>
                            <span>{item.quantity_available} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price per kg:</span>
                            <span className="font-semibold">₹{item.selling_price_per_kg}</span>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full mt-4" 
                              onClick={() => setSelectedInventory(item)}
                            >
                              Purchase
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Purchase {selectedInventory?.batch.crop_name}</DialogTitle>
                              <DialogDescription>
                                Enter the quantity you want to purchase
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="quantity">Quantity (kg)</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  value={purchaseQuantity}
                                  onChange={(e) => setPurchaseQuantity(e.target.value)}
                                  placeholder="Enter quantity"
                                  max={selectedInventory?.quantity_available}
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                  Available: {selectedInventory?.quantity_available} kg
                                </p>
                              </div>
                              {purchaseQuantity && (
                                <div className="p-4 bg-muted rounded-lg">
                                  <p className="text-sm">
                                    <strong>Total Cost:</strong> ₹{(parseInt(purchaseQuantity) * (selectedInventory?.selling_price_per_kg || 0)).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              )}
                              <Button onClick={handlePurchase} className="w-full">
                                Confirm Purchase
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="purchases">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Purchase History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="shadow-elegant">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{purchase.batch.crop_name}</CardTitle>
                        <Badge variant="success">Purchased</Badge>
                      </div>
                      <CardDescription>Order ID: {purchase.id.slice(0, 8)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span>{purchase.quantity_purchased} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Cost:</span>
                          <span className="font-semibold text-success">₹{purchase.total_cost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality:</span>
                          <span>Grade {purchase.batch.quality_grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span>{new Date(purchase.purchase_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog 
        open={isProfileDialogOpen} 
        onOpenChange={setIsProfileDialogOpen} 
      />
    </div>
  );
};

export default RetailerDashboard;