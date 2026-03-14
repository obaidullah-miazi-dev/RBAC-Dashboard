export default function SettingsPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          This is a placeholder page. It is gated by the <code>read:settings</code> atom.
        </p>
      </div>
    </div>
  );
}
