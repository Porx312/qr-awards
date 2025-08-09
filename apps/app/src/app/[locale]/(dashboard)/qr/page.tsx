"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import QrCard from "./components/QrCard"

export default function Page() {
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
              <QrCard defaultOwnerUserId={"jx74tfbrgwq02fgaf9n4928pf57n7ht2"} />
            </CardContent>
          </Card>
        </div>
      </main>
  )
}
