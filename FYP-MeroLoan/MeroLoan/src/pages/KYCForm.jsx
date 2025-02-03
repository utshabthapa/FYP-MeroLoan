import { useState } from "react";
import { useKYCStore } from "../store/kycStore";
import { useParams } from "react-router-dom";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqejmq2px/image/upload";
const UPLOAD_PRESET = "UserImages_Preset";

const KYCForm = () => {
  const { _id } = useParams();
  const { submitKYCRequest, isLoading, error } = useKYCStore();
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
    profilePicture: "",
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
      const [profilePictureUrl, identityCardFrontUrl, identityCardBackUrl] =
        await Promise.all([
          handleImageUpload(kycData.profilePicture),
          handleImageUpload(kycData.identityCardFront),
          handleImageUpload(kycData.identityCardBack),
        ]);

      const finalKYCData = {
        ...kycData,
        userId: _id,
        profilePicture: profilePictureUrl,
        identityCardFront: identityCardFrontUrl,
        identityCardBack: identityCardBackUrl,
      };

      await submitKYCRequest(finalKYCData);
      alert("KYC submitted successfully!");
    } catch (error) {
      console.error("Error submitting KYC:", error);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">KYC Verification</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="fatherName"
            value={kycData.fatherName}
            onChange={handleInputChange}
            placeholder="Father's Name"
            required
          />
          <input
            type="text"
            name="motherName"
            value={kycData.motherName}
            onChange={handleInputChange}
            placeholder="Mother's Name"
            required
          />
          <input
            type="date"
            name="dob"
            value={kycData.dob}
            onChange={handleInputChange}
            required
          />
          <select
            name="gender"
            value={kycData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            name="occupation"
            value={kycData.occupation}
            onChange={handleInputChange}
            placeholder="Occupation"
            required
          />
          <input
            type="text"
            name="district"
            value={kycData.district}
            onChange={handleInputChange}
            placeholder="District"
            required
          />
          <input
            type="text"
            name="municipality"
            value={kycData.municipality}
            onChange={handleInputChange}
            placeholder="Municipality"
            required
          />
          <input
            type="number"
            name="ward"
            value={kycData.ward}
            onChange={handleInputChange}
            placeholder="Ward Number"
            required
          />
          <select
            name="identityType"
            value={kycData.identityType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Identity Type</option>
            <option value="citizenship">Citizenship</option>
            <option value="passport">Passport</option>
            <option value="driverLicense">Driver's License</option>
          </select>
          <input
            type="text"
            name="identityNumber"
            value={kycData.identityNumber}
            onChange={handleInputChange}
            placeholder="Identity Number"
            required
          />
          <input
            type="text"
            name="issuedPlace"
            value={kycData.issuedPlace}
            onChange={handleInputChange}
            placeholder="Issued Place"
            required
          />
          <input
            type="date"
            name="issuedDate"
            value={kycData.issuedDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="my-4">
          <label className="block font-medium">Profile Picture</label>
          <input
            type="file"
            onChange={(e) =>
              setKycData({ ...kycData, profilePicture: e.target.files[0] })
            }
          />
        </div>
        <div className="my-4">
          <label className="block font-medium">Identity Card (Front)</label>
          <input
            type="file"
            onChange={(e) =>
              setKycData({ ...kycData, identityCardFront: e.target.files[0] })
            }
          />
        </div>
        <div className="my-4">
          <label className="block font-medium">Identity Card (Back)</label>
          <input
            type="file"
            onChange={(e) =>
              setKycData({ ...kycData, identityCardBack: e.target.files[0] })
            }
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit KYC"}
        </button>
      </form>
    </div>
  );
};

export default KYCForm;
