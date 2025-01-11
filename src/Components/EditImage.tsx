import React, { useState } from "react";
import Cropper from "react-easy-crop";
import Flatpickr from "react-flatpickr";
import { updateDoc, doc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { User } from "firebase/auth";
import { ref, deleteObject } from "firebase/storage";
import { deleteDoc } from "firebase/firestore";

interface CroppedArea {
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
  const [editDate, setEditDate] = useState<number>(
    imageMetadata[editImageIndex].timestamp ?? new Date().getTime()
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.1);
  const [cropPercent, setCropPercent] = useState({ x: 0, y: 0 });

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
        crop: cropPercent,
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
          crop: cropPercent,
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
    setCropPercent({ x: 0, y: 0 });
    setZoom(1.1);
  };

  function checkNan(number: number) {
    if (isNaN(number)) return 0;
    else return number;
  }

  const onCropComplete = (croppedArea: CroppedArea) => {
    const X = croppedArea.x / (100 - croppedArea.width);
    const Y = croppedArea.y / (100 - croppedArea.height);

    const newX = checkNan(X);
    const newY = checkNan(Y);

    setCropPercent({
      x: newX! * 100,
      y: newY! * 100,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center p-4 overflow-hidden z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg space-y-6">
        <div className="relative">
          <h2 className="text-xl font-semibold text-blue-300 text-center">
            Edit Image
          </h2>
        </div>

        <div className="relative w-full h-64">
          <Cropper
            image={imageMetadata[editImageIndex].url}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            aspect={4 / 4}
            onCropComplete={onCropComplete}
          />
        </div>

        <Flatpickr
          value={editDate}
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
