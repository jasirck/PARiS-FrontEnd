import React, { useState } from "react";

const AddPackageModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    start: "",
    end: "",
    days: "",
    is_holiday: false,
    resort: "",
    package_included: "",
    package_excluded: "",
    note: "",
    valid: true,
    base_price: "",
    adult_price: "",
    child_price: "",
    category: "",
  });

  const [dayPlans, setDayPlans] = useState([
    { day: 1, place_name: "", activity: "", place_photo: "" },
  ]);

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddDay = () => {
    setDayPlans([
      ...dayPlans,
      { day: dayPlans.length + 1, place_name: "", activity: "", place_photo: "" },
    ]);
  };

  const handleDayChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDays = [...dayPlans];
    updatedDays[index][name] = value;
    setDayPlans(updatedDays);
  };

  // Simple validation function
  const validateForm = () => {
    const newErrors = {};
    // Check for required fields
    if (!formData.name) newErrors.name = "Package name is required.";
    if (!formData.price) newErrors.price = "Price is required.";
    if (!formData.start) newErrors.start = "Start date is required.";
    if (!formData.end) newErrors.end = "End date is required.";
    if (!formData.base_price) newErrors.base_price = "Base price is required.";
    if (!formData.adult_price) newErrors.adult_price = "Adult price is required.";
    if (!formData.child_price) newErrors.child_price = "Child price is required.";
    if (!formData.category) newErrors.category = "Category is required.";

    // Validate day plans
    dayPlans.forEach((dayPlan, index) => {
      if (!dayPlan.place_name) newErrors[`place_name_${index}`] = "Place name is required.";
      if (!dayPlan.activity) newErrors[`activity_${index}`] = "Activity is required.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const data = { ...formData, day_plans: dayPlans };
      onSave(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl transition-transform transform scale-95 hover:scale-100 ease-in-out duration-300 max-h-[80vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Add New Package</h2>

        <div className="space-y-6">
          {/* Package Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700">Package Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Price:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>
            <div className="flex space-x-6">
              <div className="w-1/2">
                <label className="block text-lg font-medium text-gray-700">Start Date:</label>
                <input
                  type="date"
                  name="start"
                  value={formData.start}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.start && <p className="text-red-500 text-sm">{errors.start}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-lg font-medium text-gray-700">End Date:</label>
                <input
                  type="date"
                  name="end"
                  value={formData.end}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.end && <p className="text-red-500 text-sm">{errors.end}</p>}
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Days:</label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Is Holiday:</label>
              <input
                type="checkbox"
                name="is_holiday"
                checked={formData.is_holiday}
                onChange={handleInputChange}
                className="w-6 h-6 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Resort & Pricing Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700">Resort:</label>
              <input
                type="text"
                name="resort"
                value={formData.resort}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Package Included:</label>
              <textarea
                name="package_included"
                value={formData.package_included}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Package Excluded:</label>
              <textarea
                name="package_excluded"
                value={formData.package_excluded}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Note:</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Valid:</label>
              <input
                type="checkbox"
                name="valid"
                checked={formData.valid}
                onChange={handleInputChange}
                className="w-6 h-6 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Base Price:</label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.base_price && <p className="text-red-500 text-sm">{errors.base_price}</p>}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Adult Price:</label>
              <input
                type="number"
                name="adult_price"
                value={formData.adult_price}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.adult_price && <p className="text-red-500 text-sm">{errors.adult_price}</p>}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Child Price:</label>
              <input
                type="number"
                name="child_price"
                value={formData.child_price}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.child_price && <p className="text-red-500 text-sm">{errors.child_price}</p>}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Category:</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>
          </div>

          {/* Day Plans */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800">Day Plans</h3>
            {dayPlans.map((dayPlan, index) => (
              <div key={index} className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    name="place_name"
                    placeholder="Place Name"
                    value={dayPlan.place_name}
                    onChange={(e) => handleDayChange(index, e)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[`place_name_${index}`] && (
                    <p className="text-red-500 text-sm">{errors[`place_name_${index}`]}</p>
                  )}
                  <input
                    type="text"
                    name="activity"
                    placeholder="Activity"
                    value={dayPlan.activity}
                    onChange={(e) => handleDayChange(index, e)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[`activity_${index}`] && (
                    <p className="text-red-500 text-sm">{errors[`activity_${index}`]}</p>
                  )}
                  <input
                    type="text"
                    name="place_photo"
                    placeholder="Place Photo URL"
                    value={dayPlan.place_photo}
                    onChange={(e) => handleDayChange(index, e)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={handleAddDay}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Another Day
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Save Package
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPackageModal;
