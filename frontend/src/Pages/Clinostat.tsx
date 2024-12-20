import { useState, useRef, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { storage, auth, db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

export default function UploadImages() {
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  console.log(Date.now().toString());

  // Authenticate user when the component mounts
  useEffect(() => {
    signInWithEmailAndPassword(auth, "amruthamsh13@gmail.com", "space-bio-lab")
      .then((userCredential) => {
        console.log("User signed in:", userCredential.user);
      })
      .catch((error) => {
        console.error("Authentication error:", error.code, error.message);
      });
  }, []);

  // Fetch existing images from Firebase Storage
  useEffect(() => {
    const fetchImages = async () => {
      const storageRef = ref(storage, "uploads/");
      try {
        const result = await listAll(storageRef);
        const urls = await Promise.all(
          result.items.map((item) => getDownloadURL(item))
        );
        setImageURLs(urls); // Set the initial list of images
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  // Validate uploaded files
  const validateFiles = (files: File[]) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    return files.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE
    );
  };

  // Handle image upload
  const handleUpload = async () => {
    try {
      if (fileUploadRef.current?.files) {
        setIsUploading(true);
        const files = validateFiles(Array.from(fileUploadRef.current.files));
        if (files.length === 0) throw new Error("No valid files to upload.");

        const uploadedURLs: string[] = [];
        for (const file of files) {
          const uniqueFileName = `${uuidv4()}_${file.name}`;

          const storageRef = ref(storage, `uploads/${uniqueFileName}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          uploadedURLs.push(downloadURL);
        }

        setImageURLs((prev) => [...prev, ...uploadedURLs]); // Append new images
      }
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message || "Something went wrong!"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-screen">
      <h1 className="text-4xl text-center">Upload Images to Firebase</h1>
      <div className="flex flex-col items-center">
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileUploadRef}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          className="border-2 p-2 bg-blue-500 text-white"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>
      {imageURLs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {imageURLs.map((url, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={url}
                alt={`Uploaded ${index}`}
                className="w-full h-auto border"
              />
              <p className="mt-2 text-sm truncate">{url.split("/").pop()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
