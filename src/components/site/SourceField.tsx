import { useEffect, useState } from "react";
import { Field } from "@/components/site/FormKit";
import { useI18n } from "@/lib/i18n";

// Optional question on both forms. The answer is kept in this browser tab only and sent with the request.
const SOURCE_KEY = "ms-source";
const OPTIONS = [
  "X (Twitter)", "Telegram", "Reddit", "FetLife", "Instagram", "Facebook",
  "A search engine (Google, Bing)", "A directory or listing site", "The quiz on this site", "A friend or referral", "Other",
];

export function SourceField() {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  useEffect(() => { try { setValue(sessionStorage.getItem(SOURCE_KEY) ?? ""); } catch { /* storage blocked */ } }, []);
  const choose = (next: string) => {
    setValue(next);
    try { if (next) sessionStorage.setItem(SOURCE_KEY, next); else sessionStorage.removeItem(SOURCE_KEY); } catch { /* storage blocked */ }
  };
  return (
    <Field label="How did you find me? (optional)">
      <select className="field" value={value} onChange={(e) => choose(e.target.value)}>
        <option value="">{t("Select…")}</option>
        {OPTIONS.map((o) => <option key={o} value={o}>{t(o)}</option>)}
      </select>
    </Field>
  );
}
