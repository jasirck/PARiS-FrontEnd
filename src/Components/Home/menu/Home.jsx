import React, { useRef, useState, useEffect } from "react";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import axios from "../../../utils/Api";

function Home() {
  const [packages, setPackages] = useState([]);
  const [resort, setResort] = useState([]);

  useEffect(() => {
    // Fetch data for packages
    axios
      .get("api/packages/")
      .then((response) => {
        setPackages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching packages:", error);
      });

    // Fetch data for resorts
    axios
      .get("api/resorts/")
      .then((response) => {
        setResort(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching resorts:", error);
      });
  }, []);

  return (
    <div className="bg-[#F2F2F0] mx-4 sm:mx-8 my-2 px-4 sm:px-12 py-6 rounded-3xl">
      <div className="space-y-8">
        <CardComponent
          Offer_Name="Special Packages"
          Offer_List={packages}
          resort={false}
        />
        <CardComponent
          Offer_Name="Top Destinations"
          Offer_List={packages}
          resort={false}
        />
        <CardComponent
          Offer_Name="Top Resorts"
          Offer_List={resort}
          resort={true}
        />
      </div>
    </div>
  );
}

function CardComponent({ Offer_Name, Offer_List, resort }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      checkScroll();
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount =
        direction * (scrollContainerRef.current.offsetWidth * 0.8);
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-[#FCFCFC] p-6 rounded-3xl shadow-lg mb-6 -mx-10 relative">
      <p className="text-black text-xl font-semibold mb-4">{Offer_Name}</p>

      {showLeftArrow && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl"
        >
          <SlArrowLeft className="text-zinc-800 w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex space-x-12 mx-8 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {Offer_List.map((pkg, index) => (
          <div
            key={index}
            className="group relative min-w-[280px] max-w-[280px] bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 ease-in-out  transform hover:-translate-y-2"
          >
            <div className="relative h-48 overflow-hidden rounded-3xl">
              <img
                src={
                  resort
                    ? `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${pkg.images[0]?.image}`
                    : `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${pkg.first_day_image}`
                }
                alt={pkg.name}
                className="w-full h-full p-2 object-contain rounded-3xl transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Overlay effect on hover */}
              <div className="absolute inset-0 bg-black/0 rounded-3xl transition-all duration-300" />
            </div>

            <div className="p-4 transform transition-all duration-300 group-hover:translate-y-1">
              <h3 className="text-lg font-semibold line-clamp-1 transition-colors duration-300 group-hover:text-blue-600">
                {pkg.name}
              </h3>
              <p className="text-gray-500 transition-all duration-300 group-hover:text-gray-700">
                {pkg.days}
              </p>
              <p className="text-black font-bold transition-all duration-300 group-hover:scale-105 origin-left">
                {pkg.price}
              </p>
              <p className="text-red-500 text-sm line-clamp-1 transition-all duration-300 group-hover:text-red-600">
                {pkg.validity}
              </p>
            </div>

            {/* Add subtle shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl"
        >
          <SlArrowRight className="text-zinc-800 w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Home;
