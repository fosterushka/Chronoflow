interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  onSubmit: () => void;
}

export function UrlInput(
  { value, onChange, error, placeholder, onSubmit }: UrlInputProps,
) {
  return (
    <div class="space-y-1">
      <div class="flex gap-2">
        <input
          type="url"
          value={value}
          onInput={(e) => onChange(e.currentTarget.value)}
          class={`flex-1 text-sm bg-white dark:bg-gray-700 border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${
            error
              ? "border-red-500 dark:border-red-500"
              : "border-gray-200 dark:border-gray-600"
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value}
          class="px-2 py-1 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          Add
        </button>
      </div>
      {error && <div class="text-xs text-red-500">{error}</div>}
    </div>
  );
}
