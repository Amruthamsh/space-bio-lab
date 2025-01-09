import { useState, useEffect } from "react";
import { db } from "../firebase";

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { User } from "firebase/auth";
import { handleSignOut } from "../HelperFunctions/AuthHelperFunctions";

import Setups from "../Components/Setups";
import EditImage from "../Components/EditImage";
import UploadImages from "../Components/UploadImages";

export default function Clinostat({ user }: { user: User | undefined }) {
  const [imageMetadata, setImageMetadata] = useState<
    { id: string; url: string; timestamp: number }[]
  >([]);

  const [selectedSetupId, setSelectedSetupId] = useState<string>("");
  const [editImageIndex, setEditImageIndex] = useState<number>(0);
  const [editImage, setEditImage] = useState<boolean>(false);

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

        {imageMetadata.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {imageMetadata.map((image, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center space-y-4"
              >
                <div className="relative w-full max-w-md aspect-[4/4] overflow-hidden bg-gray-800 rounded-lg">
                  <img
                    src={image.url}
                    alt={`Uploaded`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="text-sm text-gray-400">
                  Timestamp: {new Date(image.timestamp).toLocaleString()}
                </p>
                <button
                  onClick={() => {
                    setEditImage(true);
                    setEditImageIndex(index);
                  }}
                >
                  Edit
                </button>
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
