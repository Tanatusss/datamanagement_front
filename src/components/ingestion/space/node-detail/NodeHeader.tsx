"use client";

import { ArrowLeft, Database } from "lucide-react";

type Props = {
  connectionName: string;
  schema: string;
  table: string;
  dbIcon?: string;
  dbType?: string;
  onBack: () => void;
  withBasePath: (p?: string) => string;
};

export function NodeHeader({
  connectionName,
  schema,
  table,
  dbIcon,
  dbType,
  onBack,
  withBasePath,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-900 px-5 py-4 shadow-sm border border-slate-700">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="
              flex h-12 w-12 items-center justify-center
              rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800
              text-white ring-4 ring-slate-700/80
            "
          >
            {dbIcon ? (
              <img
                src={withBasePath(dbIcon)}
                alt={dbType || connectionName}
                className="h-8 w-8 object-contain"
                draggable={false}
              />
            ) : (
              <Database className="h-4 w-4" />
            )}
          </div>

          <div>
            <h1 className="text-lg font-semibold text-slate-50">
              <span className="text-sky-400">{connectionName}</span>
            </h1>
            <p className="text-xs text-slate-400">Schema: {schema}</p>
            <p className="text-xs text-slate-400">Table: {table}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
