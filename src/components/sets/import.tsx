"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { importLibraryAction } from "@/lib/setbuilder-actions";
import { parseCsv, parseRekordbox } from "@/lib/sets/logic";
import { fmt } from "@/lib/i18n/format";
import type { SetT } from "@/lib/i18n/p2/sets";
import { Alert, cx } from "../ui";

export function LibraryImport({ s }: { s: SetT }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const onFile = async (f: File | null) => {
    if (!f) return;
    setMsg(null);
    const text = await f.text();
    const isXml = /\.xml$/i.test(f.name) || text.trimStart().startsWith("<");
    const tracks = isXml ? parseRekordbox(text) : parseCsv(text);
    if (!tracks.length) return setMsg({ kind: "error", text: s.errors.parse });
    start(async () => {
      const r = await importLibraryAction(tracks, isXml ? "rekordbox" : "csv");
      if (!r.ok) return setMsg({ kind: "error", text: s.errors[r.error ?? "generic"] ?? s.errors.generic });
      setMsg({ kind: "ok", text: fmt(s.imported, { a: r.added ?? 0, s: r.skipped ?? 0 }) });
      router.refresh();
    });
  };

  return (
    <div className="space-y-3" data-testid="lib-import">
      <p className="text-sm text-stone">{s.importBody}</p>
      <label className={cx("inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-ivory/40", pending && "pointer-events-none opacity-60")}>
        <FileUp aria-hidden className="size-4" />{pending ? "…" : s.importFile}
        <input type="file" accept=".xml,.csv,.txt,text/csv,application/xml,text/xml" className="sr-only" data-testid="lib-file"
          onChange={(e) => { void onFile(e.target.files?.[0] ?? null); e.target.value = ""; }} />
      </label>
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
    </div>
  );
}
