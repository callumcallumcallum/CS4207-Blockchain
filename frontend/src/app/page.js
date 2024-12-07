"use client";

import { useEffect, useState } from "react";
import { getContract } from "../../utils/blockchain";

export default function Home() {
  const [resourceCount, setResourceCount] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contract = getContract();

        const count = await contract.getResourceCount();
        setResourceCount(count.toNumber());

        const fetchedResources = [];
        for (let i = 1; i <= count; i++) {
          try {
            const resource = await contract.getResource(i);
            fetchedResources.push({
              id: i,
              name: resource[0],
              url: resource[1],
              uploader: resource[2],
            });
          } catch (resourceError) {
            console.error(`Error fetching resource ${i}:`, resourceError);
          }
        }
        setResources(fetchedResources);
      } catch (err) {
        console.error("Error fetching contract data:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Academic Resources</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>
        Total Resources: {resourceCount !== null ? resourceCount : "Loading..."}
      </h2>

      <ul>
        {resources.map((resource) => (
          <li key={resource.id}>
            <strong>{resource.name}</strong> -{" "}
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              {resource.url}
            </a>{" "}
            (Uploaded by: {resource.uploader})
          </li>
        ))}
      </ul>
    </div>
  );
}
