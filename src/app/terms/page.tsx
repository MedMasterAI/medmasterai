'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-2 py-8 transition-colors duration-300">
      <Card className="max-w-2xl w-full shadow-xl rounded-2xl border-none bg-background">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Términos y Condiciones</h1>
          <ScrollArea className="h-[65vh] pr-2 custom-scroll">
            <p><strong>Última actualización:</strong> 18 de mayo de 2025</p>
            <p className="mt-4">Bienvenido/a a MedMaster. Al registrarte y/o utilizar nuestra plataforma, aceptás estos Términos y Condiciones de uso.</p>

            <h2 className="text-lg font-semibold mt-4 mb-2">1. Aceptación</h2>
            <p>
              Al acceder y utilizar MedMaster, aceptás cumplir estos términos, así como nuestra{' '}
              <Link className="text-primary underline" href="/privacy">Política de Privacidad</Link>.
              Si no estás de acuerdo, te sugerimos no utilizar la plataforma.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">2. Uso del servicio</h2>
            <p>
              MedMaster es una plataforma educativa potenciada por inteligencia artificial, destinada exclusivamente a fines educativos, personales y profesionales en el área de ciencias de la salud.
              El uso indebido, la reventa o distribución sin autorización está prohibido.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">3. Edad mínima</h2>
            <p>
              Para utilizar MedMaster debés ser mayor de 18 años, o menor con el consentimiento y supervisión de tu representante legal.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">4. Propiedad intelectual</h2>
            <p>
              El contenido, marca, logos, diseños, código y materiales generados son propiedad de MedMaster o de sus respectivos titulares. No está permitida la reproducción total o parcial sin autorización escrita.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">5. Conducta del usuario</h2>
            <p>
              El usuario se compromete a no usar la plataforma para actividades ilícitas, fraudulentas, difamatorias o que violen derechos de terceros.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">6. Naturaleza del servicio</h2>
            <p>
              MedMaster brinda herramientas automatizadas con fines informativos y educativos.
              No prestamos servicios de asesoramiento profesional ni generamos una relación médico‑paciente.
              El uso de la plataforma es voluntario y bajo exclusiva responsabilidad del usuario.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">7. Limitación de responsabilidad</h2>
            <p>
              La plataforma se provee “tal cual” y “según disponibilidad”, sin garantías de ningún tipo.
              En la máxima medida permitida por la ley argentina, MedMaster queda eximida de toda responsabilidad por daños directos o indirectos derivados del uso o imposibilidad de uso del servicio.
              El usuario asume todos los riesgos relacionados con el uso de la información obtenida.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">8. Cambios en el servicio</h2>
            <p>
              Nos reservamos el derecho de modificar, suspender o discontinuar servicios, así como de actualizar estos términos, notificando los cambios por este medio.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">9. Legislación y jurisdicción</h2>
            <p>
              Este acuerdo se rige por las leyes de la República Argentina. Ante cualquier conflicto, las partes se someten a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">10. Protección de datos personales</h2>
            <p>
              MedMaster cumple con la Ley 25.326 de Protección de Datos Personales de la República Argentina. El usuario puede ejercer sus derechos de acceso, rectificación y supresión de datos personales comunicándose a <a className="text-primary underline" href="mailto:legal@medmaster.com.ar">legal@medmaster.com.ar</a>.
              La Dirección Nacional de Protección de Datos Personales, órgano de control de la Ley 25.326, tiene la atribución de atender reclamos sobre incumplimiento de normas de protección de datos personales (<a className="text-primary underline" href="https://www.argentina.gob.ar/aaip/datospersonales" target="_blank" rel="noopener noreferrer">www.argentina.gob.ar/aaip/datospersonales</a>).
              El usuario autoriza el tratamiento de sus datos conforme a nuestra <Link className="text-primary underline" href="/privacy">Política de Privacidad</Link>. MedMaster no será responsable por eventuales pérdidas o filtraciones de información ocasionadas por terceros fuera de nuestro control.
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">11. Contacto</h2>
            <p>
              Cualquier duda o reclamo puede realizarse a través del{' '}
              <Link className="text-primary underline" href="/contact">formulario de contacto</Link> en la plataforma
              o al correo legal:{' '}
              <a className="text-primary underline" href="mailto:legal@medmaster.com.ar">legal@medmaster.com.ar</a>
            </p>

            <h2 className="text-lg font-semibold mt-4 mb-2">11. Pagos y reembolsos</h2>
            <p>
              Los pagos se procesan en pesos argentinos a través de proveedores de servicios autorizados. El usuario asume los cargos e impuestos aplicables a cada transacción.
            </p>
            <p>
              Conforme a la Ley 24.240 de Defensa del Consumidor de la República Argentina, podés solicitar la cancelación o reembolso dentro de los diez (10) días hábiles de efectuado el pago contactando a{' '}
              <a className="text-primary underline" href="mailto:legal@medmaster.com.ar">legal@medmaster.com.ar</a>.
            </p>
            <p>
              Una vez vencido dicho plazo y tratándose de un servicio digital de acceso inmediato, MedMaster no ofrece reembolsos, salvo los previstos por la normativa vigente. Nos reservamos el derecho de rechazar solicitudes que se consideren abusivas o fraudulentas.
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  )
}
