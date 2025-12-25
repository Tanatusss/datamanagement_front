// src/components/ingestion/connection/ConnectionSettingsStep.tsx
"use client";

import React, { useState } from "react";
import { DbType } from "../dbCatalog";

type Props = {
  selectedType: DbType;
  name: string;
  onChangeName: (v: string) => void;
};

export function ConnectionSettingsStep({
  selectedType,
  name,
  onChangeName,
}: Props) {
  switch (selectedType) {
    case "PostgreSQL":
      return <PostgresSettings name={name} onChangeName={onChangeName} />;
    case "Oracle":
      return <OracleSettings name={name} onChangeName={onChangeName} />;
    case "SQL Server":
      return <SqlServerSettings name={name} onChangeName={onChangeName} />;
    default:
      return (
        <p className="text-xs text-[#9CA3AF]">
          This database type is not supported yet.
        </p>
      );
  }
}

/* --------------------------------------------------------------------------
   PostgreSQL
-------------------------------------------------------------------------- */

type PostgresAuthMode = "database-native" | "pgpass";

function PostgresSettings({
  name,
  onChangeName,
}: {
  name: string;
  onChangeName: (v: string) => void;
}) {
  const [connectBy, setConnectBy] = useState<"host" | "url">("host");

  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("postgres");

  const [rawJdbc, setRawJdbc] = useState(
    `jdbc:postgresql://${host}:${port}/${database}`
  );

  const [authMode, setAuthMode] = useState<PostgresAuthMode>("database-native");
  const [username, setUsername] = useState("postgres");
  const [password, setPassword] = useState("");
  const [savePassword, setSavePassword] = useState(true);

  // สำหรับ PgPass: override host เพิ่มเติม
  const [overrideHostEnabled, setOverrideHostEnabled] = useState(false);
  const [overrideHost, setOverrideHost] = useState("");

  const AUTH_OPTIONS: { value: PostgresAuthMode; label: string }[] = [
    { value: "database-native", label: "Database Native" },
    { value: "pgpass", label: "PostgreSQL PgPass" },
  ];

  const canUsePassword = authMode === "database-native";

  const effectiveHost =
    authMode === "pgpass" && overrideHostEnabled && overrideHost.trim() !== ""
      ? overrideHost.trim()
      : host;

  const computedJdbc = `jdbc:postgresql://${effectiveHost}:${port}/${database}`;
  const jdbc = connectBy === "host" ? computedJdbc : rawJdbc;

  return (
    <div className="space-y-4 text-[#F0EEE9]">
      {/* Connection name */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#CBD5E1]">
          Connection name
        </label>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="
            w-full rounded-md border border-[#1F2937] bg-[#020617]
            px-3 py-2 text-sm text-[#F0EEE9]
            placeholder-[#64748B]
            focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
            transition
          "
        />
      </div>

      {/* Server */}
      <div className="rounded-md border border-[#1F2937] bg-[#020617]">
        <div className="border-b border-[#1F2937] bg-[#020617] px-4 py-2">
          <p className="text-xs font-semibold text-[#E5E7EB]">Server</p>
        </div>

        <div className="space-y-3 px-4 py-3 text-xs text-[#E5E7EB]">
          {/* Connect by */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <span className="text-[#9CA3AF]">Connect by:</span>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-xs text-[#E5E7EB]">
                <input
                  type="radio"
                  name="pg-connectBy"
                  value="host"
                  checked={connectBy === "host"}
                  onChange={() => setConnectBy("host")}
                />
                Host
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#E5E7EB]">
                <input
                  type="radio"
                  name="pg-connectBy"
                  value="url"
                  checked={connectBy === "url"}
                  onChange={() => setConnectBy("url")}
                />
                URL
              </label>
            </div>
          </div>

          {/* URL (JDBC) */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <span className="text-[#9CA3AF]">URL:</span>
            <input
              value={jdbc}
              onChange={(e) => {
                if (connectBy === "url") setRawJdbc(e.target.value);
              }}
              readOnly={connectBy === "host"}
              className={[
                "w-full rounded-md border px-2 py-1 text-[11px]",
                connectBy === "host"
                  ? "bg-[#020617] border-[#111827] text-[#9CA3AF]"
                  : "bg-[#020617] border-[#1F2937] text-[#E5E7EB] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500",
              ].join(" ")}
            />
          </div>

          {/* Host / Database / Port */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Host:</label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Database:</label>
            <input
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          <div className="grid grid-cols-[120px_80px] items-center gap-2">
            <label className="text-[#9CA3AF]">Port:</label>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="rounded-md border border-[#1F2937] bg-[#020617]">
        <div className="border-b border-[#1F2937] bg-[#020617] px-4 py-2">
          <p className="text-xs font-semibold text-[#E5E7EB]">
            Authentication
          </p>
        </div>

        <div className="space-y-3 px-4 py-3 text-xs text-[#E5E7EB]">
          {/* Authentication select */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Authentication:</label>
            <select
              value={authMode}
              onChange={(e) =>
                setAuthMode(e.target.value as PostgresAuthMode)
              }
              className="
                w-full rounded-md border border-[#1F2937] bg-[#020617]
                px-2 py-1.5 text-xs text-[#F0EEE9]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            >
              {AUTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Username */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Username:</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                rounded-md border border-[#1F2937] bg-[#020617]
                px-2 py-1.5 text-sm text-[#F0EEE9]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!canUsePassword}
              placeholder={
                canUsePassword ? "" : "Using .pgpass – no password needed"
              }
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          {/* Save password */}
          {canUsePassword && (
            <label className="flex items-center gap-2 pl-[120px] text-xs text-[#E5E7EB]">
              <input
                type="checkbox"
                checked={savePassword}
                onChange={(e) => setSavePassword(e.target.checked)}
              />
              Save password
            </label>
          )}

          {/* Override host (PgPass) */}
          {authMode === "pgpass" && (
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-[#9CA3AF]">Override host:</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={overrideHostEnabled}
                  onChange={(e) =>
                    setOverrideHostEnabled(e.target.checked)
                  }
                />
                <input
                  value={overrideHost}
                  onChange={(e) => setOverrideHost(e.target.value)}
                  disabled={!overrideHostEnabled}
                  placeholder="e.g. mydb.internal"
                  className="
                    flex-1 rounded-md border border-[#1F2937] bg-[#020617]
                    px-2 py-1.5 text-sm text-[#F0EEE9]
                    disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                    focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
                  "
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Oracle
-------------------------------------------------------------------------- */

type OracleAuthMode = "oracle-native" | "os-auth";

function OracleSettings({
  name,
  onChangeName,
}: {
  name: string;
  onChangeName: (v: string) => void;
}) {
  const [connectBy, setConnectBy] = useState<"host" | "url">("host");

  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("1521");
  const [serviceName, setServiceName] = useState("ORCL");

  const [rawJdbc, setRawJdbc] = useState(
    `jdbc:oracle:thin:@${host}:${port}/${serviceName}`
  );

  const [authMode, setAuthMode] = useState<OracleAuthMode>("oracle-native");
  const [username, setUsername] = useState("system");
  const [password, setPassword] = useState("");
  const [savePassword, setSavePassword] = useState(true);

  const computedJdbc = `jdbc:oracle:thin:@${host}:${port}/${serviceName}`;
  const jdbc = connectBy === "host" ? computedJdbc : rawJdbc;

  const AUTH_OPTIONS: { value: OracleAuthMode; label: string }[] = [
    { value: "oracle-native", label: "Oracle Database Native" },
    { value: "os-auth", label: "OS Authentication" },
  ];

  const canUseUserPass = authMode === "oracle-native";

  return (
    <div className="space-y-4 text-[#F0EEE9]">
      {/* Connection name */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#CBD5E1]">
          Connection name
        </label>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="
            w-full rounded-md border border-[#1F2937] bg-[#020617]
            px-3 py-2 text-sm text-[#F0EEE9]
            placeholder-[#64748B]
            focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
            transition
          "
        />
      </div>

      {/* Server */}
      <div className="rounded-md border border-[#1F2937] bg-[#020617]">
        <div className="border-b border-[#1F2937] bg-[#020617] px-4 py-2">
          <p className="text-xs font-semibold text-[#E5E7EB]">Server</p>
        </div>

        <div className="space-y-3 px-4 py-3 text-xs text-[#E5E7EB]">
          {/* Connect by */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <span className="text-[#9CA3AF]">Connect by:</span>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-xs text-[#E5E7EB]">
                <input
                  type="radio"
                  name="oracle-connectBy"
                  value="host"
                  checked={connectBy === "host"}
                  onChange={() => setConnectBy("host")}
                />
                Host
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#E5E7EB]">
                <input
                  type="radio"
                  name="oracle-connectBy"
                  value="url"
                  checked={connectBy === "url"}
                  onChange={() => setConnectBy("url")}
                />
                URL
              </label>
            </div>
          </div>

          {/* URL */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <span className="text-[#9CA3AF]">URL:</span>
            <input
              value={jdbc}
              onChange={(e) => {
                if (connectBy === "url") setRawJdbc(e.target.value);
              }}
              readOnly={connectBy === "host"}
              className={[
                "w-full rounded-md border px-2 py-1 text-[11px]",
                connectBy === "host"
                  ? "bg-[#020617] border-[#111827] text-[#9CA3AF]"
                  : "bg-[#020617] border-[#1F2937] text-[#E5E7EB] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500",
              ].join(" ")}
            />
          </div>

          {/* Host / Port / Service Name */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Host:</label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          <div className="grid grid-cols-[120px_80px] items-center gap-2">
            <label className="text-[#9CA3AF]">Port:</label>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-sky-500 focus:ring-1
              "
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Service Name:</label>
            <input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="rounded-md border border-[#1F2937] bg-[#020617]">
        <div className="border-b border-[#1F2937] bg-[#020617] px-4 py-2">
          <p className="text-xs font-semibold text-[#E5E7EB]">
            Authentication
          </p>
        </div>

        <div className="space-y-3 px-4 py-3 text-xs text-[#E5E7EB]">
          {/* Authentication select */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Authentication:</label>
            <select
              value={authMode}
              onChange={(e) =>
                setAuthMode(e.target.value as OracleAuthMode)
              }
              className="
                w-full rounded-md border border-[#1F2937] bg-[#020617]
                px-2 py-1.5 text-xs text-[#F0EEE9]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            >
              {AUTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
  
          {/* Username / Password */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Username:</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!canUseUserPass}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!canUseUserPass}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          {/* Save password */}
          <label className="flex items-center gap-2 pl-[120px] text-xs text-[#E5E7EB]">
            <input
              type="checkbox"
              checked={savePassword}
              onChange={(e) => setSavePassword(e.target.checked)}
            />
            Save password
          </label>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   SQL Server
-------------------------------------------------------------------------- */

type SqlAuthMode =
  | "sql"
  | "ad-integrated"
  | "ad-mfa"
  | "ad-msi"
  | "ad-password"
  | "custom"
  | "ntlm"
  | "windows";

function SqlServerSettings({
  name,
  onChangeName,
}: {
  name: string;
  onChangeName: (v: string) => void;
}) {
  const [connectBy, setConnectBy] = useState<"host" | "url">("host");

  const [host, setHost] = useState("AnalyticsWorkSP");
  const [port, setPort] = useState("3000");
  const [database, setDatabase] = useState("default");
  const [rawJdbc, setRawJdbc] = useState(
    `jdbc:sqlserver://${host}:${port};databaseName=${database}`
  );

  const [authMode, setAuthMode] = useState<SqlAuthMode>("sql");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const computedJdbc = `jdbc:sqlserver://${host}:${port};databaseName=${database}`;
  const jdbc = connectBy === "host" ? computedJdbc : rawJdbc;

  const AUTH_OPTIONS: { value: SqlAuthMode; label: string }[] = [
    { value: "sql", label: "SQL Server Authentication" },
    { value: "ad-integrated", label: "Active Directory - Integrated" },
    { value: "ad-mfa", label: "Active Directory - MFA" },
    { value: "ad-msi", label: "Active Directory - MSI" },
    { value: "ad-password", label: "Active Directory - Password" },
    { value: "custom", label: "Custom" },
    { value: "ntlm", label: "NTLM" },
    { value: "windows", label: "Windows Authentication" },
  ];

  const canUseUserPass =
    authMode === "sql" ||
    authMode === "ad-password" ||
    authMode === "custom";

  return (
    <div className="space-y-4 text-[#F0EEE9]">
      {/* Connection name */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#CBD5E1]">
          Connection name
        </label>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="
            w-full rounded-md border border-[#1F2937] bg-[#020617]
            px-3 py-2 text-sm text-[#F0EEE9]
            placeholder-[#64748B]
            focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
            transition
          "
        />
      </div>

      {/* Server */}
      <div className="rounded-md border border-[#1F2937] bg-[#020617]">
        <div className="border-b border-[#1F2937] bg-[#020617] px-4 py-2">
          <p className="text-xs font-semibold text-[#E5E7EB]">Server</p>
        </div>

        <div className="space-y-3 px-4 py-3 text-xs text-[#E5E7EB]">
          {/* Connect by */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <span className="text-[#9CA3AF]">Connect by:</span>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-xs text-[#E5E7EB]">
                <input
                  type="radio"
                  name="sql-connectBy"
                  value="host"
                  checked={connectBy === "host"}
                  onChange={() => setConnectBy("host")}
                />
                Host
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#E5E7EB]">
                <input
                  type="radio"
                  name="sql-connectBy"
                  value="url"
                  checked={connectBy === "url"}
                  onChange={() => setConnectBy("url")}
                />
                URL
              </label>
            </div>
          </div>

          {/* URL */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <span className="text-[#9CA3AF]">URL:</span>
            <input
              value={jdbc}
              onChange={(e) => {
                if (connectBy === "url") setRawJdbc(e.target.value);
              }}
              readOnly={connectBy === "host"}
              className={[
                "w-full rounded-md border px-2 py-1 text-[11px]",
                connectBy === "host"
                  ? "bg-[#020617] border-[#111827] text-[#9CA3AF]"
                  : "bg-[#020617] border-[#1F2937] text-[#E5E7EB] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500",
              ].join(" ")}
            />
          </div>

          {/* Host / Database / Port */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Host:</label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Database:</label>
            <input
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          <div className="grid grid-cols-[120px_80px] items-center gap-2">
            <label className="text-[#9CA3AF]">Port:</label>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={connectBy === "url"}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="rounded-md border border-[#1F2937] bg-[#020617]">
        <div className="border-b border-[#1F2937] bg-[#020617] px-4 py-2">
          <p className="text-xs font-semibold text-[#E5E7EB]">
            Authentication
          </p>
        </div>

        <div className="space-y-3 px-4 py-3 text-xs text-[#E5E7EB]">
          {/* Authentication select */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Authentication:</label>
            <select
              value={authMode}
              onChange={(e) =>
                setAuthMode(e.target.value as SqlAuthMode)
              }
              className="
                w-full rounded-md border border-[#1F2937] bg-[#020617]
                px-2 py-1.5 text-xs text-[#F0EEE9]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            >
              {AUTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Username / Password */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Username:</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!canUseUserPass}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <label className="text-[#9CA3AF]">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!canUseUserPass}
              className="
                rounded-md border px-2 py-1.5 text-sm
                border-[#1F2937] bg-[#020617] text-[#F0EEE9]
                disabled:bg-[#020617]/60 disabled:text-[#6B7280]
                focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
