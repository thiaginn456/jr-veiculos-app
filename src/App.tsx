// Componente raiz: configura o roteamento publico, administrativo e as notificacoes globais.
import { useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Home } from "@/pages/Home";
import { Vehicles } from "@/pages/Vehicles";
import { VehicleDetail } from "@/pages/VehicleDetail";

// Admin Pages: carregadas sob demanda (code-splitting) — quem visita o site
// público nunca baixa o código do painel administrativo.
const AdminLogin = lazy(() =>
  import("@/admin/pages/AdminLogin").then((m) => ({ default: m.AdminLogin })),
);
const AdminDashboard = lazy(() =>
  import("@/admin/pages/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const AdminCars = lazy(() =>
  import("@/admin/pages/AdminCars").then((m) => ({ default: m.AdminCars })),
);
const AdminCarForm = lazy(() =>
  import("@/admin/pages/AdminCarForm").then((m) => ({
    default: m.AdminCarForm,
  })),
);
const AdminSellers = lazy(() =>
  import("@/admin/pages/AdminSellers").then((m) => ({
    default: m.AdminSellers,
  })),
);
const AdminSellerForm = lazy(() =>
  import("@/admin/pages/AdminSellerForm").then((m) => ({
    default: m.AdminSellerForm,
  })),
);

const AdminLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-dark-900">
    <p className="text-dark-300 font-poppins">Carregando...</p>
  </div>
);

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    window.history.scrollRestoration = "manual";

    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const id = location.hash.slice(1);

    let cancelled = false;
    const scrollToEl = () => {
      if (cancelled) return;
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // A rota pode acabar de trocar (ex: vindo de /estoque para /#contato),
    // então o elemento ainda não existe no DOM no primeiro frame — tenta de
    // novo por alguns frames até o conteúdo da página aparecer. As seções
    // acima usam pin do GSAP ScrollTrigger, que só termina de montar os
    // espaçadores (e portanto a altura final da página) um instante depois
    // do primeiro render, então repetimos a rolagem mais algumas vezes para
    // corrigir esse deslocamento.
    let attempts = 0;
    let frame: number;
    const timeouts: number[] = [];
    const waitForElement = () => {
      if (cancelled) return;
      if (document.getElementById(id)) {
        scrollToEl();
        timeouts.push(window.setTimeout(scrollToEl, 200));
        timeouts.push(window.setTimeout(scrollToEl, 600));
        timeouts.push(window.setTimeout(scrollToEl, 1200));
      } else if (attempts < 30) {
        attempts += 1;
        frame = requestAnimationFrame(waitForElement);
      }
    };
    waitForElement();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [location.pathname, location.hash]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell flex min-h-screen flex-col bg-black">
      <ScrollToHash />
      {/* Apenas mostrar header/footer em rotas públicas */}
      {!isAdminRoute && (
        <Routes>
          <Route
            path="/*"
            element={
              <>
                <Header />
                <main
                  className="flex-grow page-transition"
                  key={location.pathname}
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/estoque" element={<Vehicles />} />
                    <Route path="/veiculo/:id" element={<VehicleDetail />} />
                    <Route
                      path="/financiamento/:id"
                      element={
                        <div className="pt-24">Formulário de financiamento</div>
                      }
                    />
                    <Route
                      path="/contato"
                      element={<div className="pt-24">Página de contato</div>}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      )}

      {/* Admin Routes */}
      <div className="page-transition" key={`admin-${location.pathname}`}>
        <Suspense fallback={<AdminLoading />}>
        <Routes>
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Cars */}
          <Route
            path="/admin/carros"
            element={
              <ProtectedRoute>
                <AdminCars />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carros/novo"
            element={
              <ProtectedRoute>
                <AdminCarForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carros/:id/editar"
            element={
              <ProtectedRoute>
                <AdminCarForm />
              </ProtectedRoute>
            }
          />

          {/* Admin Sellers */}
          <Route
            path="/admin/vendedores"
            element={
              <ProtectedRoute>
                <AdminSellers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendedores/novo"
            element={
              <ProtectedRoute>
                <AdminSellerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendedores/:id/editar"
            element={
              <ProtectedRoute>
                <AdminSellerForm />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}

export function App() {
  return (
    // basename garante que as rotas funcionem sob o subcaminho do GitHub
    // Pages (https://usuario.github.io/jr-veiculos-app/) e continua "/"
    // normalmente em outros hosts, já que BASE_URL vira "/" fora do Pages.
    <Router basename={import.meta.env.BASE_URL}>
      <AppContent />
    </Router>
  );
}

export default App;
