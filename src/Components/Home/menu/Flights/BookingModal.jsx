import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Input,
  Textarea,
  Checkbox,
  Select,
  SelectItem,
} from "@nextui-org/react";
import axios from "../../../../utils/Api";
import PaymentForm from "../../PaymentForm";
import { useSelector } from "react-redux";
import { toast } from 'sonner';


const isAtLeast18YearsAgo = (date) => {
  const today = new Date();
  const birthDate = new Date(date);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

const isPassportValid = (date) => {
  const today = new Date();
  const expiryDate = new Date(date);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  return expiryDate >= sixMonthsFromNow;
};

const mealOptions = [
  { value: "regular", label: "Regular" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "diabetic", label: "Diabetic" },
  { value: "gluten-free", label: "Gluten Free" },
];

const BookingModal = ({ isOpen, onClose, flight }) => {
    const [showPayment, setShowPayment] = useState(false);
    const [response, setResponse] = useState(null);
    const token = useSelector((state) => state.auth.token);
    const [flightData, setFlightData] = useState({
        flight_number: '',
        departure_city: '',
        arrival_city: '',
        departure_date: '',
        arrival_date: '',
        price: '',
    });
    
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      nationality: "",
      passportNumber: "",
      passportExpiryDate: "",
      passportIssuedCountry: "",
      specialRequests: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      acceptTerms: false,
      mealPreference: "",
    },
    mode: "onBlur",
  });
  

  const formatDuration = (departureTime, arrivalTime) => {
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);
    const durationMinutes = Math.floor((arrivalDate - departureDate) / 60000);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return { hours, minutes };
  };

  
  const duration = formatDuration(flight.departure.scheduled, flight.arrival.scheduled);
  const price = (duration.hours * 60 + duration.minutes) * 27 * 1.05;
  const handleConfirm = async (data) => {
    
    setFlightData({
        
        departure_city: flight.departure.airport,
        arrival_city: flight.arrival.airport,
        departure_date: flight.departure.scheduled,
        arrival_date: flight.arrival.scheduled,
        price: price,
        flight_number: flight.flight.iata   
    });
    console.log("data", data, 'flightData', flightData);
    data = {data, flightData};
  
    try {

      const response = await axios.post("/api/booked/flights/", data,{
        headers: {Authorization: `Bearer ${token}`},
      }); 
      console.log("response", response);
  
      if (response.status === 200 || response.status === 201) {
        setShowPayment(true);
        setResponse(response);
        reset();
        onClose();
      } else {
        console.log("Unexpected response status:", response);
        reset();
        onClose();
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

    if (showPayment) {
        return (
          <Modal isOpen={showPayment} backdrop={blur} onClose={() => setShowPayment(false)} size="lg">
            <ModalContent>
              <ModalBody>
                <PaymentForm
                  amount={price}
                  name={flight?.flight?.iata}
                  booked_id={response?.data?.id}
                  category={"flight"}
                  onClose={() => setShowPayment(false)}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        );
      }
      

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent className="overflow-y-scroll">
        <form onSubmit={handleSubmit(handleConfirm)}>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">
              Book Flight - {flight?.flight?.iata || 'N/A'}
            </h2>
            <p className="text-sm text-gray-500">
              {flight?.departure?.iata || 'N/A'} → {flight?.arrival?.iata || 'N/A'} | {flight?.airline?.name || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              Departure: {formatDateTime(flight?.departure?.scheduled)}
            </p>
          </ModalHeader>

          <ModalBody >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information Section */}
              <div className="col-span-2">
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
              </div>

              <Controller
                name="firstName"
                control={control}
                rules={{
                  required: "First name is required",
                  minLength: { value: 2, message: "First name must be at least 2 characters" },
                  pattern: { value: /^[A-Za-z\s-]+$/, message: "First name should only contain letters, spaces, and hyphens" }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="First Name"
                    isInvalid={!!errors.firstName}
                    errorMessage={errors.firstName?.message}
                    placeholder="Enter first name"
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                rules={{
                  required: "Last name is required",
                  minLength: { value: 2, message: "Last name must be at least 2 characters" },
                  pattern: { value: /^[A-Za-z\s-]+$/, message: "Last name should only contain letters, spaces, and hyphens" }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Last Name"
                    isInvalid={!!errors.lastName}
                    errorMessage={errors.lastName?.message}
                    placeholder="Enter last name"
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    label="Email"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    placeholder="Enter email"
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^\+?[\d\s-]+$/,
                    message: "Invalid phone number"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="tel"
                    label="Phone Number"
                    isInvalid={!!errors.phone}
                    errorMessage={errors.phone?.message}
                    placeholder="Enter phone number"
                  />
                )}
              />

              <Controller
                name="dateOfBirth"
                control={control}
                rules={{
                  required: "Date of birth is required",
                  validate: (value) => isAtLeast18YearsAgo(value) || "Must be at least 18 years old"
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Date of Birth"
                    isInvalid={!!errors.dateOfBirth}
                    errorMessage={errors.dateOfBirth?.message}
                  />
                )}
              />

              <Controller
                name="nationality"
                control={control}
                rules={{
                  required: "Nationality is required",
                  pattern: {
                    value: /^[A-Za-z\s-]+$/,
                    message: "Nationality should only contain letters"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Nationality"
                    isInvalid={!!errors.nationality}
                    errorMessage={errors.nationality?.message}
                    placeholder="Enter nationality"
                  />
                )}
              />

              {/* Passport Information Section */}
              <div className="col-span-2">
                <h3 className="text-lg font-medium mb-2">Passport Information</h3>
              </div>

              <Controller
                name="passportNumber"
                control={control}
                rules={{
                  required: "Passport number is required",
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message: "Invalid passport number format"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Passport Number"
                    isInvalid={!!errors.passportNumber}
                    errorMessage={errors.passportNumber?.message}
                    placeholder="Enter passport number"
                  />
                )}
              />

              <Controller
                name="passportExpiryDate"
                control={control}
                rules={{
                  required: "Passport expiry date is required",
                  validate: (value) => isPassportValid(value) || "Passport must be valid for at least 6 months"
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Passport Expiry Date"
                    isInvalid={!!errors.passportExpiryDate}
                    errorMessage={errors.passportExpiryDate?.message}
                  />
                )}
              />

              <Controller
                name="passportIssuedCountry"
                control={control}
                rules={{
                  required: "Passport issued country is required",
                  pattern: {
                    value: /^[A-Za-z\s-]+$/,
                    message: "Country name should only contain letters"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Passport Issued Country"
                    isInvalid={!!errors.passportIssuedCountry}
                    errorMessage={errors.passportIssuedCountry?.message}
                    placeholder="Enter issued country"
                  />
                )}
              />

              {/* Emergency Contact Section */}
              <div className="col-span-2">
                <h3 className="text-lg font-medium mb-2">Emergency Contact</h3>
              </div>

              <Controller
                name="emergencyContactName"
                control={control}
                rules={{
                  required: "Emergency contact name is required",
                  pattern: {
                    value: /^[A-Za-z\s-]+$/,
                    message: "Name should only contain letters"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Emergency Contact Name"
                    isInvalid={!!errors.emergencyContactName}
                    errorMessage={errors.emergencyContactName?.message}
                    placeholder="Enter emergency contact name"
                  />
                )}
              />

              <Controller
                name="emergencyContactPhone"
                control={control}
                rules={{
                  required: "Emergency contact phone is required",
                  pattern: {
                    value: /^\+?[\d\s-]+$/,
                    message: "Invalid phone number"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Emergency Contact Phone"
                    isInvalid={!!errors.emergencyContactPhone}
                    errorMessage={errors.emergencyContactPhone?.message}
                    placeholder="Enter emergency contact phone"
                  />
                )}
              />

              {/* Additional Information Section */}
              <div className="col-span-2">
                <h3 className="text-lg font-medium mb-2">Additional Information</h3>
              </div>

              <Controller
                name="mealPreference"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Meal Preference"
                    placeholder="Select meal preference"
                  >
                    {mealOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <div className="col-span-2">
                <Controller
                  name="specialRequests"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Special Requests"
                      placeholder="Any special assistance or requests?"
                    />
                  )}
                />
              </div>

              <div className="col-span-2">
                <Controller
                  name="acceptTerms"
                  control={control}
                  rules={{
                    required: "You must accept the terms and conditions"
                  }}
                  render={({ field }) => (
                    <div>
                      <Checkbox
                        {...field}
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        isInvalid={!!errors.acceptTerms}
                      >
                        I accept the terms and conditions
                      </Checkbox>
                      {errors.acceptTerms && (
                        <p className="text-red-500 text-sm mt-1">{errors.acceptTerms.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="bordered"
              onPress={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isDisabled={isSubmitting}
              color="primary"
            >
              {isSubmitting ? "Processing..." : `Confirm Booking (₹${price})`}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default BookingModal;