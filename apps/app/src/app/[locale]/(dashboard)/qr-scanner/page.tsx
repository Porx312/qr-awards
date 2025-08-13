/* import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import SubscribeForm from "./components/SuscribeForm"

export default function Page() {
  return (
    <main className="min-h-[100svh] w-full">
      <section className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <Card className="border-muted">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl">Suscríbete a un negocio</CardTitle>
              <CardDescription>Únete escaneando un QR o ingresando el código corto del negocio.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubscribeForm />
            </CardContent>
          </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Consejo: Si la cámara no funciona, usa la pestaña "Código".
        </p>
      </section>
    </main>
  )
}
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import UnifiedQRForm from "./components/unified"

export default function Page() {
  return (
    <main className="min-h-[100svh] w-full">
      <section className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Card className="border-muted">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl">Escanear QR</CardTitle>
            <CardDescription>
              Escanea el QR del negocio para obtener puntos o el QR del cliente para otorgar puntos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UnifiedQRForm />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Consejo: Si la cámara no funciona, usa la pestaña "Código".
        </p>
      </section>
    </main>
  )
}

