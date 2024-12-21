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
    <div className="w-screen">
      <button onClick={handleSignOut} className="p-2 bg-red-500 text-white">
        Sign Out
      </button>
      <h1>Hi {user?.email}</h1>
      <h1 className="text-4xl text-center">Setups</h1>
      <div className="flex flex-col items-center">
        <input
          type="text"
          placeholder="New setup name"
          value={newSetupName}
          onChange={(e) => setNewSetupName(e.target.value)}
          className="mb-4"
        />
        <button
          onClick={handleNewSetup}
          className="border-2 p-2 bg-blue-500 text-white"
        >
          Create New Setup
        </button>

        {setupDocs.map((setup, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${
              selectedSetupId === setup.id ? "bg-blue-200" : ""
            }`}
          >
            <button onClick={() => setSelectedSetupId(setup.id)}>
              {setup.name}
            </button>
          </div>
        ))}
      </div>

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
          disabled={isUploading || selectedSetupId === null}
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
