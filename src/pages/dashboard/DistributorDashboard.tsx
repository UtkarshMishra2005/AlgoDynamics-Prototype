import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Truck, DollarSign, Package, TrendingUp, User, LogOut, Settings, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useBatches } from "@/hooks/useBatches";
import { useBids } from "@/hooks/useBids";
import { useInventory } from "@/hooks/useInventory";
import ProfileDialog from "@/components/ProfileDialog";

const DistributorDashboard = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { profile, revenue } = useProfile();
  const { batches } = useBatches();
  const { bids, placeBid } = useBids();
  const { inventory, refetchInventory } = useInventory();
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh inventory every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (refetchInventory) {
        refetchInventory();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchInventory]);

  const handleRefreshInventory = async () => {
    if (!refetchInventory) return;
    
    setRefreshing(true);
    try {
      await refetchInventory();
      toast({
        title: "Inventory Refreshed",
        description: "Your inventory has been updated with the latest data.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh inventory. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!selectedBatch || !bidAmount) return;

    const bidValue = parseFloat(bidAmount);
    if (bidValue <= 0) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      await placeBid(selectedBatch.id, bidValue);
      
      toast({
        title: "Bid Placed Successfully",
        description: `Your bid of ₹${bidValue} has been placed for batch ${selectedBatch.id.slice(0, 8)}.`,
      });

      setSelectedBatch(null);
      setBidAmount("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getQualityBadge = (grade: string) => {
    switch(grade) {
      case 'A': return <Badge variant="verified">Grade A</Badge>;
      case 'B': return <Badge variant="success">Grade B</Badge>;
      case 'C': return <Badge variant="warning">Grade C</Badge>;
      default: return <Badge variant="unverified">No Grade</Badge>;
    }
  };

  // Filter batches available for bidding (verified, not sold, not owned by current distributor)
  const availableBatches = batches.filter(b => 
    b.verification_status === "verified" && 
    b.is_available_for_sale && 
    !b.is_sold
  );

  const myBids = bids.filter(bid => bid.status === 'active');
  const totalInventory = inventory.reduce((acc, item) => acc + Number(item.quantity_available), 0);
  const totalInvestment = inventory.reduce((acc, item) => acc + Number(item.purchase_price), 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Distributor Dashboard</h1>
            <p className="text-muted-foreground">Bid on verified crops and manage wholesale distribution</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myBids.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won Batches</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInventory} kg</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalInvestment.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="inventory">My Inventory</TabsTrigger>
            <TabsTrigger value="bids">My Bids</TabsTrigger>
          </TabsList>
          
          <TabsContent value="marketplace" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Available Verified Batches</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBatches.map((batch) => (
                <Card key={batch.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{batch.crop_name}</CardTitle>
                      {getQualityBadge(batch.quality_grade || 'unknown')}
                    </div>
                    <CardDescription>Batch ID: {batch.id.slice(0, 8)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{batch.quantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{batch.farm_location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harvest Date:</span>
                        <span>{new Date(batch.harvest_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-semibold text-success">Available for Bidding</span>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          variant="hero"
                          onClick={() => setSelectedBatch(batch)}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Place Bid
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Place Bid - {batch.crop_name}</DialogTitle>
                          <DialogDescription>
                            Enter your bid for batch {batch.id.slice(0, 8)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Batch Details</Label>
                            <div className="p-3 bg-secondary rounded-md">
                              <p><strong>Crop:</strong> {batch.crop_name}</p>
                              <p><strong>Quantity:</strong> {batch.quantity} kg</p>
                              <p><strong>Quality:</strong> Grade {batch.quality_grade}</p>
                              <p><strong>Location:</strong> {batch.farm_location}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bid-amount">Your Bid Amount (₹)</Label>
                            <Input
                              id="bid-amount"
                              type="number"
                              placeholder="Enter your bid amount"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                            />
                          </div>
                          
                          <Button 
                            onClick={handlePlaceBid} 
                            className="w-full"
                            disabled={!bidAmount}
                          >
                            Submit Bid
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="inventory">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">My Inventory</h2>
                <Button 
                  variant="outline" 
                  onClick={handleRefreshInventory}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory.map((item) => (
                  <Card key={item.id} className="shadow-elegant">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.batch.crop_name}</CardTitle>
                        <Badge variant="success">Owned</Badge>
                      </div>
                      <CardDescription>Batch ID: {item.batch.id.slice(0, 8)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality Grade:</span>
                          <span>Grade {item.batch.quality_grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purchase Price:</span>
                          <span className="font-semibold">₹{Number(item.purchase_price).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-semibold text-success">{item.quantity_available} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Selling Price:</span>
                          <span className="font-semibold text-primary">₹{Number(item.selling_price_per_kg).toLocaleString('en-IN')}/kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Acquired:</span>
                          <span>{new Date(item.acquired_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Manage Inventory
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bids">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Active Bids</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBids.map((bid) => (
                  <Card key={bid.id} className="shadow-elegant">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{bid.batch.crop_name}</CardTitle>
                        <Badge variant="warning">Active Bid</Badge>
                      </div>
                      <CardDescription>Batch ID: {bid.batch.id.slice(0, 8)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">My Bid:</span>
                          <span className="font-semibold text-primary">₹{Number(bid.bid_amount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span>{bid.batch.quantity} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality:</span>
                          <span>Grade {bid.batch.quality_grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bid Date:</span>
                          <span>{new Date(bid.created_at).toLocaleDateString()}</span>
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

      <ProfileDialog 
        open={isProfileDialogOpen} 
        onOpenChange={setIsProfileDialogOpen} 
      />
    </div>
  );
};

export default DistributorDashboard;