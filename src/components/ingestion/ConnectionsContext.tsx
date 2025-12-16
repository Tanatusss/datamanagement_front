"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import {
  CreateConnectionModal,
} from "./connection/CreateConnectionModal";

import { ConnectionDetailModal } from "./connection/ConnectionDetailModal"; // 👈 เพิ่ม import
import { DB_SECTIONS } from "./dbCatalog";

export type DbType = (typeof DB_SECTIONS)[number]["items"][number]["type"];

export type ConnectionCategory =
  | "SQL"
  | "NoSQL"
  | "Analytical"
  | "Files"
  | "Big Data"
  | "Full-text Search"
  | "Graph Database";

export type ConnectionItem = {
  id: string;
  name: string;
  type: DbType;
  category: ConnectionCategory;
  slug: string;
  lastViewedAt: string | null;
};

type ConnectionContextValue = {
  connections: ConnectionItem[];
  openCreateModal: () => void;
  markViewed: (id: string) => void;
  deleteConnection: (id: string) => void;
  openConnectionDetail: (id: string) => void; // 👈 เพิ่ม
  closeConnectionDetail: () => void;          // 👈 เพิ่ม
};

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

// ------------------------------------------------------
// CATEGORY + slug helpers
// ------------------------------------------------------

function getCategory(type: DbType): ConnectionCategory {
  switch (type) {
    case "PostgreSQL":
    case "MySQL":
    case "Oracle":
    case "SQL Server":
    case "Azure SQL Server":
    case "DB2":
    case "DuckDB":
      return "SQL";

    case "Databricks":
    case "Google BigQuery":
    case "Snowflake":
    case "Vertica":
      return "Analytical";

    case "Cassandra":
    case "Couchbase":
    case "MongoDB":
    case "Redis":
    case "Timestream":
      return "NoSQL";

    case "CSV Basic":
      return "Files";

    case "Apache Hive 4+":
    case "Cloudera Impala":
    case "Apache Spark":
    case "Apache Phoenix":
      return "Big Data";

    case "Elasticsearch":
    case "Solr":
      return "Full-text Search";

    case "Neo4j":
    case "OrientDB":
      return "Graph Database";

    default:
      return "SQL";
  }
}

function makeSlug(name: string, type: DbType): string {
  return `${type}-${name}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

// ------------------------------------------------------
// Provider
// ------------------------------------------------------

type ProviderProps = { children: ReactNode };

export function ConnectionProvider({ children }: ProviderProps) {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // 👇 state สำหรับ detail modal
  const [detailId, setDetailId] = useState<string | null>(null);

  // --------------------------------------------------
  // OPTIONAL: โหลดข้อมูลจาก localStorage
  // --------------------------------------------------
  useEffect(() => {
    const raw = localStorage.getItem("connections");
    if (raw) {
      try {
        setConnections(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  // เซฟทุกครั้งที่เปลี่ยน
  useEffect(() => {
    localStorage.setItem("connections", JSON.stringify(connections));
  }, [connections]);

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------

  const openCreateModal = () => setModalOpen(true);
  const closeCreateModal = () => setModalOpen(false);

  const handleCreate = (name: string, type: DbType) => {
    const newConn: ConnectionItem = {
      id: crypto.randomUUID(),
      name,
      type,
      category: getCategory(type),
      slug: makeSlug(name, type),
      lastViewedAt: null,
    };

    setConnections((prev) => [...prev, newConn]);
    closeCreateModal();
  };

  // --------------------------------------------------
  // MARK VIEWED
  // --------------------------------------------------

  const markViewed = (id: string) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, lastViewedAt: new Date().toISOString() }
          : c
      )
    );
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const deleteConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    // ถ้ากำลังเปิด detail ของตัวที่ลบอยู่ ให้ปิด modal ด้วย
    setDetailId((current) => (current === id ? null : current));
  };

  // --------------------------------------------------
  // DETAIL MODAL
  // --------------------------------------------------

  const openConnectionDetail = (id: string) => {
    setDetailId(id);
  };

  const closeConnectionDetail = () => {
    setDetailId(null);
  };

  // --------------------------------------------------
  // EXPORT CONTEXT
  // --------------------------------------------------

  const value = useMemo(
    () => ({
      connections,
      openCreateModal,
      markViewed,
      deleteConnection,
      openConnectionDetail,
      closeConnectionDetail,
    }),
    [connections]
  );

  const selectedConnection =
    detailId != null
      ? connections.find((c) => c.id === detailId) ?? null
      : null;

  return (
    <ConnectionContext.Provider value={value}>
      {children}

      <CreateConnectionModal
        open={modalOpen}
        onClose={closeCreateModal}
        onCreate={handleCreate}
      />

      {/* Modal แสดง Connection Detail */}
      <ConnectionDetailModal
        open={detailId !== null && !!selectedConnection}
        onClose={closeConnectionDetail}
        connection={selectedConnection}
      />
    </ConnectionContext.Provider>
  );
}

export function useConnections() {
  const ctx = useContext(ConnectionContext);
  if (!ctx)
    throw new Error("useConnections must be used inside ConnectionProvider");
  return ctx;
}
