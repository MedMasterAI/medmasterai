'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-2 py-8">
      <Card className="max-w-2xl w-full shadow-xl rounded-2xl border-none bg-white dark:bg-[#22224a]">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Política de Privacidad</h1>
          <ScrollArea className="h-[65vh] pr-2 custom-scroll">
            <p><strong>Última actualización:</strong> 18 de mayo de 2025</p>

            <h2 className="text-lg font-semibold mt-4 mb-2">1. Responsable</h2>
            <p>
              MedMaster es responsable de los datos personales que procesamos a través de nuestra plataforma.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">2. Información que recopilamos</h2>
            <p>
              Recopilamos información que nos proporcionás al registrarte (nombre, correo electrónico), al cargar archivos o al interactuar con las herramientas de IA. También recolectamos datos técnicos de uso (IP, dispositivo, etc.) para mejorar la experiencia.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">3. Uso de la información</h2>
            <p>
              Utilizamos tus datos para:
              <ul className="list-disc ml-6">
                <li>Proveer y mejorar nuestros servicios.</li>
                <li>Identificarte y autenticarte.</li>
                <li>Enviarte notificaciones sobre el servicio.</li>
                <li>Cumplir obligaciones legales.</li>
              </ul>
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">4. Protección de datos personales (Ley 25.326)</h2>
            <p>
              MedMaster cumple con la Ley 25.326 de Protección de Datos Personales de la República Argentina. El usuario puede ejercer sus derechos de acceso, rectificación y supresión de datos personales comunicándose a <a className="text-primary underline" href="mailto:legal@medmaster.com.ar">legal@medmaster.com.ar</a>.
              La Dirección Nacional de Protección de Datos Personales, órgano de control de la Ley 25.326, tiene la atribución de atender reclamos sobre incumplimiento de normas de protección de datos personales (<a className="text-primary underline" href="https://www.argentina.gob.ar/aaip/datospersonales" target="_blank" rel="noopener noreferrer">www.argentina.gob.ar/aaip/datospersonales</a>).
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">5. Transferencia internacional de datos</h2>
            <p>
              Podemos utilizar proveedores tecnológicos ubicados fuera de la Argentina. Garantizamos que estos terceros cumplen con estándares adecuados de protección y seguridad.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">6. Seguridad</h2>
            <p>
              Adoptamos medidas de seguridad técnicas y organizativas para resguardar la información. Sin embargo, ningún sistema es completamente seguro.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">7. Cookies</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar la experiencia. El usuario puede configurar su navegador para rechazar cookies, aunque esto puede limitar funcionalidades.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">8. Cambios en la política</h2>
            <p>
              Podemos modificar esta política en cualquier momento. Las actualizaciones serán notificadas en la plataforma.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">9. Contacto</h2>
            <p>
              Para consultas sobre esta política, escribí a <a className="text-primary underline" href="mailto:legal@medmaster.com.ar">legal@medmaster.com.ar</a> o usá el <Link className="text-primary underline" href="/contact">formulario de contacto</Link>.
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  )
}
