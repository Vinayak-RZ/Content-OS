import { prisma } from "@/lib/db";
import type { UserRankingWeights } from "@/lib/improvement/types";

export {
  DEFAULT_SIGNALS_WEIGHTS,
  DEFAULT_STUDIO_WEIGHTS,
  getRankingWeights,
  normalizeWeights,
} from "@/lib/improvement/weights";

export async function getUserRankingWeights(
  userId: string,
): Promise<UserRankingWeights | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { rankingWeights: true },
  });
  if (!user?.rankingWeights || typeof user.rankingWeights !== "object") {
    return null;
  }
  return user.rankingWeights as UserRankingWeights;
}

export async function applyRankingWeights(
  userId: string,
  weights: UserRankingWeights,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { rankingWeights: weights },
  });
}
