import { useState, useRef, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db, auth } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function UploadImages() {
  const [imageMetadata, setImageMetadata] = useState<
    { url: string; timestamp: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  console.log(Date.now().toString());

  // Fetch images sorted by timestamp on page load
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesCollection = collection(db, "images");
        const imagesQuery = query(
          imagesCollection,
          orderBy("timestamp", "asc")
        );
        const querySnapshot = await getDocs(imagesQuery);

        const fetchedImages = querySnapshot.docs.map((doc) => doc.data());
        setImageMetadata(fetchedImages as { url: string; timestamp: number }[]);
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

        for (const file of files) {
          const uniqueFileName = `${uuidv4()}_${file.name}`;
          const storageRef = ref(storage, `uploads/${uniqueFileName}`);

          // Upload the image to Firebase Storage
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          // Save metadata to Firestore
          const timestamp = Date.now();
          const imageDoc = {
            url: downloadURL,
            timestamp,
          };
          await addDoc(collection(db, "images"), imageDoc);

          // Update state with new image
          setImageMetadata((prev) => [...prev, imageDoc]);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth)
        .then(() => {
          console.log("Signed out");
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <div className="w-screen">
      <button onClick={handleSignOut} className="p-2 bg-red-500 text-white">
        Sign Out
      </button>
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
      {imageMetadata.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {imageMetadata.map((image, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={image.url}
                alt={`Uploaded ${index}`}
                className="w-full h-auto border"
              />
              <p className="mt-2 text-sm">
                {new Date(image.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
