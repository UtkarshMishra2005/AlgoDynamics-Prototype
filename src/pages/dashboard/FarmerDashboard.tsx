import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Wheat, Calendar, Package, DollarSign, User, LogOut, Settings, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useBatches } from "@/hooks/useBatches";
import { useBids } from "@/hooks/useBids";
import ProfileDialog from "@/components/ProfileDialog";


const FarmerDashboard = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { profile, revenue } = useProfile();
  const { batches, createBatch, acceptBid } = useBatches();
  const { fetchBidsForBatch } = useBids();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    crop_name: '',
    quantity: '',
    harvest_date: '',
    farm_location: ''
  });
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [batchBids, setBatchBids] = useState<any[]>([]);

  const handleCreateBatch = async () => {
    try {
      await createBatch({
        crop_name: newBatch.crop_name,
        quantity: Number(newBatch.quantity),
        harvest_date: newBatch.harvest_date,
        farm_location: newBatch.farm_location
      });
      
      setIsCreateDialogOpen(false);
      setNewBatch({
        crop_name: '',
        quantity: '',
        harvest_date: '',
        farm_location: ''
      });
      
      toast({
        title: "Batch Created Successfully",
        description: "Your batch has been created and is awaiting verification.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewBids = async (batch: any) => {
    setSelectedBatch(batch);
    const bids = await fetchBidsForBatch(batch.id);
    console.log('Fetched bids for batch:', batch.id, bids);
    setBatchBids(bids);
  };

  const handleAcceptBid = async (bidId: string, sellingPrice: number) => {
    try {
      await acceptBid(bidId, sellingPrice);
      toast({
        title: "Bid Accepted",
        description: "The bid has been accepted successfully.",
      });
      setSelectedBatch(null);
      setBatchBids([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, grade?: string | null) => {
    if (status === "verified") {
      return <Badge variant="verified">Verified {grade && `(Grade ${grade})`}</Badge>;
    }
    return <Badge variant="unverified">Pending Verification</Badge>;
  };

  const verifiedBatches = batches.filter(b => b.verification_status === "verified" && !b.is_sold);
  const pendingBatches = batches.filter(b => b.verification_status === "pending");
  const soldBatches = batches.filter(b => b.is_sold);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile?.full_name || 'Farmer'}!
            </h1>
            <p className="text-muted-foreground">Manage your crop batches and track sales</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Batch
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Crop Batch</DialogTitle>
                <DialogDescription>
                  Enter the details for your new crop batch
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crop-name">Crop Name</Label>
                  <Input 
                    id="crop-name" 
                    placeholder="e.g., Organic Wheat"
                    value={newBatch.crop_name}
                    onChange={(e) => setNewBatch({...newBatch, crop_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="1000"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({...newBatch, quantity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harvest-date">Harvest Date</Label>
                  <Input 
                    id="harvest-date" 
                    type="date"
                    value={newBatch.harvest_date}
                    onChange={(e) => setNewBatch({...newBatch, harvest_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Farm Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Farm location"
                    value={newBatch.farm_location}
                    onChange={(e) => setNewBatch({...newBatch, farm_location: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleCreateBatch} 
                  className="w-full"
                  disabled={!newBatch.crop_name || !newBatch.quantity || !newBatch.harvest_date || !newBatch.farm_location}
                >
                  Create Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Profile Menu */}
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
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batches.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Batches</CardTitle>
              <Wheat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedBatches.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Batches</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soldBatches.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{revenue.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Management Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Batches</TabsTrigger>
            <TabsTrigger value="verified">Available for Sale</TabsTrigger>
            <TabsTrigger value="pending">Pending Verification</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map((batch) => (
                <Card key={batch.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{batch.crop_name}</CardTitle>
                      {getStatusBadge(batch.verification_status, batch.quality_grade)}
                    </div>
                    <CardDescription>Batch ID: {batch.id.slice(0, 8)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{batch.quantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harvest Date:</span>
                        <span>{new Date(batch.harvest_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{batch.farm_location}</span>
                      </div>
                      {batch.is_sold && batch.sold_price && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sold Price:</span>
                          <span className="font-semibold text-success">₹{batch.sold_price.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="verified">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedBatches.map((batch) => (
                <Card key={batch.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{batch.crop_name}</CardTitle>
                      {getStatusBadge(batch.verification_status, batch.quality_grade)}
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
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => handleViewBids(batch)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Bids
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingBatches.map((batch) => (
                <Card key={batch.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{batch.crop_name}</CardTitle>
                      {getStatusBadge(batch.verification_status)}
                    </div>
                    <CardDescription>Batch ID: {batch.id.slice(0, 8)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{batch.quantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-warning">Awaiting Inspector</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{batch.farm_location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="sold">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {soldBatches.map((batch) => (
                <Card key={batch.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{batch.crop_name}</CardTitle>
                      <Badge variant="success">Sold</Badge>
                    </div>
                    <CardDescription>Batch ID: {batch.id.slice(0, 8)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{batch.quantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Final Price:</span>
                        <span className="font-semibold text-success">₹{(batch.sold_price || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quality Grade:</span>
                        <span>{batch.quality_grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sold Date:</span>
                        <span>{batch.sold_date ? new Date(batch.sold_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Profile Dialog */}
        <ProfileDialog 
          open={isProfileDialogOpen} 
          onOpenChange={setIsProfileDialogOpen} 
        />

        {/* Bids Dialog */}
        <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bids for {selectedBatch?.crop_name}</DialogTitle>
              <DialogDescription>
                Batch ID: {selectedBatch?.id?.slice(0, 8)} • Quantity: {selectedBatch?.quantity} kg
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {batchBids.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bids yet for this batch.</p>
              ) : (
                <div className="space-y-3">
                  {batchBids.map((bid: any) => (
                    <Card key={bid.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{bid.profiles?.company_name || bid.profiles?.full_name || 'Unknown Distributor'}</p>
                            <p className="text-sm text-muted-foreground">Bid Amount: ₹{bid.bid_amount.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">
                              Placed on: {new Date(bid.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">Accept Bid</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Accept Bid</DialogTitle>
                                <DialogDescription>
                                  Set your selling price per kg for the distributor's inventory
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Selling Price per Kg (₹)</Label>
                                  <Input
                                    type="number"
                                    placeholder="Enter price per kg"
                                    id={`price-${bid.id}`}
                                  />
                                </div>
                                <Button 
                                  onClick={() => {
                                    const input = document.getElementById(`price-${bid.id}`) as HTMLInputElement;
                                    const price = Number(input?.value);
                                    if (price > 0) {
                                      handleAcceptBid(bid.id, price);
                                    }
                                  }}
                                  className="w-full"
                                >
                                  Confirm Accept
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FarmerDashboard;