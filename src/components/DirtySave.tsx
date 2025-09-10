"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  formId: string;
  initial: Record<string, string>;
  className?: string;
  title?: string;
  label?: string;
};

export default function DirtySave({ formId, initial, className, title, label }: Props) {
  const [disabled, setDisabled] = useState(true);

  const initialJson = useMemo(() => JSON.stringify(initial), [initial]);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const computeDirty = () => {
      const fd = new FormData(form);
 
      const current: Record<string, string> = {};
      Object.keys(initial).forEach((k) => {
        current[k] = (fd.get(k) as string) ?? "";
      });
      const currentJson = JSON.stringify(current);
      setDisabled(currentJson === initialJson);
    };

    computeDirty();

    const handler = () => computeDirty();
    form.addEventListener("input", handler);
    form.addEventListener("change", handler);

    return () => {
      form.removeEventListener("input", handler);
      form.removeEventListener("change", handler);
    };
  }, [formId, initialJson, initial]);

  return (
    <button
      type="submit"
      form={formId}
      disabled={disabled}
      className={
        "px-4 py-2 rounded-md font-medium text-sm " +
        (disabled
          ? "bg-green-600/50 text-white/70 cursor-not-allowed "
          : "bg-green-600 hover:bg-green-700 text-white ") +
        (className ?? "")
      }
      title={title ?? "Değişiklikleri Kaydet"}
    >
      {label ?? "Kaydet"}
    </button>
  );
}
