import { Link } from "react-router-dom";
import { usePageTitle } from "../lib/usePageTitle";

const VERSION = "1.0";
const FECHA_VIGENCIA = "26 de junio de 2026";

export function PoliticaTratamientoDatosPage() {
  usePageTitle("Política de tratamiento de datos");

  return (
    <div className="min-h-screen bg-distrito-cream py-10 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8 md:p-10">
        <header className="mb-8 border-b border-stone-200 pb-6">
          <div className="text-xs text-stone-500 mb-2">
            Versión {VERSION} · Vigente desde {FECHA_VIGENCIA}
          </div>
          <h1 className="text-2xl font-medium text-distrito-black">
            Política de tratamiento de datos personales
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            Distrito Loft S.A.S. · Conforme a la Ley 1581 de 2012 y el
            Decreto 1377 de 2013 de la República de Colombia.
          </p>
        </header>

        <Seccion titulo="1. Identificación del responsable">
          <p>
            <strong>Distrito Loft S.A.S.</strong>, sociedad colombiana con
            NIT {"{{NIT}}"}, domiciliada en Neiva, Huila. Canal de atención al
            titular para ejercer sus derechos:{" "}
            <a className="text-distrito-gold-dark underline" href="mailto:distritoloftsas@gmail.com">
              distritoloftsas@gmail.com
            </a>.
          </p>
        </Seccion>

        <Seccion titulo="2. Datos que recolectamos">
          <ul className="list-disc pl-5 space-y-1">
            <li>Nombre completo, teléfono y correo electrónico.</li>
            <li>Historial de pedidos de lavandería (planes contratados, fechas, pagos).</li>
            <li>Datos técnicos del uso de la plataforma (sesión, IP, navegador).</li>
          </ul>
          <p className="mt-3">
            No recolectamos datos sensibles (salud, religión, orientación sexual,
            etc.). Si en algún momento lo necesitáramos, pediríamos consentimiento
            expreso por separado.
          </p>
        </Seccion>

        <Seccion titulo="3. Finalidades del tratamiento">
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestionar el ciclo de tu pedido: recibir, lavar, secar y entregar.</li>
            <li>Notificarte el estado (recibido, lavando, listo) por WhatsApp o
              en la plataforma.</li>
            <li>Llevar contabilidad y emitir comprobantes de pago.</li>
            <li>Mejorar el servicio (estadísticas internas, anónimas).</li>
            <li>Cumplir obligaciones legales (DIAN, SIC).</li>
          </ul>
          <p className="mt-3">
            <strong>No vendemos ni cedemos</strong> tus datos a terceros con
            fines comerciales.
          </p>
        </Seccion>

        <Seccion titulo="4. Tus derechos como titular">
          <p>
            De acuerdo con el artículo 8 de la Ley 1581, en cualquier momento puedes:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Conocer</strong> qué datos tuyos tenemos almacenados.</li>
            <li><strong>Actualizar</strong> o <strong>rectificar</strong> tus datos.</li>
            <li><strong>Solicitar la supresión</strong> de tu cuenta y datos asociados,
              salvo aquellos que debamos conservar por obligación legal o contractual.</li>
            <li><strong>Revocar</strong> el consentimiento.</li>
            <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y
              Comercio (SIC).</li>
          </ul>
        </Seccion>

        <Seccion titulo="5. Cómo ejercer tus derechos">
          <p>
            Escríbenos a{" "}
            <a className="text-distrito-gold-dark underline" href="mailto:distritoloftsas@gmail.com">
              distritoloftsas@gmail.com
            </a>{" "}
            indicando tu nombre, teléfono registrado y el derecho que deseas
            ejercer. Responderemos en un plazo máximo de <strong>15 días hábiles</strong>{" "}
            (consultas) o <strong>15 días hábiles</strong> (reclamos), conforme a la ley.
          </p>
        </Seccion>

        <Seccion titulo="6. Seguridad y retención">
          <p>
            Tus datos se almacenan en bases de datos cifradas en tránsito (HTTPS) y
            en reposo. Conservamos los datos mientras tu cuenta esté activa y por
            el tiempo necesario para cumplir obligaciones fiscales (Estatuto
            Tributario colombiano: 5 años) después de la última operación.
          </p>
        </Seccion>

        <Seccion titulo="7. Cambios a esta política">
          <p>
            Podemos actualizar esta política. Cuando haya cambios materiales,
            te pediremos aceptar la nueva versión al iniciar sesión. La versión
            vigente se identifica con el número que aparece al inicio de este
            documento.
          </p>
        </Seccion>

        <footer className="mt-10 pt-6 border-t border-stone-200 text-center">
          <Link to="/registro" className="text-sm text-distrito-gold-dark hover:underline">
            ← Volver al registro
          </Link>
        </footer>
      </article>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-7 text-sm text-stone-700 leading-relaxed">
      <h2 className="text-base font-medium text-distrito-black mb-2">{titulo}</h2>
      {children}
    </section>
  );
}
