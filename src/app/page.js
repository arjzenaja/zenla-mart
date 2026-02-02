import DashboardBoxes from "./components/DashboardBoxes";
import ProductsComponent from "./components/Products";
import UsersComponent from "./components/Users";
import SalesAndUsersCharts from "./components/SalesAndUserCharts";

export default function Home() {
  return (
    <>
      <div className="p-5">
        <DashboardBoxes />

        <div className="py-5">
          <ProductsComponent />
        </div>

        <div>
          <UsersComponent />
          <SalesAndUsersCharts />
        </div>
      </div>
    </>
  );
}
