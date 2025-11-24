'use client';

import { useEffect, useState } from 'react';
import {
  ChangePasswordFormData,
  PersonalInfoFormData,
} from '@/lib/schemas/profile-schemas';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, UserIcon } from 'lucide-react';
import { PersonalInfoSection } from '@/components/profile/PersonalInfoSection';
import { SecuritySection } from '@/components/profile/SecuritySection';
import { PreferencesSection } from '@/components/profile/PreferencesSection';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api/users';
import { User } from '@library/types';

export default function LibrarianProfilePage() {
  // VERSIÓN 2.0 - COMPLETAMENTE NUEVA
  const {
    user: authUser,
    token,
    isLoading,
    isAuthenticated,
    updateUser,
  } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (authUser) {
      setUser(authUser);
    }
  }, [authUser, isLoading, isAuthenticated, router]);

  const handleUpdatePersonalInfo = async (data: PersonalInfoFormData) => {
    if (!user || !token) return;

    try {
      const updatedUser = await usersApi.updateProfile(
        {
          firstName: data.firstName,
          middleName: data.middleName || null,
          lastName: data.lastName,
        },
        token
      );

      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    if (!token) return;

    try {
      await usersApi.changePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        token
      );
    } catch (error) {
      throw error;
    }
  };

  const handleUpdatePreferences = async (data: {
    theme: string;
    notifications: boolean;
  }) => {
    if (!token) return;

    try {
      await usersApi.updatePreferences(data, token);

      // Recargar la página para aplicar el nuevo tema
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      throw error;
    }
  };
  if (isLoading || !user) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y preferencias de seguridad
        </p>
      </div>

      <ProfileHeader user={user} />

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="gap-2">
            <UserIcon className="h-4 w-4" />
            Información personal
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="h-4 w-4" />
            Preferencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <PersonalInfoSection
            user={user}
            onUpdate={handleUpdatePersonalInfo}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySection onChangePassword={handleChangePassword} />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSection
            initialPreferences={{
              theme:
                (authUser?.theme?.toLowerCase() as
                  | 'light'
                  | 'dark'
                  | 'system') || 'system',
              language: 'es',
              dateFormat: 'DD/MM/YYYY',
              timezone: 'America/Santiago',
              notifications: authUser?.notifications ?? true,
            }}
            onUpdate={handleUpdatePreferences}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
