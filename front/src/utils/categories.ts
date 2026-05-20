export interface CategoryStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const CATEGORIES_LIST = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Serviços",
  "Receita",
  "Seguro",
  "Outros"
];

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Moradia: {
    label: "Moradia",
    bg: "rgba(56, 189, 248, 0.1)", // Light blue slate
    text: "rgb(56, 189, 248)",
    border: "rgba(56, 189, 248, 0.3)",
  },
  Alimentação: {
    label: "Alimentação",
    bg: "rgba(251, 146, 60, 0.1)", // Amber / Orange
    text: "rgb(251, 146, 60)",
    border: "rgba(251, 146, 60, 0.3)",
  },
  Transporte: {
    label: "Transporte",
    bg: "rgba(34, 211, 238, 0.1)", // Cyan
    text: "rgb(34, 211, 238)",
    border: "rgba(34, 211, 238, 0.3)",
  },
  Saúde: {
    label: "Saúde",
    bg: "rgba(248, 113, 113, 0.1)", // Red / Coral
    text: "rgb(248, 113, 113)",
    border: "rgba(248, 113, 113, 0.3)",
  },
  Lazer: {
    label: "Lazer",
    bg: "rgba(167, 139, 250, 0.1)", // Violet / Purple
    text: "rgb(167, 139, 250)",
    border: "rgba(167, 139, 250, 0.3)",
  },
  Educação: {
    label: "Educação",
    bg: "rgba(52, 211, 153, 0.1)", // Green / Emerald
    text: "rgb(52, 211, 153)",
    border: "rgba(52, 211, 153, 0.3)",
  },
  Serviços: {
    label: "Serviços",
    bg: "rgba(156, 163, 175, 0.1)", // Slate Gray
    text: "rgb(209, 213, 219)",
    border: "rgba(156, 163, 175, 0.3)",
  },
  Receita: {
    label: "Receita",
    bg: "rgba(132, 204, 22, 0.1)", // Lime brand green neon
    text: "rgb(163, 230, 53)",
    border: "rgba(132, 204, 22, 0.3)",
  },
  Seguro: {
    label: "Seguro",
    bg: "rgba(236, 72, 153, 0.1)", // Pink
    text: "rgb(236, 72, 153)",
    border: "rgba(236, 72, 153, 0.3)",
  },
  Outros: {
    label: "Outros",
    bg: "rgba(255, 255, 255, 0.05)",
    text: "rgba(255, 255, 255, 0.6)",
    border: "rgba(255, 255, 255, 0.15)",
  },
  "Não Categorizado": {
    label: "Não Categorizado",
    bg: "rgba(255, 255, 255, 0.03)",
    text: "rgba(255, 255, 255, 0.4)",
    border: "rgba(255, 255, 255, 0.08)",
  },
  "PENDENTE_CLASSIFICACAO": {
    label: "Pendente...",
    bg: "rgba(244, 63, 94, 0.1)", // Rose 500
    text: "rgb(244, 63, 94)",
    border: "rgba(244, 63, 94, 0.3)",
  }
};

export function getCategoryStyle(category?: string): CategoryStyle {
  if (!category) return CATEGORY_STYLES["Não Categorizado"];
  if (CATEGORY_STYLES[category]) return CATEGORY_STYLES[category];
  
  // Gerar cor técnica premium baseada no hash da string para categorias personalizadas!
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  
  return {
    label: category,
    bg: `hsla(${hue}, 85%, 60%, 0.1)`,
    text: `hsl(${hue}, 85%, 60%)`,
    border: `hsla(${hue}, 85%, 60%, 0.3)`
  };
}
