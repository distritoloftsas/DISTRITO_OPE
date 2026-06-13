export interface Plan {
  id: number;
  nombre: string;
  descripcion: string | null;
  kilosMaxCiclo: number;
  incluyeDoblado: boolean;
  incluyeDomicilio: boolean;
  precio: number;
  orden: number;
  activo: boolean;
}
