import type { Timestamp } from 'firebase/firestore';

/** DRY ordering for documents that expose a Firestore `createdAt` timestamp. */
export function compareCreatedAtDesc(
  a: { createdAt?: Timestamp },
  b: { createdAt?: Timestamp },
): number {
  const ta = a.createdAt?.seconds ?? 0;
  const tb = b.createdAt?.seconds ?? 0;
  return tb - ta;
}
