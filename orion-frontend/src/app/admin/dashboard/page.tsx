import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KPIS = [
  { label: "Pedidos hoy", valor: "—" },
  { label: "En tránsito", valor: "—" },
  { label: "En aduana", valor: "—" },
  { label: "Entregados (mes)", valor: "—" },
];

/**
 * Dashboard placeholder (Sprint 1). Es el destino tras iniciar sesión.
 * Los KPIs, tablas y gráficos reales se construyen en Sprints 2-3.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-on-surface-variant">
          Resumen general de la operación.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-on-surface-variant">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{kpi.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-12 text-center text-on-surface-muted">
          Los datos del dashboard estarán disponibles cuando se conecte el
          backend (Sprints 2-3).
        </CardContent>
      </Card>
    </div>
  );
}
