'use client';

import { useState } from 'react';
import { PreferencesSection } from '@/components/profile/PreferencesSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreferencesFormData } from '@/lib/schemas/profile-schemas';
import { SettingsIcon } from 'lucide-react';

// Mock preferences - En producción obtener del localStorage o backend
const mockPreferences: PreferencesFormData = {
  theme: 'system',
  language: 'es',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'America/Santiago',
  notifications: true,
};

export default function SettingsPage() {
  const [preferences, setPreferences] =
    useState<PreferencesFormData>(mockPreferences);

  const handleUpdatePreferences = async (data: {
    theme: string;
    notifications: boolean;
  }) => {
    // Simular llamada API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setPreferences({
      ...preferences,
      theme: data.theme as 'light' | 'dark' | 'system',
      notifications: data.notifications,
    });

    // En producción: guardar en localStorage o backend
    localStorage.setItem('userPreferences', JSON.stringify(data));

    console.log('Preferencias actualizadas:', data);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Personaliza tu experiencia en el sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSection
            initialPreferences={preferences}
            onUpdate={handleUpdatePreferences}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
