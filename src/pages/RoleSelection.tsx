import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wheat, Shield, Truck, Store } from "lucide-react";
import heroImage from "@/assets/hero-agrichain.jpg";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "farmer",
      title: "Farmer",
      description: "Create and manage crop batches, track verification status",
      icon: Wheat,
      color: "text-primary",
    },
    {
      id: "inspector",
      title: "Inspector",
      description: "Verify crop batches and issue quality certifications",
      icon: Shield,
      color: "text-accent",
    },
    {
      id: "distributor",
      title: "Distributor",
      description: "Bid on verified crops and manage wholesale distribution",
      icon: Truck,
      color: "text-warning",
    },
    {
      id: "retailer",
      title: "Retailer",
      description: "Purchase crops from distributors for retail sales",
      icon: Store,
      color: "text-success",
    },
  ];

  const handleRoleSelect = (roleId: string) => {
    navigate(`/auth/${roleId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="gradient-hero py-20 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(var(--accent) / 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            AgriChain
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4">
            Blockchain-Powered Agricultural Supply Chain
          </p>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Transparent, verifiable, and secure tracking from farm to table
          </p>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select your role in the agricultural supply chain to access your personalized dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <Card 
                  key={role.id} 
                  className="shadow-elegant hover:shadow-glow transition-smooth cursor-pointer group"
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <IconComponent className={`w-8 h-8 ${role.color}`} />
                    </div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="mb-6">
                      {role.description}
                    </CardDescription>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Powered by Blockchain Technology
            </h2>
            <p className="text-xl text-muted-foreground">
              Ensuring transparency, traceability, and trust in every transaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Immutable</h3>
              <p className="text-muted-foreground">
                All transactions recorded on Ethereum blockchain for maximum security
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                <Wheat className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full Traceability</h3>
              <p className="text-muted-foreground">
                Track every crop from farm to consumer with complete transparency
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Contracts</h3>
              <p className="text-muted-foreground">
                Automated payments and quality assurance through smart contracts
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoleSelection;