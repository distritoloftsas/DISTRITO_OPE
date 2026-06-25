import { etiquetaEstado, type EstadoPedido, type PedidoResponse } from "../../types/pedido";

/**
 * Mensajes "humanos" para enviar al cliente segun la fase actual del pedido.
 * Se arman dinamicamente con su nombre, codigo, sede y un link de seguimiento.
 */
export function mensajeWhatsapp(pedido: PedidoResponse): string {
  const nombre = primerNombre(pedido.cliente.nombre);
  const url = `${window.location.origin}/p/${pedido.codigoQr}`;
  const sede = pedido.sede.nombre;

  const texto = mensajePorEstado(pedido.estado, nombre, pedido.codigoQr, sede);
  return `${texto}\n\nSigue tu pedido aquí: ${url}`;
}

function mensajePorEstado(
  estado: EstadoPedido,
  nombre: string,
  codigo: string,
  sede: string
): string {
  switch (estado) {
    case "RECIBIDO":
      return `¡Hola ${nombre}! 🧺 Recibimos tu pedido ${codigo} en Distrito Loft ${sede}.`;
    case "LAVANDO":
      return `¡Hola ${nombre}! Tu pedido ${codigo} ya está en lavado.`;
    case "SECANDO":
      return `${nombre}, tu pedido ${codigo} pasó a la secadora.`;
    case "DOBLANDO":
      return `${nombre}, ya casi: estamos doblando tu pedido ${codigo}.`;
    case "LISTO":
      return `¡Listo ${nombre}! Tu pedido ${codigo} ya puedes pasar a recogerlo en Distrito Loft ${sede}.`;
    case "ENTREGADO":
      return `¡Gracias ${nombre}! Esperamos que disfrutes tu ropa limpia. Te esperamos de vuelta. 💛`;
    case "CANCELADO":
      return `${nombre}, tu pedido ${codigo} fue cancelado. Si tienes dudas, contáctanos.`;
    default:
      return `${nombre}, tu pedido ${codigo} cambió a estado: ${etiquetaEstado(estado)}.`;
  }
}

/**
 * Construye el link wa.me con telefono normalizado y mensaje URL-encoded.
 * - Asume Colombia (+57) si no viene prefijo.
 * - Quita espacios, guiones y parentesis.
 */
export function linkWhatsapp(telefono: string | null, mensaje: string): string | null {
  if (!telefono) return null;
  const limpio = telefono.replace(/[\s\-()]/g, "");
  let numero = limpio.startsWith("+") ? limpio.slice(1) : limpio;
  if (numero.length === 10 && numero.startsWith("3")) {
    numero = "57" + numero; // celular Colombia
  }
  if (!/^\d{10,15}$/.test(numero)) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function abrirWhatsapp(pedido: PedidoResponse): boolean {
  const link = linkWhatsapp(pedido.cliente.telefono, mensajeWhatsapp(pedido));
  if (!link) return false;
  window.open(link, "_blank", "noopener,noreferrer");
  return true;
}

function primerNombre(nombre: string): string {
  return nombre.split(" ")[0] ?? nombre;
}
