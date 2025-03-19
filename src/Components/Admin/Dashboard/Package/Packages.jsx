// import React, { useState, useEffect, useMemo } from "react";
// import axios from "../../../../utils/Api";
// import AddPackageModal from "./AddPackeges";
// import { useDispatch, useSelector } from "react-redux";
// import PackageDetailsModal from "./PackageDetails";
// import PackageEditModal from "./PackageEdit";
// import { toast } from "sonner";
// import { Button } from "@nextui-org/react";
// import {setPackage} from "../../../Toolkit/Slice/apiHomeSlice";



// function Packages({ packageId, setPackageId }) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [packages, setPackages] = useState([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { token } = useSelector((state) => state.auth);
//   const [selectedPackageId, setSelectedPackageId] = useState(null);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const dispatch = useDispatch();
//   const Redux_package = useSelector((state) => state.api.package);

//   const filteredPackages = useMemo(() => {
//     if (Array.isArray(packages)) {
//       return packages.filter((pkg) =>
//         pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
//     return []; // Return an empty array if packages is not an array
//   }, [searchQuery, packages]);

//   // Fetch packages data from the backend
//   useEffect(() => {
//     console.log(packageId);
    
//     const fetchPackages = async () => {


//     setLoading(true);
//     if (!Redux_package) {
//       axios
//         .get("/api/admin-packages/", {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         .then((response) => {
//           dispatch(setPackage(response.data));
//           setPackages(response.data);
//         })
//         .catch((error) => {
//           console.error("Error fetching Packages:", error);
//           setError("Failed to fetch Packages Requests.");
//           toast.error("Failed to fetch Packages requests");
//         });
//       setLoading(false);
//     } else {
//       setPackages(Redux_package);
//       setLoading(false);
//     }
//     };

//     fetchPackages();
//     if (packageId) {
//       openViewModal(packageId);
//       setPackageId(null);
//     }
//   }, [showAddForm]);

//   const openViewModal = (packageId) => {
//     setSelectedPackageId(packageId);
//     setViewModalOpen(true);
//   };

//   const openEditModal = (packageId) => {
//     setSelectedPackageId(packageId);
//     setEditModalOpen(true);
//     console.log(packageId);
//   };

//   const closeModals = () => {
//     setViewModalOpen(false);
//     setEditModalOpen(false);
//   };

//   if (loading) {
//     return <div>Loading packages...</div>;
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-4">
//       {/* Header with Search and Add New Button */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold text-gray-800">Packages</h2>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="Search by name"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="border border-[#D4D4CE] bg-[#F6F6F6] p-2 rounded-lg text-[#023246] placeholder-[#287094] focus:ring-2 focus:ring-[#287094] focus:outline-none shadow-sm transition duration-300"
//           />
//           <Button
//             className="bg-[#1e546f] text-white px-4 py-2 rounded-lg"
//             onClick={() => setTimeout(() => setShowAddForm(!showAddForm), 300)}

//           >
//             {showAddForm ? "Cancel" : "Add New Package"}
//           </Button>
//         </div>
//       </div>

//       {/* Add New Package Form */}
//       {showAddForm && (
//         <div className="mb-4 p-4 border border-gray-300 rounded-lg">
//           <AddPackageModal
//             isOpen={showAddForm}
//             onClose={() => setShowAddForm(false)}
//           />
//         </div>
//       )}

//       {/* Packages Table */}
//       <div className="grid grid-cols-6 gap-2 text-gray-700 font-semibold border-b border-gray-300">
//         <div>Package</div>
//         <div>Code</div>
//         <div>Base Price</div>
//         <div>Days</div>
//         <div>Date</div>
//         <div>Action</div>
//       </div>

//       <div>
//         {filteredPackages.map((pkg) => (
//           <div
//             key={pkg.id}
//             className={`grid -mx-4 grid-cols-6 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all`}
//           >
//             <div className="mx-4">{pkg.name}</div>
//             <div>{pkg.id}</div>
//             <div>{pkg.base_price}</div>
//             <div>{pkg.days}</div>
//             <div className={` ${pkg.valid ? "" : "text-red-600"}`}>{pkg.end}</div>
//             <div className="gap-1 flex">
//               <Button

//                 onClick={() => setTimeout(() => openViewModal(pkg.id), 300)}
//                 className="bg-[#4a4a4a] text-white -ml-2 px-3 py-2 rounded-lg"
//               >
//                 View
//               </Button>
//               <Button
//                 onPress={() => setTimeout( () => openEditModal(pkg.id), 300)}
//                 className="bg-[#4a4a4a] text-white px-3 py-2  rounded-lg pl-4"
//               >
//                 Edit
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <PackageDetailsModal
//         packageId={selectedPackageId}
//         isOpen={viewModalOpen}
//         closeModal={closeModals}
//       />
//       <div>
//         <PackageEditModal
//           packageId={selectedPackageId}
//           isOpen={editModalOpen}
//           onClose={closeModals}
//         />
//       </div>
//     </div>
//   );
// }

// export default Packages;










import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import AddPackageModal from "./AddPackeges";
import { useDispatch, useSelector } from "react-redux";
import PackageDetailsModal from "./PackageDetails";
import PackageEditModal from "./PackageEdit";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { setPackage } from "../../../Toolkit/Slice/apiHomeSlice";

function Packages({ packageId, setPackageId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [packages, setPackages] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dispatch = useDispatch();
  const Redux_package = useSelector((state) => state.api.package);

  const filteredPackages = useMemo(() => {
    if (Array.isArray(packages)) {
      return packages.filter((pkg) =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [searchQuery, packages]);

  useEffect(() => {
    console.log(packageId);
    
    const fetchPackages = async () => {
      setLoading(true);
      if (!Redux_package) {
        axios
          .get("/api/admin-packages/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            dispatch(setPackage(response.data));
            setPackages(response.data);
          })
          .catch((error) => {
            console.error("Error fetching Packages:", error);
            setError("Failed to fetch Packages Requests.");
            toast.error("Failed to fetch Packages requests");
          });
        setLoading(false);
      } else {
        setPackages(Redux_package);
        setLoading(false);
      }
    };

    fetchPackages();
    if (packageId) {
      openViewModal(packageId);
      setPackageId(null);
    }
  }, [showAddForm]);

  const openViewModal = (packageId) => {
    setSelectedPackageId(packageId);
    setViewModalOpen(true);
  };

  const openEditModal = (packageId) => {
    setSelectedPackageId(packageId);
    setEditModalOpen(true);
    console.log(packageId);
  };

  const closeModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading packages...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4">
      {/* Header with Search and Add New Button - Responsive Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold text-gray-800">Packages</h2>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-auto border border-[#D4D4CE] bg-[#F6F6F6] p-2 rounded-lg text-[#023246] placeholder-[#287094] focus:ring-2 focus:ring-[#287094] focus:outline-none shadow-sm transition duration-300"
          />
          <Button
            className="bg-[#1e546f] text-white px-4 py-2 rounded-lg w-full sm:w-auto"
            onClick={() => setTimeout(() => setShowAddForm(!showAddForm), 300)}
          >
            {showAddForm ? "Cancel" : "Add New Package"}
          </Button>
        </div>
      </div>

      {/* Add New Package Form */}
      {showAddForm && (
        <div className="mb-4 p-2 sm:p-4 border border-gray-300 rounded-lg">
          <AddPackageModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        {/* Table Header - Hidden on small screens */}
        <div className="hidden sm:grid grid-cols-6 gap-2 text-gray-700 font-semibold border-b border-gray-300 pb-2">
          <div>Package</div>
          <div>Code</div>
          <div>Base Price</div>
          <div>Days</div>
          <div>Date</div>
          <div>Action</div>
        </div>

        {/* Mobile-friendly cards for small screens, table rows for larger screens */}
        <div>
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-all py-3"
            >
              {/* Mobile View - Card Layout */}
              <div className="block sm:hidden">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="font-semibold">Package:</div>
                  <div>{pkg.name}</div>
                  
                  <div className="font-semibold">Code:</div>
                  <div>{pkg.id}</div>
                  
                  <div className="font-semibold">Base Price:</div>
                  <div>{pkg.base_price}</div>
                  
                  <div className="font-semibold">Days:</div>
                  <div>{pkg.days}</div>
                  
                  <div className="font-semibold">Date:</div>
                  <div className={pkg.valid ? "" : "text-red-600"}>{pkg.end}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => setTimeout(() => openViewModal(pkg.id), 300)}
                    className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg flex-1"
                  >
                    View
                  </Button>
                  <Button
                    onPress={() => setTimeout(() => openEditModal(pkg.id), 300)}
                    className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg flex-1"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              {/* Desktop View - Row Layout */}
              <div className="hidden sm:grid grid-cols-6 gap-2 items-center">
                <div>{pkg.name}</div>
                <div>{pkg.id}</div>
                <div>{pkg.base_price}</div>
                <div>{pkg.days}</div>
                <div className={pkg.valid ? "" : "text-red-600"}>{pkg.end}</div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => setTimeout(() => openViewModal(pkg.id), 300)}
                    className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg"
                  >
                    View
                  </Button>
                  <Button
                    onPress={() => setTimeout(() => openEditModal(pkg.id), 300)}
                    className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No results message */}
      {filteredPackages.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          No packages found matching your search.
        </div>
      )}

      <PackageDetailsModal
        packageId={selectedPackageId}
        isOpen={viewModalOpen}
        closeModal={closeModals}
      />
      <div>
        <PackageEditModal
          packageId={selectedPackageId}
          isOpen={editModalOpen}
          onClose={closeModals}
        />
      </div>
    </div>
  );
}

export default Packages;