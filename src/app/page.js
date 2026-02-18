import Banners from "@/component/Banners";
import CatSlider from "@/component/CatSlider";
import HomeSlider from "@/component/HomeSlider";
import PopularProducts from "@/component/PopularProducts";
import ProductRow from "@/component/ProductRow";
import RecommendedForYou from "@/component/RecommendedForYou";
import BuyAgain from "@/component/BuyAgain";
import RecentlyViewed from "@/component/RecentlyViewed";

export default function Home() {
  return (
    <main className="homePage">
      <div className="homePage-inner max-w-7xl mx-auto px-4 lg:px-6 xl:px-8">
        {/* Hero Section - No background wrapper, hero has its own gradient */}
        <section className="mb-8 md:mb-12">
          <HomeSlider />
        </section>

        {/* Category Section - Gray background */}
        <section className="mb-8 md:mb-12">
          <CatSlider />
        </section>

        {/* Popular Products - White background */}
        <section className="mb-8 md:mb-12 fade-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10">
            <PopularProducts />
          </div>
        </section>

        {/* Promo Banners - Gray background */}
        <section className="mb-8 md:mb-12 fade-in-up">
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 lg:p-10">
            <Banners />
          </div>
        </section>

        {/* Personalization sections - White background */}
        <section className="mb-8 md:mb-12 fade-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <RecommendedForYou />
                <BuyAgain />
              </div>
              <div className="space-y-8">
                <RecentlyViewed />
              </div>
            </div>
          </div>
        </section>

        {/* Additional curated rows - Alternating backgrounds */}
        <section className="mb-8 md:mb-12 fade-in-up">
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 lg:p-10">
            <ProductRow title={"Latest Products"} />
          </div>
        </section>

        <section className="mb-8 md:mb-12 fade-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10">
            <ProductRow title={"Featured Products"} />
          </div>
        </section>

        <section className="mb-8 md:mb-12 fade-in-up">
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 lg:p-10">
            <ProductRow title={"Breaksfast & Dairy"} />
          </div>
        </section>
      </div>
    </main>
  );
}
