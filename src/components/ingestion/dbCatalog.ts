// src/components/ingestion/dbCatalog.ts

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/dmp").replace(/\/$/, "");

/**
 * ถ้า Next ตั้ง basePath แล้ว (เช่น "/dmp") Next จะ prefix ให้เอง
 * ดังนั้นเราเติม basePath เฉพาะกรณีที่ path ยังไม่ได้มี prefix เท่านั้น
 */
function withBasePath(p: string) {
  if (!BASE_PATH) return p;

  // กันซ้อน: ถ้า path มี /dmp นำอยู่แล้ว ไม่ต้องเติม
  if (p === BASE_PATH || p.startsWith(`${BASE_PATH}/`)) return p;

  // ถ้าเป็น absolute (/icons/..) ให้เติมหน้า
  if (p.startsWith("/")) return `${BASE_PATH}${p}`;

  // ถ้าเป็น relative (icons/..) ให้เติมแบบมี /
  return `${BASE_PATH}/${p}`;
}

export const DB_SECTIONS = [
  {
    key: "sql",
    label: "SQL",
    items: [
      { type: "PostgreSQL", icon: withBasePath("/icons/databases/postgresql.svg") },
      { type: "MySQL", icon: withBasePath("/icons/databases/mysql.svg") },
      { type: "Oracle", icon: withBasePath("/icons/databases/oracle.svg") },
      { type: "SQL Server", icon: withBasePath("/icons/databases/sql-server.svg") },
      { type: "Azure SQL Server", icon: withBasePath("/icons/databases/azure-sql-server.png") },
      { type: "Databricks", icon: withBasePath("/icons/databases/databricks.png") },
      { type: "DB2", icon: withBasePath("/icons/databases/db2.png") },
      { type: "DuckDB", icon: withBasePath("/icons/databases/duckdb.png") },
      { type: "Google BigQuery", icon: withBasePath("/icons/databases/bigquery.png") },
      { type: "Snowflake", icon: withBasePath("/icons/databases/snowflake.png") },
      { type: "Vertica", icon: withBasePath("/icons/databases/vertica.svg") },
    ],
  },
  {
    key: "nosql",
    label: "NoSQL",
    items: [
      { type: "Cassandra", icon: withBasePath("/icons/databases/cassandra.png") },
      { type: "Couchbase", icon: withBasePath("/icons/databases/couchbase.png") },
      { type: "MongoDB", icon: withBasePath("/icons/databases/mongodb.png") },
      { type: "Redis", icon: withBasePath("/icons/databases/redis.svg") },
      { type: "Timestream", icon: withBasePath("/icons/databases/timestream.png") },
    ],
  },
  {
    key: "analytical",
    label: "Analytical",
    items: [
      { type: "Snowflake", icon: withBasePath("/icons/databases/snowflake.png") },
      { type: "Vertica", icon: withBasePath("/icons/databases/vertica.svg") },
      { type: "Databricks", icon: withBasePath("/icons/databases/databricks.png") },
      { type: "Greenplum", icon: withBasePath("/icons/databases/greenplum.svg") },
    ],
  },
  { key: "files", label: "Files", items: [{ type: "CSV Basic", icon: withBasePath("/icons/databases/csv-basic.png") }] },
  {
    key: "bigdata",
    label: "Big Data",
    items: [
      { type: "Apache Hive 4+", icon: withBasePath("/icons/databases/apache-hive.png") },
      { type: "Cloudera Impala", icon: withBasePath("/icons/databases/cloudera-impala.png") },
      { type: "Apache Spark", icon: withBasePath("/icons/databases/apache-spark.png") },
      { type: "Apache Phoenix", icon: withBasePath("/icons/databases/apache-phoenix.png") },
    ],
  },
  {
    key: "fulltext",
    label: "Full-text Search",
    items: [
      { type: "Elasticsearch", icon: withBasePath("/icons/databases/elasticsearch.svg") },
      { type: "Solr", icon: withBasePath("/icons/databases/solr.svg") },
    ],
  },
  {
    key: "graph",
    label: "Graph",
    items: [
      { type: "Neo4j", icon: withBasePath("/icons/databases/neo4j.png") },
      { type: "OrientDB", icon: withBasePath("/icons/databases/orientdb.png") },
    ],
  },
] as const;

export type DbType = (typeof DB_SECTIONS)[number]["items"][number]["type"];

export function getDbIconForType(dbType: DbType): string | undefined {
  for (const section of DB_SECTIONS) {
    const item = section.items.find((i) => i.type === dbType);
    if (item) return (item.icon); 
  }
  return undefined;
}
