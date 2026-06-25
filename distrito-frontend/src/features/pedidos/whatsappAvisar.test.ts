import { describe, expect, it, beforeEach } from "vitest";
import { linkWhatsapp, mensajeWhatsapp } from "./whatsappAvisar";
import type { PedidoResponse } from "../../types/pedido";

beforeEach(() => {
  // jsdom no esta disponible: stubeamos window.location.origin para el helper.
  // @ts-expect-error - vitest node sin DOM
  globalThis.window = { location: { origin: "https://app.distritoloft.com" } };
});

describe("linkWhatsapp", () => {
  it("normaliza celular colombiano de 10 digitos y antepone 57", () => {
    expect(linkWhatsapp("3203628511", "Hola")).toBe(
      "https://wa.me/573203628511?text=Hola"
    );
  });

  it("respeta el prefijo internacional si ya viene con +", () => {
    expect(linkWhatsapp("+34911223344", "Hola")).toBe(
      "https://wa.me/34911223344?text=Hola"
    );
  });

  it("limpia espacios, guiones y parentesis", () => {
    expect(linkWhatsapp("(320) 362-8511", "Hola")).toBe(
      "https://wa.me/573203628511?text=Hola"
    );
  });

  it("codifica el mensaje", () => {
    const url = linkWhatsapp("3203628511", "Hola mundo & cia");
    expect(url).toContain("Hola%20mundo%20%26%20cia");
  });

  it("devuelve null si el telefono es null o invalido", () => {
    expect(linkWhatsapp(null, "x")).toBeNull();
    expect(linkWhatsapp("123", "x")).toBeNull();
  });
});

describe("mensajeWhatsapp", () => {
  const base: PedidoResponse = {
    id: 1,
    codigoQr: "DL-0042",
    cliente: { id: 1, nombre: "María Gómez", telefono: "3203628511" },
    sede: { id: 1, nombre: "Bambú" },
    plan: {
      id: 1,
      nombre: "Lavado y Secado",
      precio: 18000,
      incluyeDoblado: false,
      incluyeDomicilio: false,
      duracionLavadoMinutos: 30,
      duracionSecadoMinutos: 43,
    },
    estado: "RECIBIDO",
    total: 18000,
    pagado: false,
    observaciones: null,
    fechaRecepcion: new Date().toISOString(),
    fechaEntregaEstimada: null,
    fechaEntregaReal: null,
    fechaInicioLavado: null,
    fechaInicioSecado: null,
    lavadora: null,
    secadora: null,
  };

  it("usa el primer nombre del cliente", () => {
    const msg = mensajeWhatsapp(base);
    expect(msg).toContain("María");
    expect(msg).not.toContain("Gómez"); // se omite el apellido para tono cercano
  });

  it("incluye el codigo del pedido", () => {
    expect(mensajeWhatsapp(base)).toContain("DL-0042");
  });

  it("incluye el link publico de seguimiento", () => {
    expect(mensajeWhatsapp(base)).toContain("/p/DL-0042");
  });

  it("cambia el texto segun el estado", () => {
    const lavando = mensajeWhatsapp({ ...base, estado: "LAVANDO" });
    expect(lavando.toLowerCase()).toContain("lavado");

    const listo = mensajeWhatsapp({ ...base, estado: "LISTO" });
    expect(listo.toLowerCase()).toMatch(/listo|recog/);

    const entregado = mensajeWhatsapp({ ...base, estado: "ENTREGADO" });
    expect(entregado.toLowerCase()).toContain("gracias");
  });
});
