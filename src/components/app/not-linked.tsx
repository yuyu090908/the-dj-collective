import type { Dict } from "@/lib/i18n";
import { Alert } from "../ui";

export function NotLinked({ t }: { t: Dict }) {
  return <Alert kind="warn">{t.instructor.notLinked}</Alert>;
}
