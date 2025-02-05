import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKYCStore } from "../store/kycStore";
import Navbar from "@/components/Navbar";
import { Camera, Upload, Check, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqejmq2px/image/upload";
const UPLOAD_PRESET = "KycImages_Preset";

const KYCForm = () => {
  const { _id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate

  const { submitKYCRequest, isLoading, error } = useKYCStore();
  const [activeStep, setActiveStep] = useState(1);
  const [kycData, setKycData] = useState({
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    occupation: "",
    district: "",
    municipality: "",
    ward: "",
    identityType: "",
    identityNumber: "",
    issuedPlace: "",
    issuedDate: "",
    identityCardFront: "",
    identityCardBack: "",
  });

  const handleInputChange = (e) => {
    setKycData({ ...kycData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (file) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.secure_url || "";
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const [identityCardFrontUrl, identityCardBackUrl] = await Promise.all([
        handleImageUpload(kycData.identityCardFront),
        handleImageUpload(kycData.identityCardBack),
      ]);

      const finalKYCData = {
        ...kycData,
        userId: _id,
        identityCardFront: identityCardFrontUrl,
        identityCardBack: identityCardBackUrl,
      };

      await submitKYCRequest(finalKYCData);
      toast.success("KYC submitted successfully! Redirecting to Profile...", {
        onClose: () => navigate(`/userProfile`),
      });
    } catch (error) {
      console.error("Error submitting KYC:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="text-center p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              KYC Verification
            </h1>

            <div className="flex justify-center items-center space-x-4 mt-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep >= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    } transition-colors duration-300`}
                  >
                    {activeStep > step ? <Check size={16} /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        activeStep > step ? "bg-blue-600" : "bg-gray-200"
                      } transition-colors duration-300`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
                <AlertCircle className="mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={kycData.fatherName}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={kycData.motherName}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={kycData.dob}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={kycData.gender}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={kycData.district}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Municipality
                    </label>
                    <input
                      type="text"
                      name="municipality"
                      value={kycData.municipality}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Ward Number
                    </label>
                    <input
                      type="number"
                      name="ward"
                      value={kycData.ward}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={kycData.occupation}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Identity Type
                      </label>
                      <select
                        name="identityType"
                        value={kycData.identityType}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                      >
                        <option value="">Select Identity Type</option>
                        <option value="citizenship">Citizenship</option>
                        <option value="passport">Passport</option>
                        <option value="license">Driver's License</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Identity Number
                      </label>
                      <input
                        type="text"
                        name="identityNumber"
                        value={kycData.identityNumber}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Issued Place
                      </label>
                      <input
                        type="text"
                        name="issuedPlace"
                        value={kycData.issuedPlace}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Issued Date
                      </label>
                      <input
                        type="date"
                        name="issuedDate"
                        value={kycData.issuedDate}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors duration-200">
                      <Camera
                        className="mx-auto text-gray-400 mb-2"
                        size={24}
                      />
                      <label className="cursor-pointer">
                        <span className="text-sm font-medium text-gray-700">
                          Profile Picture
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            setKycData({
                              ...kycData,
                              profilePicture: e.target.files[0],
                            })
                          }
                        />
                      </label>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors duration-200">
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={24}
                        />
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-gray-700">
                            ID Card (Front)
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              setKycData({
                                ...kycData,
                                identityCardFront: e.target.files[0],
                              })
                            }
                          />
                        </label>
                      </div>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors duration-200">
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={24}
                        />
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-gray-700">
                            ID Card (Back)
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              setKycData({
                                ...kycData,
                                identityCardBack: e.target.files[0],
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(activeStep - 1)}
                    className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition duration-200"
                  >
                    Previous
                  </button>
                )}
                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ml-auto"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ml-auto flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Submit KYC"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCForm;
