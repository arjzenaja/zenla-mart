import DashboardBoxes from "./components/DashboardBoxes";
import ProductsComponent from "./components/Products";
import UsersComponent from "./components/Users";
import SalesAndUsersCharts from "./components/SalesAndUserCharts";

export default function Home() {
  return (
    <main className="flex-1 min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
    }}>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-extrabold gradient-text mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome to Zenla Admin Panel</p>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8 animate-scaleIn">
          <DashboardBoxes />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card-premium p-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
              <ProductsComponent />
            </div>

            <div className="card-premium p-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <SalesAndUsersCharts />
            </div>
          </div>

          {/* Right Column - Secondary Content */}
          <div className="card-premium p-6 animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <UsersComponent />
          </div>
        </div>
      </div>
    </main>
  );
}
