import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Not authenticated</div>;
  }

  const { name, email, role } = session.user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">
          Dashboard
        </h1>

        <div className="space-y-3">
          <Info label="Name" value={name ?? "N/A"} />
          <Info label="Email" value={email ?? "N/A"} />
          <Info label="Role" value={role} />
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-2">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
