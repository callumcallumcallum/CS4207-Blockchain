"use client";

import { useEffect, useState } from "react";
import { getContract } from "../../utils/blockchain";

export default function Home() {
  const [resourceCount, setResourceCount] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contract = getContract();

        const count = await contract.getResourceCount();
        setResourceCount(count);

        const fetchedResources = [];
        for (let i = 1; i <= count; i++) {
          try {
            const resource = await contract.getResource(i);
            fetchedResources.push({
              id: i,
              name: resource.name,
              url: resource.url,
              uploader: resource.uploader,
            });
          } catch (resourceError) {
            console.error(`Error fetching resource ${i}:`, resourceError);
          }
        }
        setResources(fetchedResources);
      } catch (err) {
        console.error("Error fetching contract data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-6">Academic Resources</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h2 className="text-2xl font-semibold mb-4">
        Total Resources: {resourceCount !== null ? resourceCount : "Loading..."}
      </h2>

      {loading ? (
        <p className="text-gray-400">Loading resources...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-11/12 max-w-7xl">
          {resources.length > 0 ? (
            resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-gray-800 p-4 rounded-lg shadow-md"
              >
                <h3 className="text-xl font-bold">{resource.name}</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Uploaded by: {resource.uploader}
                </p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Visit Resource
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No resources available.</p>
          )}
        </div>
      )}
    </div>
  );
}
