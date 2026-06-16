import type { JobApplication, SortOption, StatusFilter } from "./types";

export type Language = "en" | "es";

type Status = JobApplication["status"];

export type TranslationContent = {
  title: string;
  subtitle: string;

  form: {
    companyPlaceholder: string;
    positionPlaceholder: string;
    dateLabel: string;
    jobLinkPlaceholder: string;
    notesPlaceholder: string;
    addButton: string;
  };

  filters: {
    searchPlaceholder: string;
    filterLabel: string;
    sortLabel: string;
    clearSearchLabel: string;
  };

  statusLabels: Record<Status, string>;
  statusFilterLabels: Record<StatusFilter, string>;
  sortLabels: Record<SortOption, string>;

  list: {
    applicationsCount: string;
    of: string;
    empty: string;
    noMatches: string;
    clearAll: string;
    clearAllConfirm: string;
  };

  card: {
    viewJobPosting: string;
    delete: string;
    appliedOn: string;
    dateLocale: string;
  };
};

export const translations: Record<Language, TranslationContent> = {
  en: {
    title: "Job Application Tracker",
    subtitle:
      "Track job applications, statuses, dates, links, and notes in one place.",

    form: {
      companyPlaceholder: "Company",
      positionPlaceholder: "Position",
      dateLabel: "Date applied",
      jobLinkPlaceholder: "Job posting link",
      notesPlaceholder: "Notes",
      addButton: "Add application",
    },

    filters: {
      searchPlaceholder: "Search by company or position",
      filterLabel: "Filter by status",
      sortLabel: "Sort by date",
      clearSearchLabel: "Clear search",
    },

    statusLabels: {
      Applied: "Applied",
      Interview: "Interview",
      Rejected: "Rejected",
      Offer: "Offer",
      Saved: "Saved",
    },

    statusFilterLabels: {
      All: "All",
      Applied: "Applied",
      Interview: "Interview",
      Rejected: "Rejected",
      Offer: "Offer",
      Saved: "Saved",
    },

    sortLabels: {
      newest: "Newest first",
      oldest: "Oldest first",
    },

    list: {
      applicationsCount: "Applications",
      of: "of",
      empty: "No applications yet. Add your first job application above.",
      noMatches: "No applications match your current filters.",
      clearAll: "Clear all",
      clearAllConfirm: "Are you sure you want to clear all applications?",
    },

    card: {
      viewJobPosting: "View job posting ↗",
      delete: "Delete",
      appliedOn: "Applied on",
      dateLocale: "en-US",
    },
  },

  es: {
    title: "Registro de Postulaciones",
    subtitle:
      "Organiza tus postulaciones, estados, fechas, enlaces y notas en un solo lugar.",

    form: {
      companyPlaceholder: "Empresa",
      positionPlaceholder: "Puesto",
      dateLabel: "Fecha de postulación",
      jobLinkPlaceholder: "Enlace de la vacante",
      notesPlaceholder: "Notas",
      addButton: "Agregar postulación",
    },

    filters: {
      searchPlaceholder: "Buscar por empresa o puesto",
      filterLabel: "Filtrar por estado",
      sortLabel: "Ordenar por fecha",
      clearSearchLabel: "Limpiar búsqueda",
    },

    statusLabels: {
      Applied: "Postulado",
      Interview: "Entrevista",
      Rejected: "Rechazado",
      Offer: "Oferta",
      Saved: "Guardado",
    },

    statusFilterLabels: {
      All: "Todos",
      Applied: "Postulado",
      Interview: "Entrevista",
      Rejected: "Rechazado",
      Offer: "Oferta",
      Saved: "Guardado",
    },

    sortLabels: {
      newest: "Más recientes primero",
      oldest: "Más antiguas primero",
    },

    list: {
      applicationsCount: "Postulaciones",
      of: "de",
      empty: "Aún no hay postulaciones. Agrega tu primera postulación arriba.",
      noMatches: "No hay postulaciones que coincidan con los filtros actuales.",
      clearAll: "Borrar todo",
      clearAllConfirm: "¿Seguro que quieres borrar todas las postulaciones?",
    },

    card: {
      viewJobPosting: "Ver vacante ↗",
      delete: "Eliminar",
      appliedOn: "Postulado el",
      dateLocale: "es",
    },
  },
};
