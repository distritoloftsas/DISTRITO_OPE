import { PlanesList } from "./features/planes/PlanesList";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl border border-stone-200 shadow-lg p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-distrito-black text-distrito-gold flex items-center justify-center text-xl font-medium tracking-widest mx-auto mb-4">
          DL
        </div>
        <h1 className="text-2xl font-medium mb-2">Distrito Loft</h1>
        <p className="text-sm text-distrito-gold-dark mb-8">Plataforma Operativa</p>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-stone-500 mb-3">
            Planes disponibles (en vivo desde el API)
          </p>
          <PlanesList />
        </div>
      </div>
    </div>
  );
}

export default App;
