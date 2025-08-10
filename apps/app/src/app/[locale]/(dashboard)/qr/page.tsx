"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import QrCard from "./components/QrCard"
import { useQuery } from "convex/react";
import { api } from "@v1/backend/convex/_generated/api";

export default function Page() {
    const user = useQuery(api.users.currentUser);

  if (user === undefined) return <p>Cargando...</p>;
  if (user === null) return <p>Usuario no encontrado</p>;

  return (
      <main className="min-h-svh bg-muted/20">
        <div className="mx-auto max-w-4xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>{"QR del Usuario (Convex)"}</CardTitle>
              <CardDescription>
                {"Ingresa un Id de Convex válido, lee/genera el QR y muéstralo como imagen PNG."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QrCard defaultOwnerUserId={user._id} />
            </CardContent>
          </Card>
        </div>
      </main>
  )
}
