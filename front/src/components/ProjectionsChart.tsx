
interface Point {
  date: string;
  balance: number;
  projected?: boolean;
}

interface ProjectionsChartProps {
  historical: Point[];
  projected: Point[];
}

export function ProjectionsChart({ historical, projected }: ProjectionsChartProps) {
  const points = [...historical, ...projected];
  
  if (points.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-center p-8 rounded-2xl border animate-fade-in" style={{
        backgroundColor: 'var(--color-neutral-900)',
        borderColor: 'var(--color-neutral-800)',
        minHeight: '250px'
      }}>
        <span style={{
          fontFamily: 'var(--font-family-body)',
          color: 'var(--color-neutral-400)'
        }}>
          Importe transações para visualizar o gráfico de projeção de saldo.
        </span>
      </div>
    );
  }

  // Encontrar valores máximos e mínimos para dimensionamento do gráfico
  const balances = points.map(p => p.balance);
  const maxVal = Math.max(...balances, 100);
  const minVal = Math.min(...balances, 0);
  const range = maxVal - minVal || 1;
  const padding = range * 0.15;
  const graphMax = maxVal + padding;
  const graphMin = minVal - padding;
  const graphRange = graphMax - graphMin;

  const width = 800;
  const height = 300;
  const paddingX = 40;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Gerar coordenadas dos pontos
  const getCoordinates = (pList: Point[]) => {
    return pList.map((p) => {
      // Posição X proporcional
      const pointIndex = points.indexOf(p);
      const x = paddingX + (pointIndex / (points.length - 1)) * chartWidth;
      // Posição Y invertida (coordenadas SVG começam no topo)
      const y = paddingY + chartHeight - ((p.balance - graphMin) / graphRange) * chartHeight;
      return { x, y, ...p };
    });
  };

  const histCoords = getCoordinates(historical);
  const projCoords = getCoordinates(projected);

  // Criar string de caminho SVG (Path d)
  const createPathString = (coords: typeof histCoords) => {
    if (coords.length === 0) return '';
    return coords.reduce((path, c, i) => {
      return i === 0 ? `M ${c.x} ${c.y}` : `${path} L ${c.x} ${c.y}`;
    }, '');
  };

  const histPath = createPathString(histCoords);
  
  // A linha projetada começa no último ponto histórico para continuidade perfeita
  const lastHist = histCoords[histCoords.length - 1];
  const combinedProjCoords = lastHist ? [lastHist, ...projCoords] : projCoords;
  const projPath = createPathString(combinedProjCoords);

  // Determinar cor da projeção com base no saldo final projetado
  const finalBalance = projected[projected.length - 1]?.balance || 0;
  const isPositive = finalBalance >= 0;
  const projColor = isPositive ? 'var(--color-brand-400)' : '#ef4444'; // Verde limão ou vermelho neon

  return (
    <div className="w-full rounded-2xl border p-6 flex flex-col gap-4 relative overflow-hidden" style={{
      backgroundColor: 'var(--color-neutral-900)',
      borderColor: 'var(--color-neutral-800)',
    }}>
      <div className="flex justify-between items-center z-10">
        <h3 style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-semibold)' as any,
          color: 'var(--color-neutral-100)'
        }}>
          Tendência de Fluxo de Caixa (Próximos 30 dias)
        </h3>
        <div className="flex gap-4 text-xs font-mono" style={{ color: 'var(--color-neutral-400)' }}>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5" style={{ backgroundColor: 'var(--color-brand-400)' }} />
            Histórico (Passado)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed" style={{ borderColor: projColor, borderTopWidth: '2px' }} />
            Projeção (Meta)
          </div>
        </div>
      </div>

      {/* Premium Mobile Metrics Card (visible only on mobile) */}
      <div className="md:hidden flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800/80 bg-neutral-950/40 backdrop-blur-md">
        <div className="flex flex-col gap-0.5">
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '8px', color: 'var(--color-neutral-500)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Saldo Inicial
          </span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-neutral-100)' }}>
            R$ {historical[0]?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
          </span>
        </div>
        <div className="h-8 w-px bg-neutral-800/80" />
        <div className="flex flex-col gap-0.5 items-end">
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '8px', color: 'var(--color-neutral-500)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Projeção Final
          </span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', fontWeight: 'var(--font-weight-bold)', color: projColor }}>
            R$ {finalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="relative w-full h-[300px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            {/* Filtros de Glow Neon */}
            <filter id="glow-hist" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--color-brand-400)" floodOpacity="0.4" />
            </filter>
            <filter id="glow-proj" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={projColor} floodOpacity="0.4" />
            </filter>
            {/* Gradiente de fundo */}
            <linearGradient id="gradient-bg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade de Fundo (Y-Axis) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + chartHeight * ratio;
            const val = graphMax - ratio * graphRange;
            return (
              <g key={i} className="hidden md:block">
                {/* Linha sutil de grade */}
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--color-neutral-800)" strokeWidth="1" strokeOpacity="0.6" />
                {/* Texto em alto contraste e solidez */}
                <text x={paddingX - 10} y={y + 4} textAnchor="end" fill="var(--color-neutral-300)" style={{ fontSize: '10px', fontFamily: 'var(--font-family-mono)', fontWeight: 'var(--font-weight-medium)' as any }}>
                  R$ {val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </text>
              </g>
            );
          })}

          {/* Gradiente sob o histórico */}
          {histCoords.length > 0 && (
            <path
              d={`${histPath} L ${histCoords[histCoords.length - 1].x} ${paddingY + chartHeight} L ${histCoords[0].x} ${paddingY + chartHeight} Z`}
              fill="url(#gradient-bg)"
            />
          )}

          {/* Linha de Histórico Sólida */}
          {histPath && (
            <path
              d={histPath}
              fill="none"
              stroke="var(--color-brand-400)"
              strokeWidth="3.5"
              filter="url(#glow-hist)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Linha de Projeção Tracejada */}
          {projPath && (
            <path
              d={projPath}
              fill="none"
              stroke={projColor}
              strokeWidth="3"
              strokeDasharray="6,4"
              filter="url(#glow-proj)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Eixo X - Labels */}
          {points.length > 0 && [0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const index = Math.floor(ratio * (points.length - 1));
            const p = points[index];
            if (!p) return null;
            const x = paddingX + ratio * chartWidth;
            // No mobile, exibir apenas a primeira e última data para evitar sobreposição
            const isEdge = ratio === 0 || ratio === 1;
            const textClass = isEdge ? "fill-neutral-300 font-medium" : "hidden md:block fill-neutral-400 font-medium";
            return (
              <text key={i} x={x} y={height - 2} textAnchor="middle" className={textClass} style={{ fontSize: '10px', fontFamily: 'var(--font-family-mono)' }}>
                {p.date}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
