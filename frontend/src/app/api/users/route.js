import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// async function parseBody(req) {
//   return new Promise((resolve, reject) => {
//     let body = '';
//     req.on('data', chunk => {
//       body += chunk.toString();
//     });
//     req.on('end', () => {
//       try {
//         resolve(JSON.parse(body));
//       } catch (error) {
//         reject(error);
//       }
//     });
//   });
// }

export async function POST(req, res) {
  const body = await req.json();
  console.log("Request body:", body);

  const { username, password, isTeacher, email } = body;

  if (!username || !password || isTeacher === undefined || !email) {
    console.error("Validation failed:", body);
    return Response.json({ error: "Missing required fields" });
  }


  const newUser = await prisma.user.create({
    data: {
      name: username,
      password,
      isTeacher,
      email,
    },
  });
  return Response.json(newUser);

}

export async function GET (req, res) {
  try {
    const users = await prisma.user.findMany();
    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' });
  }
}

export async function PUT (req, res) {
  // let body;
  // try {
  //   body = await parseBody(req);
  // } catch (error) {
  //   return Response.json({ error: 'Invalid JSON' });
  // }
  const body = await req.json();
  console.log("Request body:", body);

  const { id = id, name: updateUsername, password: updatePassword, isTeacher: updateIsTeacher, email: updateEmail } = body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: updateUsername,
        password: updatePassword,
        isTeacher: updateIsTeacher,
        email: updateEmail,
      },
    });
    return Response.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'User not found' });
  }
}

export async function DELETE(req, res) {
  const id = req.nextUrl.searchParams.get("id");
  console.log("Request id:", id);
  console.log("id type:", typeof id);
  try {
    await prisma.user.delete({
      where: { id: parseInt(id, 10) },
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'User not found' });
  }
}

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     await createUser(req, res);
//   } else if (req.method === 'GET') {
//     await getUsers(req, res);
//   } else if (req.method === 'PUT') {
//     await updateUser(req, res);
//   } else if (req.method === 'DELETE') {
//     await deleteUser(req, res);
//   } else {
//     res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }