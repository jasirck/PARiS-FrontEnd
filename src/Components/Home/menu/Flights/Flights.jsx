import React, { useState } from "react";
import { IoAirplane,IoCalendarClear,IoSearchSharp,IoSwapHorizontal,} from "react-icons/io5";
import {Button,Select,SelectItem,Tooltip,} from "@nextui-org/react";
import { motion } from "framer-motion";
import axios from "../../../../utils/Api";
import BookingModal from "./BookingModal";
import { useSelector } from "react-redux";
import { div } from "framer-motion/client";
import { toast } from 'sonner';

// Utility Functions
const formatDuration = (departureTime, arrivalTime) => {
  const departureDate = new Date(departureTime);
  const arrivalDate = new Date(arrivalTime);
  const durationMinutes = Math.floor((arrivalDate - departureDate) / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return { hours, minutes };
};

const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return {
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    date: date.toLocaleDateString("en-US", {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  };
};



const FlightCard = ({ flight, setIsModal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const departure = formatDateTime(flight.departure.scheduled);
  const arrival = formatDateTime(flight.arrival.scheduled);
  const duration = formatDuration(flight.departure.scheduled, flight.arrival.scheduled);
  const price = (duration.hours * 60 + duration.minutes) * 27 * 1.05;
  const [selectedFlight, setSelectedFlight] = useState(null);
  const token = useSelector((state) => state.auth.token);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectFlight = (flight) => {
    if (!token) {
      setIsModal("login");
      return;
    }
    setSelectedFlight(flight);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl p-6 shadow-lg mb-4 hover:shadow-xl border border-[#D4D4CE]"
    >
      <div className="grid grid-cols-5 gap-6 items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            
            <h3 className="text-lg font-semibold text-[#023246]">
              {flight.airline.name}
            </h3>
          </div>
          <div className="flex flex-col text-sm text-[#287094]">
            <span>Flight {flight.flight.number}</span>
            <span>{flight.aircraft?.model || 'Aircraft'}</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-2xl font-bold text-[#023246]">{departure.time}</p>
          <p className="text-sm text-[#287094]">{flight.departure.iata}</p>
          <p className="text-xs text-gray-500">{departure.date}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-full h-0.5 bg-[#D4D4CE] relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white p-1 rounded-full">
              <IoAirplane className="text-[#287094] text-xl rotate-45" />
            </div>
          </div>
          <Tooltip content={`Flight Duration: ${duration.hours}h ${duration.minutes}m`}>
            <div className="text-center">
              <span className="text-sm font-medium text-[#287094]">
                {duration.hours}h {duration.minutes}m
              </span>
              <p className="text-xs text-gray-500">Non-stop</p>
            </div>
          </Tooltip>
        </div>

        <div className="text-center space-y-1">
          <p className="text-2xl font-bold text-[#023246]">{arrival.time}</p>
          <p className="text-sm text-[#287094]">{flight.arrival.iata}</p>
          <p className="text-xs text-gray-500">{arrival.date}</p>
        </div>

        <div className="space-y-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-[#287094]">
              ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500">per person</p>
          </div>
          
          <Button
            size="lg"
            className="w-full bg-[#287094] text-white hover:bg-[#023246] transition-all duration-300"
            onClick={() => handleSelectFlight(flight)}
          >
            Book Now
          </Button>
        </div>
      </div>

      <div>
      <BookingModal 
      isOpen={isModalOpen} 
      onClose={handleCloseModal} 
      flight={flight}
    /></div>
    </motion.div>
  );
};

// Search Form Component
const SearchForm = ({ onSearch }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    from: "",
    to: "",
    date: new Date().toISOString().split("T")[0],
    passengers: "1",
    class: "economy"
  });

  const handleInputChange = (field, value) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg relative border border-[#D4D4CE]">
      <div className="grid grid-cols-6 gap-4 items-end">
        <div className="col-span-2">
          <label className="block text-sm text-[#287094] font-medium mb-1">From</label>
          <div className="relative">
            <IoAirplane className="absolute left-3 top-1/2 -translate-y-1/2 text-[#287094] -rotate-90" />
            <input
              type="text"
              value={searchCriteria.from}
              onChange={(e) => handleInputChange("from", e.target.value)}
              placeholder="Departure City"
              className="w-full p-2 pl-10 rounded-full bg-[#F6F6F6] border-2 border-[#D4D4CE] focus:border-[#287094] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Tooltip content="Swap Cities">
            <button
              onClick={() => {
                setSearchCriteria(prev => ({
                  ...prev,
                  from: prev.to,
                  to: prev.from
                }));
              }}
              className="h-10 w-10 rounded-full bg-[#F6F6F6] flex items-center justify-center hover:bg-[#D4D4CE] transition-all"
            >
              <IoSwapHorizontal className="text-[#287094] text-xl" />
            </button>
          </Tooltip>
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-[#287094] font-medium mb-1">To</label>
          <div className="relative">
            <IoAirplane className="absolute left-3 top-1/2 -translate-y-1/2 text-[#287094] rotate-90" />
            <input
              type="text"
              value={searchCriteria.to}
              onChange={(e) => handleInputChange("to", e.target.value)}
              placeholder="Arrival City"
              className="w-full p-2 pl-10 rounded-full bg-[#F6F6F6] border-2 border-[#D4D4CE] focus:border-[#287094] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#287094] font-medium mb-1">Date</label>
          <div className="relative">
            <IoCalendarClear className="absolute left-3 top-1/2 -translate-y-1/2 text-[#287094]" />
            <input
              type="date"
              value={searchCriteria.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full p-2 pl-10 rounded-full bg-[#F6F6F6] border-2 border-[#D4D4CE] focus:border-[#287094] outline-none"
            />
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-[#287094] text-white px-8 hover:bg-[#023246] transition-all duration-300"
        onClick={() => onSearch(searchCriteria)}
      >
        <IoSearchSharp className="text-2xl mr-2" />
        Search Flights
      </Button>
    </div>
  );
};


const Flights = ({setIsModal}) => {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("price-low");

  const handleSearch = async (searchCriteria) => {
    setIsLoading(true);
    setError(""); // Reset any previous errors
  
    try {
      console.log("Search criteria:", searchCriteria);
      
      const response = await axios.post("api/flights/search/", searchCriteria);
  
      // Ensure response.data.flights is an array before setting state
      if (Array.isArray(response.data.flights) && response.data.flights.length > 0) {
        setFlights(response.data.flights);
      } else {
        // Handle empty flights array
        setFlights([]);
        setError(`No flights found for ${searchCriteria.from} to ${searchCriteria.to} on ${searchCriteria.date}`);
      }
  
      console.log(response.data.flights); // Debug log
    } catch (error) {
      console.error("Error fetching flights:", error);
      setError("Unable to fetch flights. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="relative mb-16">
        <SearchForm onSearch={handleSearch} />
      </div>

      {flights.length > 0 && (
        <div className="flex justify-end mb-4">
          <Select
            label="Sort by"
            selectedKeys={[sortBy]}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-48"
          >
            <SelectItem key="price-low">Price: Low to High</SelectItem>
            <SelectItem key="price-high">Price: High to Low</SelectItem>
            <SelectItem key="duration">Duration: Shortest</SelectItem>
            <SelectItem key="departure">Departure: Earliest</SelectItem>
          </Select>
        </div>
      )}

      {isLoading ? (
        <div className="text-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#287094] mx-auto mb-4"></div>
          <p className="text-lg text-[#287094]">Searching for the best flights...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center font-medium p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      ) : flights.length > 0 ? (
        <div className="space-y-4">
          {flights
            .sort((a, b) => {
              switch (sortBy) {
                case "price-high":
                  return b.price - a.price;
                case "duration":
                  return (
                    new Date(a.arrival.scheduled) -
                    new Date(a.departure.scheduled) -
                    (new Date(b.arrival.scheduled) - new Date(b.departure.scheduled))
                  );
                case "departure":
                  return new Date(a.departure.scheduled) - new Date(b.departure.scheduled);
                default: // price-low
                  return a.price - b.price;
              }
            })
            .map((flight, index) => (
              <FlightCard key={index} flight={flight} setIsModal={setIsModal} />
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <IoAirplane className="text-6xl text-[#287094] mx-auto mb-4" />
          <p className="text-xl text-[#287094]">Search for flights to get started</p>
          <p className="text-sm text-gray-500 mt-2">Enter your travel details above to find available flights</p>
        </div>
      )}

      {flights.length > 0 && (
        <div className="mt-8 p-4 bg-[#F6F6F6] rounded-lg">
          <h3 className="text-lg font-semibold text-[#023246] mb-2">Important Information</h3>
          <ul className="space-y-2 text-sm text-[#287094]">
            <li>• Prices include all taxes and fees</li>
            {/* <li>• Free cancellation within 24 hours of booking</li> */}
            <li>• Check baggage allowance before travel</li>
            <li>• Carry valid ID proof during travel</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Flights;
