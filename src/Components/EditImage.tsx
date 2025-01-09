import React, { useState } from "react";
import Cropper from "react-easy-crop";
import Flatpickr from "react-flatpickr";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

const EditImage = ({
  imageMetadata,
  setImageMetadata,
  editImageIndex,
  setEditImage,
  selectedSetupId,
  user,
}: {
  imageMetadata: any;
  setImageMetadata: React.Dispatch<React.SetStateAction<any>>;
  editImageIndex: number;
  setEditImage: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSetupId: string;
  user: User;
}) => {
  const [editDate, setEditDate] = useState<number>(new Date().getTime());
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const saveEditedImage = async () => {
    if (!editDate) {
      alert("Please select a valid date and time.");
      return;
    }
    const imageId = imageMetadata[editImageIndex].id;

    setImageMetadata((prev: any) => {
      const updatedImages = [...prev];
      updatedImages[editImageIndex] = {
        ...updatedImages[editImageIndex],
        crop,
        zoom,
        timestamp: editDate,
      };
      return updatedImages;
    });

    try {
      await updateDoc(
        doc(
          db,
          `images/${user?.uid}/setups/${selectedSetupId}/images`,
          imageId
        ),
        {
          crop,
          zoom,
          timestamp: editDate,
        }
      );

      setEditImage(false);
    } catch (error) {
      console.error("Error updating image: ", error);
    }
  };

  const resetImageCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center p-4 overflow-hidden z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg space-y-6">
        <h2 className="text-xl font-semibold text-blue-300 text-center">
          Edit Image
        </h2>
        <div className="relative w-full h-64">
          <Cropper
            image={imageMetadata[editImageIndex].url}
            crop={crop}
            zoom={zoom}
            aspect={4 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
          />
        </div>

        <Flatpickr
          value={
            editImageIndex !== null &&
            imageMetadata[editImageIndex]?.timestamp &&
            !isNaN(new Date(imageMetadata[editImageIndex].timestamp).getTime())
              ? new Date(imageMetadata[editImageIndex].timestamp)
              : new Date()
          }
          options={{ enableTime: true, enableSeconds: true }}
          onChange={(selectedDates) => {
            if (selectedDates.length > 0) {
              setEditDate(selectedDates[0].getTime());
            }
          }}
          className="bg-gray-100 text-black p-1 relative z-10"
        />

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setEditImage(false)}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => saveEditedImage()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Save
          </button>
          <button
            onClick={resetImageCrop}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditImage;
