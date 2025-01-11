import { useState, useEffect } from "react";
import { db } from "../firebase";

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { User } from "firebase/auth";
import { handleSignOut } from "../HelperFunctions/AuthHelperFunctions";

import Setups from "../Components/Setups";
import EditImage from "../Components/EditImage";
import UploadImages from "../Components/UploadImages";
import { storage } from "../firebase";
import { ref, deleteObject } from "firebase/storage";
import { deleteDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";

export default function Clinostat({ user }: { user: User | undefined }) {
  const [imageMetadata, setImageMetadata] = useState<
    {
      id: string;
      url: string;
      timestamp: number;
      crop: { x: number; y: number };
      zoom: number;
    }[]
  >([]);

  const [selectedSetupId, setSelectedSetupId] = useState<string>("");
  const [editImageIndex, setEditImageIndex] = useState<number>(0);
  const [editImage, setEditImage] = useState<boolean>(false);
  const sortOptions = ["Ascending", "Descending"];
  const [sortOrder, setSortOrder] = useState<string>(sortOptions[0]);

  // Fetch images for the selected setup
  useEffect(() => {
    if (!selectedSetupId) return;

    const imagesCollection = collection(
      db,
      `images/${user?.uid}/setups/${selectedSetupId}/images`
    );
    const imagesQuery = query(imagesCollection, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(imagesQuery, (snapshot) => {
      const fetchedImages = snapshot.docs.map((doc) => {
        return {
          id: doc.id, // Include the document ID
          ...doc.data(), // Include the rest of the document data
        };
      });
      setImageMetadata(
        fetchedImages as {
          id: string;
          url: string;
          timestamp: number;
          crop: { x: number; y: number };
          zoom: number;
        }[]
      );
    });

    return () => {
      setImageMetadata([]);
      unsubscribe();
    };
  }, [selectedSetupId, user]);

  // Helper function to extract the file path from the image URL
  const extractPathFromUrl = (imageUrl: string) => {
    const bucketPath = imageUrl.split("/o/")[1].split("?")[0];
    return decodeURIComponent(bucketPath);
  };

  // Function to delete an image from the database and storage
  const deleteImage = async (deleteImageIndex: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }

    const imageUrl = imageMetadata[deleteImageIndex].url;
    console.log("imageUrl: ", imageUrl);

    const path = extractPathFromUrl(imageUrl);
    const imageId = imageMetadata[deleteImageIndex].id;

    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      await deleteDoc(
        doc(db, `images/${user?.uid}/setups/${selectedSetupId}/images`, imageId)
      );

      setImageMetadata((prev: any) =>
        prev.filter((image: any) => image.id !== imageId)
      );

      setEditImage(false);

      console.log("Image deleted successfully.");
    } catch (error) {
      console.error("Error deleting image: ", error);

      alert("Failed to delete the image. Please try again.");
    }
  };

  useEffect(() => {
    if (sortOrder === "Ascending") {
      setImageMetadata(
        [...imageMetadata].sort((a, b) => a.timestamp - b.timestamp)
      );
    } else {
      setImageMetadata(
        [...imageMetadata].sort((a, b) => b.timestamp - a.timestamp)
      );
    }
  }, [sortOrder]);

  return (
    <div className="flex w-screen min-h-screen bg-gray-900 text-gray-200">
      <div className="w-72 bg-gray-800 p-6 space-y-8">
        <div className="text-xl font-semibold text-blue-100 mb-0 text-center">
          Welcome, {user?.displayName ? user?.displayName : user?.email}
        </div>
        <button
          onClick={handleSignOut}
          className="w-24 ml-16 py-2 bg-red-700 text-white rounded-lg shadow-md hover:bg-red-700 transition-all"
        >
          Sign Out
        </button>
        <Setups
          selectedSetupId={selectedSetupId}
          setSelectedSetupId={setSelectedSetupId}
          user={user!}
        />
      </div>

      <div className="flex-1 p-8 space-y-8">
        <UploadImages selectedSetupId={selectedSetupId} user={user!} />

        {selectedSetupId && (
          <select
            name="sort-options"
            id=""
            className="w-36 p-2 bg-gray-800 text-gray-200 rounded-lg shadow-md"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            {sortOptions.map((option, index) => (
              <option key={index} value={option} className="text-black">
                {option}
              </option>
            ))}
          </select>
        )}

        {imageMetadata.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {imageMetadata.map((image, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center space-y-4"
              >
                <div className="relative w-full max-w-md aspect-[4/4] overflow-hidden bg-gray-800 rounded-lg">
                  <div className="absolute inset-0">
                    <img
                      src={image.url}
                      alt="Cropped"
                      style={{
                        objectPosition: `${image.crop?.x ?? 50}% ${
                          image.crop?.y ?? 50
                        }%`,
                        transform: `scale(${image.zoom ?? 1})`,
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-400">
                  Timestamp: {new Date(image.timestamp).toLocaleString()}
                </p>
                <div className="flex place-content-between w-full">
                  {" "}
                  <button
                    onClick={() => {
                      setEditImage(true);
                      setEditImageIndex(index);
                    }}
                    className="no-underline hover:underline hover:underline-offset-2"
                  >
                    Edit
                  </button>
                  <button
                    className="no-underline hover:underline hover:underline-offset-2"
                    onClick={() => deleteImage(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editImage && (
          <EditImage
            imageMetadata={imageMetadata}
            setImageMetadata={setImageMetadata}
            editImageIndex={editImageIndex}
            setEditImage={setEditImage}
            selectedSetupId={selectedSetupId}
            user={user!}
          />
        )}
      </div>
    </div>
  );
}
