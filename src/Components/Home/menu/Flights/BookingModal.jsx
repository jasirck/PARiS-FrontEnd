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
    
    const submitData = {data, flightData};
  
    try {
      const response = await axios.post("/api/booked/flights/", submitData, {
        headers: {Authorization: `Bearer ${token}`},
      }); 
  
      if (response.status === 200 || response.status === 201) {
        setShowPayment(true);
        setResponse(response);
        reset();
        onClose();
      } else {
        reset();
        onClose();
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to book flight. Please try again.");
    }
  };
  
  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const formatPrice = (amount) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const renderSection = (title) => (
    <div className="col-span-2 mt-6 mb-2 border-b border-gray-200">
      <h3 className="text-base sm:text-lg font-medium text-primary">{title}</h3>
    </div>
  );

  if (showPayment) {
    return (
      <Modal isOpen={showPayment} backdrop="blur" onClose={() => setShowPayment(false)} size="lg">
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
      size={{sm: "full", md: "3xl"}}
      scrollBehavior="inside"
      classNames={{
        body: "p-4 sm:p-6",
        header: "border-b border-gray-200 bg-gray-50",
        footer: "border-t border-gray-200 bg-gray-50",
        closeButton: "hover:bg-gray-200 active:bg-gray-300 rounded-full"
      }}
    >
      <ModalContent className="overflow-y-auto">
        <form onSubmit={handleSubmit(handleConfirm)}>
          <ModalHeader className="flex flex-col gap-1 p-4 sm:p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                  Book Flight {flight?.flight?.iata || 'N/A'}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                  <div className="flex items-center text-xs sm:text-sm font-medium">
                    <span className="text-primary">{flight?.departure?.iata || 'N/A'}</span>
                    <span className="mx-2">→</span>
                    <span className="text-primary">{flight?.arrival?.iata || 'N/A'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {flight?.airline?.name || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-base sm:text-lg md:text-xl font-bold text-primary">{formatPrice(price)}</div>
                <div className="text-xxs sm:text-xs text-gray-500">Total fare</div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Departure: {formatDateTime(flight?.departure?.scheduled)}
            </p>
          </ModalHeader>

          <ModalBody className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {renderSection("Personal Information")}

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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.firstName}
                    errorMessage={errors.firstName?.message}
                    placeholder="first name"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.lastName}
                    errorMessage={errors.lastName?.message}
                    placeholder="last name"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    placeholder="email"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.phone}
                    errorMessage={errors.phone?.message}
                    placeholder="phone number"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.dateOfBirth}
                    errorMessage={errors.dateOfBirth?.message}
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.nationality}
                    errorMessage={errors.nationality?.message}
                    placeholder="nationality"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
                  />
                )}
              />

              {renderSection("Passport Information")}

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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.passportNumber}
                    errorMessage={errors.passportNumber?.message}
                    placeholder="passport number"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.passportExpiryDate}
                    errorMessage={errors.passportExpiryDate?.message}
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.passportIssuedCountry}
                    errorMessage={errors.passportIssuedCountry?.message}
                    placeholder="issued country"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
                  />
                )}
              />

              {renderSection("Emergency Contact")}

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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.emergencyContactName}
                    errorMessage={errors.emergencyContactName?.message}
                    placeholder="emergency contact name"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
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
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    isInvalid={!!errors.emergencyContactPhone}
                    errorMessage={errors.emergencyContactPhone?.message}
                    placeholder="emergency contact phone"
                    classNames={{
                      inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      input: "text-xs sm:text-sm",
                      errorMessage: "text-xs"
                    }}
                  />
                )}
              />

              {renderSection("Additional Information")}

              <Controller
                name="mealPreference"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Meal Preference"
                    variant="bordered"
                    labelPlacement="outside"
                    radius="sm"
                    placeholder="Select meal preference"
                    classNames={{
                      trigger: "border-gray-300 hover:border-primary focus-within:border-primary data-[open=true]:border-primary h-14",
                      label: "text-xs sm:text-sm font-medium text-gray-700",
                      value: "text-xs sm:text-sm",
                      listbox: "text-xs sm:text-sm"
                    }}
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
                      variant="bordered"
                      labelPlacement="outside"
                      radius="sm"
                      placeholder="Any special assistance or requests?"
                      minRows={3}
                      classNames={{
                        inputWrapper: "border-gray-300 hover:border-primary focus-within:border-primary",
                        label: "text-xs sm:text-sm font-medium text-gray-700",
                        input: "text-xs sm:text-sm"
                      }}
                    />
                  )}
                />
              </div>

              <div className="col-span-2 mt-4">
                <Controller
                  name="acceptTerms"
                  control={control}
                  rules={{
                    required: "You must accept the terms and conditions"
                  }}
                  render={({ field }) => (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <Checkbox
                        {...field}
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        isInvalid={!!errors.acceptTerms}
                        color="primary"
                        size="md"
                      >
                        <span className="text-xs sm:text-sm">I accept the terms and conditions</span>
                      </Checkbox>
                      {errors.acceptTerms && (
                        <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="flex justify-between items-center px-4 sm:px-6 py-4 gap-4">
            <div className="block sm:hidden">
              <div className="text-base sm:text-lg font-bold text-primary">{formatPrice(price)}</div>
              <div className="text-xxs sm:text-xs text-gray-500">Total fare</div>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="bordered"
                radius="sm"
                onPress={() => {
                  reset();
                  onClose();
                }}
                className="border-gray-300 text-gray-700 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isDisabled={isSubmitting}
                color="primary"
                radius="sm"
                className="font-medium text-xs sm:text-sm"
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default BookingModal;