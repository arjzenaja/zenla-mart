import Banners from "@/component/Banners";
import CatSlider from "@/component/CatSlider";
import HomeSlider from "@/component/HomeSlider";
import PopularProducts from "@/component/PopularProducts";
import ProductRow from "@/component/ProductRow";

export default function Home() {
  return (
    <>
      <div className="sliderWrappper #bg-[#f1f1f1] py-5 pb-5">
        <HomeSlider />
        <CatSlider />
        <PopularProducts />
        <Banners />


        <ProductRow title={"Latest Products"}/>
        <ProductRow title={"Featured Products"}/>
        <ProductRow title={"Breaksfast & Dairy"}/>

        
      </div>
    </>
  );
}
