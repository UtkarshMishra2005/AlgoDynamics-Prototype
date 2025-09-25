import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProfile, Profile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Wallet, User, MapPin, Building, Store, Shield, Phone, Mail } from 'lucide-react';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const { profile, updateProfile, revenue } = useProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  const handleEdit = () => {
    setFormData(profile || {});
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          await updateProfile({ ethereum_wallet: walletAddress });
          toast({
            title: "Wallet Connected",
            description: `Connected wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          });
        }
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Ethereum wallet.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer': return <MapPin className="w-4 h-4" />;
      case 'distributor': return <Building className="w-4 h-4" />;
      case 'retailer': return <Store className="w-4 h-4" />;
      case 'inspector': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderRoleSpecificFields = () => {
    if (!profile) return null;

    switch (profile.role) {
      case 'farmer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farm_location">Farm Location</Label>
              {isEditing ? (
                <Input
                  id="farm_location"
                  value={formData.farm_location || ''}
                  onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                  placeholder="e.g., Punjab, India"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.farm_location || 'Not specified'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="farm_size">Farm Size (acres)</Label>
              {isEditing ? (
                <Input
                  id="farm_size"
                  type="number"
                  value={formData.farm_size || ''}
                  onChange={(e) => setFormData({ ...formData, farm_size: Number(e.target.value) })}
                  placeholder="e.g., 50"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.farm_size || 'Not specified'} acres</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="farming_experience">Farming Experience (years)</Label>
              {isEditing ? (
                <Input
                  id="farming_experience"
                  type="number"
                  value={formData.farming_experience || ''}
                  onChange={(e) => setFormData({ ...formData, farming_experience: Number(e.target.value) })}
                  placeholder="e.g., 15"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.farming_experience || 'Not specified'} years</p>
              )}
            </div>
          </div>
        );

      case 'distributor':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              {isEditing ? (
                <Input
                  id="company_name"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g., AgriTech Solutions Pvt Ltd"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.company_name || 'Not specified'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              {isEditing ? (
                <Input
                  id="license_number"
                  value={formData.license_number || ''}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="e.g., DL12345678"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.license_number || 'Not specified'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transportation_capacity">Transportation Capacity (tons)</Label>
              {isEditing ? (
                <Input
                  id="transportation_capacity"
                  type="number"
                  value={formData.transportation_capacity || ''}
                  onChange={(e) => setFormData({ ...formData, transportation_capacity: Number(e.target.value) })}
                  placeholder="e.g., 100"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.transportation_capacity || 'Not specified'} tons</p>
              )}
            </div>
          </div>
        );

      case 'retailer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name</Label>
              {isEditing ? (
                <Input
                  id="store_name"
                  value={formData.store_name || ''}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  placeholder="e.g., Fresh Mart"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.store_name || 'Not specified'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_address">Store Address</Label>
              {isEditing ? (
                <Textarea
                  id="store_address"
                  value={formData.store_address || ''}
                  onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                  placeholder="e.g., 123 Market Street, Mumbai, Maharashtra"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.store_address || 'Not specified'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_type">Store Type</Label>
              {isEditing ? (
                <Input
                  id="store_type"
                  value={formData.store_type || ''}
                  onChange={(e) => setFormData({ ...formData, store_type: e.target.value })}
                  placeholder="e.g., Supermarket, Grocery Store"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.store_type || 'Not specified'}</p>
              )}
            </div>
          </div>
        );

      case 'inspector':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inspector_id">Inspector ID</Label>
              {isEditing ? (
                <Input
                  id="inspector_id"
                  value={formData.inspector_id || ''}
                  onChange={(e) => setFormData({ ...formData, inspector_id: e.target.value })}
                  placeholder="e.g., INS12345"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.inspector_id || 'Not specified'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification_body">Certification Body</Label>
              {isEditing ? (
                <Input
                  id="certification_body"
                  value={formData.certification_body || ''}
                  onChange={(e) => setFormData({ ...formData, certification_body: e.target.value })}
                  placeholder="e.g., FSSAI, APEDA"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.certification_body || 'Not specified'}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRoleIcon(profile.role)}
            My Profile
          </DialogTitle>
          <DialogDescription>
            Manage your profile information and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <Badge variant="secondary" className="capitalize">
                {profile.role}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile.full_name || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile.phone || 'Not specified'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{profile.email}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Revenue Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Revenue Summary</h3>
            <div className="p-4 rounded-lg bg-success/10 border">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-success">{formatRevenue(revenue)}</p>
            </div>
          </div>

          <Separator />

          {/* Ethereum Wallet */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ethereum Wallet</h3>
            {profile.ethereum_wallet ? (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-success" />
                  <span className="text-sm font-mono">
                    {profile.ethereum_wallet.slice(0, 6)}...{profile.ethereum_wallet.slice(-4)}
                  </span>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            ) : (
              <div className="text-center p-4 rounded-lg border border-dashed">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No wallet connected</p>
                <Button onClick={connectWallet} variant="outline">
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Role-specific fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold capitalize">{profile.role} Details</h3>
            {renderRoleSpecificFields()}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;