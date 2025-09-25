import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, CheckCircle, Package, User, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useBatches } from "@/hooks/useBatches";
import ProfileDialog from "@/components/ProfileDialog";

const InspectorDashboard = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { batches, verifyBatch } = useBatches();
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [qualityGrade, setQualityGrade] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleVerifyBatch = async () => {
    if (!selectedBatch || !qualityGrade) return;

    try {
      await verifyBatch(selectedBatch.id, qualityGrade as 'A' | 'B' | 'C', inspectionNotes);
      
      toast({
        title: "Batch Verified Successfully",
        description: `Batch ${selectedBatch.id.slice(0, 8)} has been verified with grade ${qualityGrade}.`,
      });

      // Reset form
      setSelectedBatch(null);
      setQualityGrade("");
      setInspectionNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify batch. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getQualityBadge = (grade: string) => {
    switch(grade) {
      case 'A': return <Badge variant="verified">Grade A - Premium</Badge>;
      case 'B': return <Badge variant="success">Grade B - Standard</Badge>;
      case 'C': return <Badge variant="warning">Grade C - Basic</Badge>;
      default: return <Badge variant="unverified">Not Graded</Badge>;
    }
  };

  const pendingBatches = batches.filter(b => b.verification_status === "pending");
  const verifiedBatches = batches.filter(b => b.verification_status === "verified");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inspector Dashboard</h1>
            <p className="text-muted-foreground">Verify crop batches and issue quality certifications</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBatches.length}</div>
              <p className="text-xs text-muted-foreground">Batches awaiting inspection</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedBatches.length}</div>
              <p className="text-xs text-muted-foreground">Certifications issued</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">B+</div>
              <p className="text-xs text-muted-foreground">Overall grade average</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Batches Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pending Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingBatches.map((batch) => (
              <Card key={batch.id} className="shadow-elegant">
                <CardHeader>
                  <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{batch.crop_name}</CardTitle>
                    <Badge variant="warning">Pending</Badge>
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
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(batch.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="hero"
                        onClick={() => setSelectedBatch(batch)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Batch
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Verify Batch {batch.id.slice(0, 8)}</DialogTitle>
                        <DialogDescription>
                          Issue a quality certification for this crop batch
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Crop Details</Label>
                          <div className="p-3 bg-secondary rounded-md">
                            <p><strong>Crop:</strong> {batch.crop_name}</p>
                            <p><strong>Quantity:</strong> {batch.quantity} kg</p>
                            <p><strong>Location:</strong> {batch.farm_location}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="quality-grade">Quality Grade</Label>
                          <Select value={qualityGrade} onValueChange={setQualityGrade}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quality grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Grade A - Premium Quality</SelectItem>
                              <SelectItem value="B">Grade B - Standard Quality</SelectItem>
                              <SelectItem value="C">Grade C - Basic Quality</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="inspection-notes">Inspection Notes</Label>
                          <Textarea
                            id="inspection-notes"
                            placeholder="Add any inspection notes or comments..."
                            value={inspectionNotes}
                            onChange={(e) => setInspectionNotes(e.target.value)}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleVerifyBatch} 
                          className="w-full"
                          disabled={!qualityGrade}
                        >
                          Issue Certification
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Verified Batches Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recently Verified</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedBatches.map((batch) => (
              <Card key={batch.id} className="shadow-elegant">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{batch.crop_name}</CardTitle>
                    {getQualityBadge(batch.quality_grade || 'unknown')}
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
                      <span className="text-muted-foreground">Location:</span>
                      <span>{batch.farm_location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified:</span>
                      <span>{batch.inspection_date ? new Date(batch.inspection_date).toLocaleDateString() : 'Recently'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-success font-medium">Certified</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <ProfileDialog 
        open={isProfileDialogOpen} 
        onOpenChange={setIsProfileDialogOpen} 
      />
    </div>
  );
};

export default InspectorDashboard;