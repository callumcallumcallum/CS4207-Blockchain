import { getContract } from "../../../utils/blockchain";

export async function GET(req) {
  const contract = getContract();
  try {
    const resources = await contract.methods.getResources().call();
    return new Response(JSON.stringify(resources), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
