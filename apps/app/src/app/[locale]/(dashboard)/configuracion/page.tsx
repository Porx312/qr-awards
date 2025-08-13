"use client";

import { useScopedI18n } from "@/locales/client";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@v1/backend/convex/_generated/api";
import type { Id } from "@v1/backend/convex/_generated/dataModel";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Label } from "@v1/ui/label";
import { UploadInput } from "@v1/ui/upload-input";
import { useDoubleCheck } from "@v1/ui/utils";
import type { UploadFileResponse } from "@xixixao/uploadstuff/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Upload, Building2, User } from 'lucide-react';
import { useState, useEffect } from "react";

export default function DashboardSettings() {
  const t = useScopedI18n("settings");
  const user = useQuery(api.users.getUser);
  const { signOut } = useAuthActions();
  const updateUserImage = useMutation(api.users.updateUserImage);
  const updateUsername = useMutation(api.users.updateUsername);
  const removeUserImage = useMutation(api.users.removeUserImage);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const deleteCurrentUserAccount = useAction(api.users.deleteCurrentUserAccount);
  const { doubleCheck, getButtonProps } = useDoubleCheck();

  // Estados locales para los campos
  const [username, setUsername] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [exactAddress, setExactAddress] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Inicializar valores cuando el usuario se carga
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBusinessName(user.businessName || "");
      setLocation(user.location || "");
      setCity(user.city || "");
      setExactAddress(user.exactAddress || "");
      setBusinessCategory(user.businessCategory || "");
    }
  }, [user]);

  const handleUpdateUserImage = (uploaded: UploadFileResponse[]) => {
    return updateUserImage({
      imageId: (uploaded[0]?.response as { storageId: Id<"_storage"> }).storageId,
    });
  };

  const handleDeleteAccount = async () => {
    await deleteCurrentUserAccount();
    signOut();
  };

  // Validaciones
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

  const handleUsernameChange = (value: string) => {
    setUsername(value);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Preparar datos para envío
      const submitData: any = {};
      
      if (username.trim()) {
        submitData.username = username.trim().toLowerCase();
      }
      
      if (user?.role === "business") {
        if (businessName.trim()) submitData.businessName = businessName.trim();
        if (location.trim()) submitData.location = location.trim();
        if (city.trim()) submitData.city = city.trim();
        if (exactAddress.trim()) submitData.exactAddress = exactAddress.trim();
        if (businessCategory.trim()) submitData.businessCategory = businessCategory.trim();
      }

      console.log("Actualizando datos:", submitData);
      await updateUsername(submitData);
      setSuccessMessage("Perfil actualizado correctamente");
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setErrors({ general: error.message || "Error al actualizar el perfil" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSave = () => {
    if (errors.username) return false;
    if (username.length < 3) return false;
    
    if (user?.role === "business") {
      return businessName.trim().length > 0 && 
             location.trim().length > 0 && 
             city.trim().length > 0 && 
             businessCategory.trim().length > 0 &&
             !errors.businessName &&
             !errors.location &&
             !errors.city &&
             !errors.businessCategory;
    }
    
    return true;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Avatar */}
      <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
        <div className="flex w-full items-start justify-between rounded-lg p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium text-primary">
              {t("avatar.title")}
            </h2>
            <p className="text-sm font-normal text-primary/60">
              {t("avatar.description")}
            </p>
          </div>
          <label
            htmlFor="avatar_field"
            className="group relative flex cursor-pointer overflow-hidden rounded-full transition active:scale-95"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl || "/placeholder.svg"}
                className="h-20 w-20 rounded-full object-cover"
                alt={user.username ?? user.email}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
            )}
            <div className="absolute z-10 hidden h-full w-full items-center justify-center bg-primary/40 group-hover:flex">
              <Upload className="h-6 w-6 text-secondary" />
            </div>
          </label>
          <UploadInput
            id="avatar_field"
            type="file"
            accept="image/*"
            className="peer sr-only"
            required
            tabIndex={user ? -1 : 0}
            generateUploadUrl={generateUploadUrl}
            onUploadComplete={handleUpdateUserImage}
          />
        </div>
        <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 dark:bg-card">
          <p className="text-sm font-normal text-primary/60">
            {t("avatar.uploadHint")}
          </p>
          {user.avatarUrl && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                removeUserImage({});
              }}
            >
              {t("avatar.resetButton")}
            </Button>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <form
        className="flex w-full flex-col items-start rounded-lg border border-border bg-card"
        onSubmit={handleSubmit}
      >
        <div className="flex w-full flex-col gap-6 rounded-lg p-6">
          <div className="flex items-center gap-3">
            {user.role === "business" ? (
              <Building2 className="h-6 w-6 text-primary" />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-medium text-primary">
                {user.role === "business" ? "Información del Negocio" : "Información Personal"}
              </h2>
              <p className="text-sm font-normal text-primary/60">
                {user.role === "business" 
                  ? "Actualiza la información de tu negocio"
                  : "Actualiza tu información personal"
                }
              </p>
            </div>
          </div>

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="w-full p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              {successMessage}
            </div>
          )}

          {/* Error general */}
          {errors.general && (
            <div className="w-full p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              placeholder="mi-usuario-123"
              autoComplete="off"
              required
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`w-full max-w-md bg-transparent ${
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

          {/* Business Fields */}
          {user.role === "business" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <Input
                  id="businessName"
                  placeholder="Mi Empresa S.A."
                  required
                  value={businessName}
                  onChange={(e) => handleBusinessFieldChange("businessName", e.target.value)}
                  className={`w-full max-w-md bg-transparent ${
                    errors.businessName && "border-destructive focus-visible:ring-destructive"
                  }`}
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive">{errors.businessName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full max-w-md bg-transparent"
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
                  className={`w-full max-w-md bg-transparent ${
                    errors.businessCategory && "border-destructive focus-visible:ring-destructive"
                  }`}
                />
                {errors.businessCategory && (
                  <p className="text-sm text-destructive">{errors.businessCategory}</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 dark:bg-card">
          <p className="text-sm font-normal text-primary/60">
            {user.role === "business" 
              ? "Mantén actualizada la información de tu negocio"
              : "Usa máximo 32 caracteres para tu nombre de usuario"
            }
          </p>
          <Button 
            type="submit" 
            size="sm"
            disabled={!canSave() || isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>

      {/* Delete Account */}
      <div className="flex w-full flex-col items-start rounded-lg border border-destructive bg-card">
        <div className="flex flex-col gap-2 p-6">
          <h2 className="text-xl font-medium text-primary">
            {t("deleteAccount.title")}
          </h2>
          <p className="text-sm font-normal text-primary/60">
            {t("deleteAccount.description")}
          </p>
        </div>
        <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-red-500/10 px-6 dark:bg-red-500/10">
          <p className="text-sm font-normal text-primary/60">
            {t("deleteAccount.warning")}
          </p>
          <Button
            size="sm"
            variant="destructive"
            {...getButtonProps({
              onClick: doubleCheck ? handleDeleteAccount : undefined,
            })}
          >
            {doubleCheck
              ? t("deleteAccount.confirmButton")
              : t("deleteAccount.deleteButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
