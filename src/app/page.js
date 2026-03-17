import DashboardBoxes from "./components/DashboardBoxes";
import ProductsComponent from "./components/Products";
import UsersComponent from "./components/Users";
import SalesAndUsersCharts from "./components/SalesAndUserCharts";

export default function Home() {
  return (
    <main className="flex-1 bg-gray-50 min-h-screen animate-fadeIn">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight font-outfit">Dashboard</h1>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-[0.15em]">Main Overview</p>
        </div>

        {/* Stat Boxes */}
        <div className="mb-8">
          <DashboardBoxes />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Products + Chart */}
          <div className="xl:col-span-2 space-y-6">
            <ProductsComponent />
            <SalesAndUsersCharts />
          </div>

          {/* Right Column - Users */}
          <div className="xl:col-span-1">
            <UsersComponent />
          </div>
        </div>
      </div>
    </main>
  );
}
