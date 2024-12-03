import { useEffect, useState } from "react";
import { getContract } from "../utils/blockchain";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const contract = getContract();
      try {
        const resources = await contract.methods.getResources().call(); // Example method
        setData(resources);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex flex-col items-center gap-8">
      <h1 className="text-xl font-bold">Blockchain Resources</h1>
      <ul className="list-disc">
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </main>
  );
}
