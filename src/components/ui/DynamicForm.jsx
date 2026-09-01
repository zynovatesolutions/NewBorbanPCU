import React, { useEffect, useMemo, useState } from "react";
import AppInput from "./AppInput";
import AppButton from "./AppButton";

function FieldRenderer({ field, value, error, onChange, readOnly }) {
  const common = {
    label: field.label,
    required: field.required,
    error,
    disabled: readOnly || field.disabled,
    placeholder: field.placeholder,
  };

  switch (field.type) {
    case "textarea":
      return (
        <label className="block w-full">
          {field.label && (
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          )}
          <textarea
            rows={field.rows || 4}
            value={value ?? ""}
            disabled={common.disabled}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </label>
      );
    case "select":
      return (
        <label className="block w-full">
          {field.label && (
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          )}
          <select
            value={value ?? ""}
            disabled={common.disabled}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {field.placeholder && (
              <option value="">{field.placeholder}</option>
            )}
            {(field.options || []).map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </label>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            disabled={common.disabled}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent/30"
          />
          {field.label}
        </label>
      );
    case "switch":
      return (
        <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
          <span className="text-sm font-medium text-slate-700">{field.label}</span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            disabled={common.disabled}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-accent focus:ring-accent/30"
          />
        </label>
      );
    case "custom":
      return field.render?.({ value, onChange: (v) => onChange(field.name, v), error, readOnly });
    default:
      return (
        <AppInput
          {...common}
          type={field.type || "text"}
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );
  }
}

export default function DynamicForm({
  fields = [],
  defaultValues = {},
  mode = "create",
  onSubmit,
  submitLabel,
  cancelLabel = "Cancel",
  onCancel,
  loading = false,
  columns = 1,
  footer,
}) {
  const readOnly = mode === "view";
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const visibleFields = useMemo(
    () =>
      fields.filter((field) => {
        if (typeof field.hidden === "function") return !field.hidden(values);
        return !field.hidden;
      }),
    [fields, values]
  );

  const handleChange = (name, val) => {
    setValues((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    visibleFields.forEach((field) => {
      if (field.required && (values[field.name] === "" || values[field.name] == null)) {
        next[field.name] = `${field.label || field.name} is required`;
      }
      if (field.validate) {
        const msg = field.validate(values[field.name], values);
        if (msg) next[field.name] = msg;
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validate()) return;
    onSubmit?.(values);
  };

  const gridClass =
    columns === 2
      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
      : "grid grid-cols-1 gap-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={gridClass}>
        {visibleFields.map((field) => (
          <div
            key={field.name}
            className={field.fullWidth ? "md:col-span-2" : ""}
          >
            <FieldRenderer
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              onChange={handleChange}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          {onCancel && (
            <AppButton type="button" variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </AppButton>
          )}
          <AppButton type="submit" variant="accent" loading={loading}>
            {submitLabel || (mode === "edit" ? "Save Changes" : "Create")}
          </AppButton>
        </div>
      )}

      {footer}
    </form>
  );
}
