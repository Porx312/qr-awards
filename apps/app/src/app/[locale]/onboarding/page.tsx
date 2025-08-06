"use client";

import { useForm } from "@tanstack/react-form";
import { api } from "@v1/backend/convex/_generated/api";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Label } from "@v1/ui/label";
import { Card, CardContent } from "@v1/ui/card";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Building2, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Step = "role" | "username" | "business-details";

export default function OnboardingUsername() {
  const user = useQuery(api.users.getUser);
  const updateUsername = useMutation(api.users.updateUsername);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("role");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados locales para tracking inmediato
  const [selectedRole, setSelectedRole] = useState<"client" | "business" | "">("");
  const [username, setUsername] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [exactAddress, setExactAddress] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");

  // Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  const form = useForm({
    defaultValues: {
      username: "",
      role: "" as "client" | "business" | "",
      businessName: "",
      location: "",
      city: "",
      exactAddress: "",
      businessCategory: "",
    },
    onSubmit: async () => {
      setIsSubmitting(true);
      setErrors({});
      
      try {
        // Preparar datos para envío
        const submitData: any = {};
        
        if (username.trim()) {
          submitData.username = username.trim().toLowerCase();
        }
        
        if (selectedRole) {
          submitData.role = selectedRole;
        }
        
        if (selectedRole === "business") {
          if (businessName.trim()) submitData.businessName = businessName.trim();
          if (location.trim()) submitData.location = location.trim();
          if (city.trim()) submitData.city = city.trim();
          if (exactAddress.trim()) submitData.exactAddress = exactAddress.trim();
          if (businessCategory.trim()) submitData.businessCategory = businessCategory.trim();
        }

        console.log("Enviando datos:", submitData);
        await updateUsername(submitData);
        router.push("/");
      } catch (error: any) {
        console.error("Error updating profile:", error);
        setErrors({ general: error.message || "Error al actualizar el perfil" });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!user) return;
    if (user?.username) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const validateUsername = (value: string) => {
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 32) return "Máximo 32 caracteres";
    if (!/^[a-z0-9]+$/.test(value)) return "Solo letras minúsculas y números";
    return "";
  };

  const validateRequired = (value: string, fieldName: string) => {
    if (!value.trim()) return `${fieldName} es requerido`;
    return "";
  };

  const handleRoleSelect = (role: "client" | "business") => {
    setSelectedRole(role);
    form.setFieldValue("role", role);
    setErrors({});
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    form.setFieldValue("username", value);
    const error = validateUsername(value);
    setErrors(prev => ({ ...prev, username: error }));
  };

  const handleBusinessFieldChange = (field: string, value: string) => {
    switch (field) {
      case "businessName":
        setBusinessName(value);
        setErrors(prev => ({ ...prev, businessName: validateRequired(value, "Nombre del negocio") }));
        break;
      case "location":
        setLocation(value);
        setErrors(prev => ({ ...prev, location: validateRequired(value, "Ubicación") }));
        break;
      case "city":
        setCity(value);
        setErrors(prev => ({ ...prev, city: validateRequired(value, "Ciudad") }));
        break;
      case "exactAddress":
        setExactAddress(value);
        break;
      case "businessCategory":
        setBusinessCategory(value);
        setErrors(prev => ({ ...prev, businessCategory: validateRequired(value, "Categoría") }));
        break;
    }
    form.setFieldValue(field as any, value);
  };

  const handleNext = () => {
    if (currentStep === "role" && selectedRole) {
      setCurrentStep("username");
    } else if (currentStep === "username") {
      if (selectedRole === "business") {
        setCurrentStep("business-details");
      } else {
        form.handleSubmit();
      }
    } else if (currentStep === "business-details") {
      form.handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === "username") {
      setCurrentStep("role");
    } else if (currentStep === "business-details") {
      setCurrentStep("username");
    }
  };

  const canProceed = () => {
    if (currentStep === "role") {
      return selectedRole !== "";
    }
    if (currentStep === "username") {
      return username.length >= 3 && !errors.username;
    }
    if (currentStep === "business-details") {
      return businessName.trim().length > 0 && 
             location.trim().length > 0 && 
             city.trim().length > 0 && 
             businessCategory.trim().length > 0 &&
             !errors.businessName &&
             !errors.location &&
             !errors.city &&
             !errors.businessCategory;
    }
    return false;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "role":
        return "¿Eres cliente o negocio?";
      case "username":
        return "Elige tu nombre de usuario";
      case "business-details":
        return "Información de tu negocio";
      default:
        return "Bienvenido!";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "role":
        return "Selecciona tu tipo de cuenta para personalizar tu experiencia";
      case "username":
        return "Este será tu identificador único en la plataforma";
      case "business-details":
        return "Ayúdanos a conocer mejor tu negocio";
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <span className="mb-2 select-none text-6xl">
          {currentStep === "role" ? "👋" : currentStep === "username" ? "🏷️" : "🏢"}
        </span>
        <h3 className="text-center text-2xl font-medium text-primary">
          {getStepTitle()}
        </h3>
        <p className="text-center text-base font-normal text-primary/60">
          {getStepDescription()}
        </p>
      </div>

      {/* Error General */}
      {errors.general && (
        <div className="w-full p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {errors.general}
        </div>
      )}

      <form
        className="flex w-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNext();
        }}
      >
        {/* Role Selection Step */}
        {currentStep === "role" && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRole === "client" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleRoleSelect("client")}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <User className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-medium">Cliente</h4>
                    <p className="text-sm text-muted-foreground">
                      Busco servicios y productos
                    </p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border-2 ${
                    selectedRole === "client" 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground"
                  }`} />
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRole === "business" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleRoleSelect("business")}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <Building2 className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-medium">Negocio</h4>
                    <p className="text-sm text-muted-foreground">
                      Ofrezco servicios y productos
                    </p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border-2 ${
                    selectedRole === "business" 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground"
                  }`} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Username Step */}
        {currentStep === "username" && (
          <div className="flex flex-col gap-3">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                placeholder="mi-usuario-123"
                autoComplete="off"
                required
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`bg-transparent ${
                  errors.username && "border-destructive focus-visible:ring-destructive"
                }`}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Solo letras minúsculas y números, mínimo 3 caracteres
              </p>
            </div>
          </div>
        )}

        {/* Business Details Step */}
        {currentStep === "business-details" && (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del negocio</Label>
              <Input
                id="businessName"
                placeholder="Mi Empresa S.A."
                required
                value={businessName}
                onChange={(e) => handleBusinessFieldChange("businessName", e.target.value)}
                className={`bg-transparent ${
                  errors.businessName && "border-destructive focus-visible:ring-destructive"
                }`}
              />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Estado/Provincia"
                  required
                  value={location}
                  onChange={(e) => handleBusinessFieldChange("location", e.target.value)}
                  className={`bg-transparent ${
                    errors.location && "border-destructive focus-visible:ring-destructive"
                  }`}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Tu ciudad"
                  required
                  value={city}
                  onChange={(e) => handleBusinessFieldChange("city", e.target.value)}
                  className={`bg-transparent ${
                    errors.city && "border-destructive focus-visible:ring-destructive"
                  }`}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exactAddress">Dirección exacta (opcional)</Label>
              <Input
                id="exactAddress"
                placeholder="Calle, número, colonia..."
                value={exactAddress}
                onChange={(e) => handleBusinessFieldChange("exactAddress", e.target.value)}
                className="bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessCategory">Categoría del negocio</Label>
              <Input
                id="businessCategory"
                placeholder="Restaurante, Tienda, Servicios..."
                required
                value={businessCategory}
                onChange={(e) => handleBusinessFieldChange("businessCategory", e.target.value)}
                className={`bg-transparent ${
                  errors.businessCategory && "border-destructive focus-visible:ring-destructive"
                }`}
              />
              {errors.businessCategory && (
                <p className="text-sm text-destructive">{errors.businessCategory}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2 pt-2">
          {currentStep !== "role" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            className="flex-1"
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentStep === "business-details" || 
               (currentStep === "username" && selectedRole === "client") ? (
              "Finalizar"
            ) : (
              <>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Progress Indicator */}
      <div className="flex gap-2">
        <div className={`h-2 w-8 rounded-full transition-colors ${
          currentStep === "role" ? "bg-primary" : "bg-primary/30"
        }`} />
        <div className={`h-2 w-8 rounded-full transition-colors ${
          currentStep === "username" ? "bg-primary" : 
          currentStep === "business-details" ? "bg-primary/30" : "bg-muted"
        }`} />
        {selectedRole === "business" && (
          <div className={`h-2 w-8 rounded-full transition-colors ${
            currentStep === "business-details" ? "bg-primary" : "bg-muted"
          }`} />
        )}
      </div>

      <p className="px-6 text-center text-sm font-normal leading-normal text-primary/60">
        Puedes actualizar esta información en cualquier momento desde la configuración de tu cuenta.
      </p>
    </div>
  );
}
