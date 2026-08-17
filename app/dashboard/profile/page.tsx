export default function ProfilePage() {
  const admin = {
    firstName: "Jay",
    lastName: "Mandaliya",
    email: "admin@kickanalyst.com",
    phone: "+91 98765 43210",
    role: "Super Admin",
    department: "Administration",
    employeeId: "ADM-1001",
    status: "Active",
    gender: "Male",
    joinedDate: "01 Jan 2026",
    location: "Rajkot, Gujarat",
    timezone: "Asia/Kolkata",
    company: "Kink Analyst Admin",
    username: "jay_admin",
    language: "English",
    lastLogin: "Today • 03:42 PM",
    bio: "Managing platform operations, subscriptions, analytics, users and support.",
  };

  const Item = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] p-4 md:p-6 text-white">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-[#121B2E] p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-4xl font-bold">
              J
            </div>

            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-[#121B2E] bg-green-500" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">
                {admin.firstName} {admin.lastName}
              </h1>

              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                {admin.status}
              </span>
            </div>

            <p className="mt-2 text-gray-400">
              {admin.role}
            </p>

            <p className="mt-4 max-w-2xl text-sm text-gray-300">
              {admin.bio}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold">
              Edit Profile
            </button>

            <button className="rounded-xl border border-white/10 px-5 py-3 text-sm">
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Item label="Employee ID" value={admin.employeeId} />
        <Item label="Username" value={admin.username} />
        <Item label="Email" value={admin.email} />
        <Item label="Phone" value={admin.phone} />

        <Item label="Role" value={admin.role} />
        <Item label="Department" value={admin.department} />
        <Item label="Gender" value={admin.gender} />
        <Item label="Company" value={admin.company} />

        <Item label="Location" value={admin.location} />
        <Item label="Timezone" value={admin.timezone} />
        <Item label="Language" value={admin.language} />
        <Item label="Joined Date" value={admin.joinedDate} />
      </div>

      {/* Account Information */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#121B2E] p-6">
        <h2 className="mb-5 text-xl font-bold">
          Account Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-[#0F172A] p-5">
            <p className="text-gray-400">
              Last Login
            </p>

            <p className="mt-2 text-lg font-semibold">
              {admin.lastLogin}
            </p>
          </div>

          <div className="rounded-xl bg-[#0F172A] p-5">
            <p className="text-gray-400">
              Account Status
            </p>

            <p className="mt-2 text-lg font-semibold text-green-400">
              Verified & Active
            </p>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#121B2E] p-6">
        <h2 className="mb-5 text-xl font-bold">
          Permissions
        </h2>

        <div className="flex flex-wrap gap-3">
          {[
            "Manage Users",
            "Manage Groups",
            "Manage Plans",
            "Analytics",
            "Billing",
            "Support Access",
            "Notifications",
            "Settings",
          ].map((item) => (
            <div
              key={item}
              className="rounded-full bg-blue-600/15 px-4 py-2 text-sm text-blue-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}