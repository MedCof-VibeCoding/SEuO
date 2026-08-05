"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ReportSectionsValue = {
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  open: (id: string) => void;
  openAll: () => void;
  closeAll: () => void;
  allOpen: boolean;
};

const ReportSectionsContext = createContext<ReportSectionsValue | null>(null);

type ReportSectionsProviderProps = {
  sectionIds: string[];
  collapsedIds?: string[];
  children: ReactNode;
};

/**
 * Controla quais blocos do relatório estão abertos, permitindo que a navegação
 * lateral expanda a seção antes de rolar até ela.
 */
export function ReportSectionsProvider({
  sectionIds,
  collapsedIds = [],
  children,
}: ReportSectionsProviderProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(sectionIds.filter((id) => !collapsedIds.includes(id))),
  );

  const toggle = useCallback((id: string) => {
    setOpenIds((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const open = useCallback((id: string) => {
    setOpenIds((previous) =>
      previous.has(id) ? previous : new Set(previous).add(id),
    );
  }, []);

  const openAll = useCallback(() => setOpenIds(new Set(sectionIds)), [sectionIds]);
  const closeAll = useCallback(() => setOpenIds(new Set()), []);

  const value = useMemo<ReportSectionsValue>(
    () => ({
      isOpen: (id) => openIds.has(id),
      toggle,
      open,
      openAll,
      closeAll,
      allOpen: sectionIds.every((id) => openIds.has(id)),
    }),
    [openIds, toggle, open, openAll, closeAll, sectionIds],
  );

  return (
    <ReportSectionsContext.Provider value={value}>
      {children}
    </ReportSectionsContext.Provider>
  );
}

/**
 * Acessa o controle de seções do relatório.
 */
export function useReportSections(): ReportSectionsValue {
  const context = useContext(ReportSectionsContext);
  if (!context) {
    throw new Error("useReportSections requer ReportSectionsProvider.");
  }
  return context;
}
