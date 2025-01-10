import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

import { useState } from "react";

const useImageUpload = (
  selectedSetupId: any,
  fileUploadRef: any,
  user: any
) => {
  const [isUploading, setIsUploading] = useState(false);

  // Validate uploaded files
  const validateFiles = (files: File[]) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    return files.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE
    );
  };

  // Handle Image Upload
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

  return { isUploading, handleUpload };
};

export default useImageUpload;
