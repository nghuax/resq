import { savedAddressSchema } from "@/schemas/address";
import { getDb } from "@/server/db/prisma";

export async function listAddressesForUser(userId: string) {
  const db = await getDb();

  return db.savedAddress.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function createAddressForUser(userId: string, rawInput: unknown) {
  const input = savedAddressSchema.parse(rawInput);
  const db = await getDb();

  return db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.savedAddress.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return tx.savedAddress.create({
      data: {
        userId,
        ...input,
      },
    });
  });
}
