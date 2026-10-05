import type { JobApplication, SortOption, StatusFilter } from "./types";

export type Language = "en" | "es";

type Status = JobApplication["status"];

export type TranslationContent = {
  title: string;
  subtitle: string;

  form: {
    companyLabel: string;
    positionLabel: string;
    statusLabel: string;
    jobLinkLabel: string;
    notesLabel: string;
    companyPlaceholder: string;
    positionPlaceholder: string;
    dateLabel: string;
    ratingLabel: string;
    jobLinkPlaceholder: string;
    notesPlaceholder: string;
    addButton: string;
    updateButton: string;
    cancelEditButton: string;
    companyRequired: string;
    positionRequired: string;
    jobLinkInvalid: string;
  };

  filters: {
    searchLabel: string;
    searchPlaceholder: string;
    filterLabel: string;
    sortLabel: string;
    clearSearchLabel: string;
  };

  statusLabels: Record<Status, string>;
  statusFilterLabels: Record<StatusFilter, string>;
  sortLabels: Record<SortOption, string>;

  storage: {
    title: string;
    applications: Record<"invalid-data" | "read-error" | "write-error", string>;
    language: Record<"invalid-data" | "read-error" | "write-error", string>;
    protectedData: string;
    replaceButton: string;
    replaceConfirm: string;
    retryApplications: string;
    retryLanguage: string;
  };

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
    edit: string;
    delete: string;
    appliedOn: string;
    rating: string;
    dateLocale: string;
  };
};

export const translations: Record<Language, TranslationContent> = {
  en: {
    title: "Job Application Tracker",
    subtitle:
      "Track job applications, statuses, dates, links, and notes in one place.",

    storage: {
      title: "Storage notice",
      applications: {
        "invalid-data": "Saved applications could not be loaded because their data is invalid.",
        "read-error": "Saved applications could not be read. You can continue working in memory.",
        "write-error": "Your current applications could not be saved. Changes are only in memory and will be lost if you reload or close this page.",
      },
      language: {
        "invalid-data": "The saved language preference is invalid. English is being used until you choose or save a language.",
        "read-error": "Your language preference could not be read. English is being used for now.",
        "write-error": "Your selected language could not be saved. It is only set for this session.",
      },
      protectedData: "Automatic saving is paused to protect any previously stored data. New changes are only in memory and will be lost if you reload or close this page.",
      replaceButton: "Replace stored data with current list",
      replaceConfirm: "Replace all previously stored applications with the current in-memory list? Previous data will be permanently replaced. This cannot be undone.",
      retryApplications: "Retry saving applications",
      retryLanguage: "Save current language",
    },

    form: {
      companyLabel: "Company",
      positionLabel: "Position",
      statusLabel: "Status",
      jobLinkLabel: "Job posting link",
      notesLabel: "Notes",
      companyPlaceholder: "Company",
      positionPlaceholder: "Position",
      dateLabel: "Date applied",
      ratingLabel: "Personal rating",
      jobLinkPlaceholder: "Job posting link",
      notesPlaceholder: "Notes",
      addButton: "Add application",
      updateButton: "Save changes",
      cancelEditButton: "Cancel edit",
      companyRequired: "Enter a company name; spaces alone are not enough.",
      positionRequired: "Enter a position; spaces alone are not enough.",
      jobLinkInvalid: "Enter a valid job URL using http:// or https://, or leave it empty.",
    },

    filters: {
      searchLabel: "Search applications",
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
      edit: "Edit",
      delete: "Delete",
      appliedOn: "Applied on",
      rating: "Rating",
      dateLocale: "en-US",
    },
  },

  es: {
    title: "Registro de Postulaciones",
    subtitle:
      "Organiza tus postulaciones, estados, fechas, enlaces y notas en un solo lugar.",

    storage: {
      title: "Aviso de almacenamiento",
      applications: {
        "invalid-data": "No pudimos cargar las postulaciones guardadas porque sus datos no son válidos.",
        "read-error": "No pudimos leer las postulaciones guardadas. Puedes continuar trabajando en memoria.",
        "write-error": "No pudimos guardar las postulaciones actuales. Los cambios están solo en memoria y se perderán si recargas o cierras esta página.",
      },
      language: {
        "invalid-data": "La preferencia de idioma guardada no es válida. Usamos inglés hasta que elijas o guardes un idioma.",
        "read-error": "No pudimos leer tu preferencia de idioma. Por ahora usamos inglés.",
        "write-error": "No pudimos guardar el idioma seleccionado. Solo se aplica durante esta sesión.",
      },
      protectedData: "El guardado automático está pausado para proteger los datos anteriores. Los cambios nuevos están solo en memoria y se perderán si recargas o cierras esta página.",
      replaceButton: "Reemplazar datos guardados con la lista actual",
      replaceConfirm: "¿Reemplazar todas las postulaciones guardadas anteriormente con la lista actual en memoria? Los datos anteriores se reemplazarán permanentemente. Esta acción no se puede deshacer.",
      retryApplications: "Reintentar guardar postulaciones",
      retryLanguage: "Guardar idioma actual",
    },

    form: {
      companyLabel: "Empresa",
      positionLabel: "Puesto",
      statusLabel: "Estado",
      jobLinkLabel: "Enlace de la vacante",
      notesLabel: "Notas",
      companyPlaceholder: "Empresa",
      positionPlaceholder: "Puesto",
      dateLabel: "Fecha de postulación",
      ratingLabel: "Calificación personal",
      jobLinkPlaceholder: "Enlace de la vacante",
      notesPlaceholder: "Notas",
      addButton: "Agregar postulación",
      updateButton: "Guardar cambios",
      cancelEditButton: "Cancelar edición",
      companyRequired: "Ingresa el nombre de la empresa; no puede contener solo espacios.",
      positionRequired: "Ingresa un puesto; no puede contener solo espacios.",
      jobLinkInvalid: "Ingresa una URL de la vacante válida con http:// o https://, o deja el campo vacío.",
    },

    filters: {
      searchLabel: "Buscar postulaciones",
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
      edit: "Editar",
      delete: "Eliminar",
      appliedOn: "Postulado el",
      rating: "Calificación",
      dateLocale: "es",
    },
  },
};
