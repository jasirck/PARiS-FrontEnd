import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import Modal from "react-modal";
import { Button } from "@nextui-org/react";

const HolidayDetailsModal = ({ HolidayId, isOpen, closeModal }) => {
  const [Holiday, setHoliday] = useState(null);
  const [days, setdays] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (HolidayId && isOpen) {
      setLoading(true);
      axios
        .get(`/api/admin/admin-holidays/${HolidayId}/`)
        .then((response) => {
          setHoliday(response.data.holiday);
          setdays(response.data.days);
          console.log(response.data);

          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch Holiday details");
          setLoading(false);
        });
    }
  }, [HolidayId, isOpen]);

  if (loading)
    return (
      <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Loading">
        <div className="text-center text-gray-700">
          Loading Holiday details...
        </div>
      </Modal>
    );

  if (error)
    return (
      <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Error">
        <div className="text-center text-red-500">{error}</div>
      </Modal>
    );

  if (!Holiday) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Holiday Details"
      className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh] mt-16"
      overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
    >
      <Button
        onClick={closeModal}
        className="absolute bg-transparent top-4 right-4 text-gray-500 font-bold hover:text-red-500"
      >
        &#10005;
      </Button>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">{Holiday.name}</h2>
      <p className="text-gray-600 mb-4 italic">{Holiday.note}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-500">Base Price:</p>
          <p className="text-lg font-semibold text-gray-800">
            {Holiday.base_price}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-500">Duration:</p>
          <p className="text-lg font-semibold text-gray-800">
            {Holiday.days} days
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-500">Start Date:</p>
          <p className="text-lg font-semibold text-gray-800">{Holiday.start}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-500">End Date:</p>
          <p className="text-lg font-semibold text-gray-800">{Holiday.end}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-500">Full Refund:</p>
          <p className="text-lg font-semibold text-gray-800">{Holiday.full_refund}Days</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-500">Half Refund:</p>
          <p className="text-lg font-semibold text-gray-800">{Holiday.full_refund} Days</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-500">Valid:</p>
          <p className="text-lg font-semibold text-gray-800">{Holiday.valid ? "Yes" : "No"}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-2">Inclusions</h3>
      <ul className="list-disc list-inside mb-4">
        {JSON.parse(Holiday.package_included).map((item, index) => (
          <li key={index} className="text-gray-600">
            {item}
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mb-2">Exclusions</h3>
      <ul className="list-disc list-inside mb-4">
        {JSON.parse(Holiday.package_excluded).map((item, index) => (
          <li key={index} className="text-gray-600">
            {item}
          </li>
        ))}
      </ul>


      <h3 className="text-xl font-semibold text-gray-800 mb-4">Itinerary</h3>
      <div className="space-y-4">
        {days.map((dayDetail) => (
          <div
            key={dayDetail.day}
            className="bg-gray-50 p-4 rounded-md shadow-sm border"
          >
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Day {dayDetail.day}: {dayDetail.place_name}
            </h4>
            {dayDetail.place_photo && (
              <img
                src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${dayDetail.place_photo}`}
                alt={dayDetail.place_name}
                className="w-full rounded-md mb-2 shadow-md"
              />
            )}
            <p className="text-gray-600 text-2xl">Activity : {dayDetail.activity}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default HolidayDetailsModal;
