import { Button } from "@v1/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Badge } from "@v1/ui/badge"
import { Star, Smartphone, Gift, Users, CheckCircle, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold text-gray-900">StampCard</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-orange-500 transition-colors">
              Características
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-orange-500 transition-colors">
              Precios
            </a>
            <a href="#contact" className="text-gray-600 hover:text-orange-500 transition-colors">
              Contacto
            </a>
            <Button variant="outline">    <a
              href={process.env.NEXT_PUBLIC_APP_URL}
            >
              Inicia Seccion
            </a></Button>
            <Button className="bg-orange-500 hover:bg-orange-600">Prueba Gratis</Button>
          </div>
        </nav>
      </header>


      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
            🎉 Nuevo: Integración con WhatsApp disponible
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Fideliza a tus clientes con <span className="text-orange-500">tarjetas digitales</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transforma las visitas de tus clientes en sellos digitales. Perfecto para restaurantes, cafeterías, salones
            de belleza, tiendas y cualquier negocio que quiera premiar la lealtad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3">
              Comenzar Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Todo lo que necesitas para fidelizar</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Una solución completa para negocios que quieren aumentar la frecuencia de visitas y fidelizar a sus clientes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle>App Móvil Intuitiva</CardTitle>
              <CardDescription>
                Tus clientes pueden ver sus sellos, progreso y recompensas desde cualquier lugar
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle>Sellos Automáticos</CardTitle>
              <CardDescription>Sistema de códigos QR para marcar visitas de forma rápida y segura</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle>Recompensas Personalizadas</CardTitle>
              <CardDescription>
                Define tus propias recompensas: descuentos, platos gratis, promociones especiales
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>Panel de Administración</CardTitle>
              <CardDescription>
                Gestiona clientes, ve estadísticas y configura campañas desde un dashboard completo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-red-500" />
              </div>
              <CardTitle>Notificaciones Push</CardTitle>
              <CardDescription>
                Mantén a tus clientes informados sobre nuevas promociones y recompensas disponibles
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle>Análisis Detallados</CardTitle>
              <CardDescription>
                Reportes de frecuencia de visitas, clientes más activos y efectividad de promociones
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-xl text-gray-600">Implementa tu sistema de fidelización en 3 simples pasos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Configura tu negocio</h3>
              <p className="text-gray-600">Crea tu cuenta, personaliza tu tarjeta de sellos y define las recompensas</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tus clientes se registran</h3>
              <p className="text-gray-600">Los clientes descargan la app y se registran con su número de teléfono</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Acumulan sellos</h3>
              <p className="text-gray-600">En cada visita, escanean el código QR y automáticamente reciben un sello</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Planes que se adaptan a tu negocio</h2>
          <p className="text-xl text-gray-600">Comienza gratis y escala según crezca tu base de clientes</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-center">Básico</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">Gratis</span>
                <p className="text-gray-600">Hasta 100 clientes</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Tarjetas de sellos ilimitadas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Códigos QR personalizados
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Panel básico de administración
                </li>
              </ul>
              <Button className="w-full mt-6 bg-transparent" variant="outline">
                Comenzar Gratis
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-500 text-white">Más Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-center">Profesional</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-gray-600">/mes</span>
                <p className="text-gray-600">Hasta 1,000 clientes</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Todo lo del plan Básico
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Notificaciones push
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Análisis avanzados
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Soporte prioritario
                </li>
              </ul>
              <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600">Comenzar Prueba</Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-center">Empresa</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">$99</span>
                <span className="text-gray-600">/mes</span>
                <p className="text-gray-600">Clientes ilimitados</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Todo lo del plan Profesional
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Múltiples ubicaciones
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  API personalizada
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Soporte dedicado
                </li>
              </ul>
              <Button className="w-full mt-6 bg-transparent" variant="outline">
                Contactar Ventas
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para aumentar la fidelidad de tus clientes?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Únete a más de 500 negocios que ya están usando StampCard para hacer crecer su base de clientes leales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-500 hover:bg-gray-100 text-lg px-8 py-3">
              Comenzar Prueba Gratuita
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-orange-500 text-lg px-8 py-3 bg-transparent"
            >
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="text-xl font-bold">StampCard</span>
              </div>
              <p className="text-gray-400">
                La solución más fácil para implementar un sistema de fidelización en tu negocio.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Estado del Servicio
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StampCard. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
