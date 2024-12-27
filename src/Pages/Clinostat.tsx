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
  onSnapshot,
} from "firebase/firestore";
import { signOut, User } from "firebase/auth";

export default function UploadImages({ user }: { user: User | undefined }) {
  const [imageMetadata, setImageMetadata] = useState<
    { url: string; timestamp: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const [setupDocs, setSetupDocs] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedSetupId, setSelectedSetupId] = useState<string>("");
  const [newSetupName, setNewSetupName] = useState<string>("");

  // Fetch setups on page load
  useEffect(() => {
    const fetchSetups = async () => {
      try {
        const setupsCollection = collection(db, `images/${user?.uid}/setups`);
        const setupsQuery = query(
          setupsCollection,
          orderBy("timestamp", "asc")
        );
        const querySnapshot = await getDocs(setupsQuery);

        const fetchedSetups = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name as string,
        }));
        setSetupDocs(fetchedSetups);
      } catch (error) {
        console.error("Error fetching setups:", error);
      }
    };

    fetchSetups();
  }, [user]);

  // Set up Firestore listener for images in the selected setup
  useEffect(() => {
    if (!selectedSetupId) return; // No setup selected

    const imagesCollection = collection(
      db,
      `images/${user?.uid}/setups/${selectedSetupId}/images`
    );
    const imagesQuery = query(imagesCollection, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      imagesQuery,
      (snapshot) => {
        const fetchedImages = snapshot.docs.map((doc) => doc.data());
        setImageMetadata(fetchedImages as { url: string; timestamp: number }[]);
      },
      (error) => {
        console.error("Error fetching images:", error);
      }
    );

    // Clear images on unmount or when switching setups
    return () => {
      setImageMetadata([]);
      unsubscribe();
    };
  }, [selectedSetupId, user]);

  // Validate uploaded files
  const validateFiles = (files: File[]) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    return files.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE
    );
  };

  // Handle Upload
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

  const handleNewSetup = async () => {
    if (newSetupName === "") {
      alert("Please enter a valid setup name.");
      return;
    }
    try {
      const setupDoc = {
        name: newSetupName,
        timestamp: Date.now(),
      };
      const docRef = await addDoc(
        collection(db, `images/${user?.uid}/setups`),
        setupDoc
      );

      // Add the new setup to the local state
      setSetupDocs((prev) => [...prev, { id: docRef.id, name: newSetupName }]);
      setNewSetupName("");
    } catch (error) {
      console.error("Error creating new setup:", error);
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

        <div className="space-y-6">
          <h2 className="text-2xl pt-6 font-semibold text-center text-blue-300">
            Setups
          </h2>
          <div className="space-y-4">
            {setupDocs.map((setup, index) => (
              <div
                key={index}
                className={`px-4 py-3 rounded-lg cursor-pointer text-center ${
                  selectedSetupId === setup.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-600 hover:bg-gray-700"
                } transition-all`}
                onClick={() => setSelectedSetupId(setup.id)}
              >
                {setup.name}
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Enter new setup name"
            value={newSetupName}
            onChange={(e) => setNewSetupName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-gray-200 rounded-lg border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
          />
          <button
            onClick={handleNewSetup}
            className="w-full py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
          >
            Create New Setup
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8">
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

        {imageMetadata.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {imageMetadata.map((image, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center space-y-4"
              >
                <img
                  src={image.url}
                  alt={`Uploaded ${index}`}
                  className="w-full h-auto rounded-lg"
                />
                <p className="text-sm text-gray-400">
                  {new Date(image.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
