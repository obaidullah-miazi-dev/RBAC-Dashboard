import Link from 'next/link';

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-4xl font-bold bg-zinc-900 text-white rounded-md p-4 shadow-lg">403</h1>
      <h2 className="text-2xl mt-4 font-semibold tracking-tight text-zinc-900">Forbidden Access</h2>
      <p className="mt-2 text-zinc-600 max-w-sm">
        You do not have the required permission atoms to view this page. Access is denied by the middleware route guard.
      </p>
      <Link href="/dashboard" className="mt-8 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-md shadow-sm">
        Return to Dashboard
      </Link>
    </div>
  );
}
