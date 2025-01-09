import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { User } from "firebase/auth";

import { useState, useRef } from "react";

const UploadImages = ({
  selectedSetupId,
  user,
}: {
  selectedSetupId: string;
  user: User;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    return files.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE
    );
  };

  const handleUpload = async () => {
    if (selectedSetupId === "") {
      alert("Please select a valid setup before uploading images.");
      return;
    }

    try {
      if (fileUploadRef.current?.files) {
        setIsUploading(true);
        const files = validateFiles(Array.from(fileUploadRef.current.files));

        for (const file of files) {
          const uniqueFileName = `${uuidv4()}_${file.name}`;
          const storageRef = ref(storage, `uploads/${uniqueFileName}`);

          // Upload the image to Firebase Storage
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          // Save metadata to Firestore
          const timestamp = Date.now();
          await addDoc(
            collection(
              db,
              `images/${user?.uid}/setups/${selectedSetupId}/images`
            ),
            {
              url: downloadURL,
              timestamp,
            }
          );
        }
        fileUploadRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-center text-blue-300 mb-4">
        Upload Images
      </h2>
      <div className="flex flex-col items-center space-y-6">
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileUploadRef}
          className="w-full max-w-sm px-4 py-3 bg-gray-800 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
          disabled={selectedSetupId === ""}
        />
        <button
          onClick={handleUpload}
          className="w-full max-w-sm px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
          disabled={isUploading || selectedSetupId === ""}
        >
          {isUploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>
    </div>
  );
};

export default UploadImages;
