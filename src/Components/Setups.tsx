import { useState, useEffect } from "react";
import { db } from "../firebase";
import { User } from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

const Setups = ({
  selectedSetupId,
  setSelectedSetupId,
  user,
}: {
  selectedSetupId: string;
  setSelectedSetupId: React.Dispatch<React.SetStateAction<string>>;
  user: User;
}) => {
  const [setupDocs, setSetupDocs] = useState<{ id: string; name: string }[]>(
    []
  );
  const [newSetupName, setNewSetupName] = useState<string>("");

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

  return (
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
  );
};

export default Setups;