import {
  collection, addDoc, getDocs, query, orderBy, limit, where, serverTimestamp,
} from 'firebase/firestore'

export interface ActivityLogEntry {
  id: string
  action: string
  entity: string
  entityId: string
  details: string
  userId: string
  userName: string
  createdAt: any
}

export function useActivityLog() {
  const { $firebaseDb } = useNuxtApp()
  const authStore = useAuthStore()

  async function log(action: string, entity: string, entityId: string, details: string): Promise<void> {
    const user = authStore.user
    if (!user) return

    try {
      await addDoc(collection($firebaseDb, 'activityLogs'), {
        action,
        entity,
        entityId,
        details,
        userId: user.id,
        userName: user.name,
        createdAt: serverTimestamp(),
      })
    }
    catch (e) {
      console.error('[activityLog] Failed to write:', e)
    }
  }

  async function fetchLogs(maxResults = 50): Promise<ActivityLogEntry[]> {
    const q = query(
      collection($firebaseDb, 'activityLogs'),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ActivityLogEntry[]
  }

  async function fetchLogsByEntity(entity: string, entityId: string): Promise<ActivityLogEntry[]> {
    const q = query(
      collection($firebaseDb, 'activityLogs'),
      where('entity', '==', entity),
      where('entityId', '==', entityId),
      orderBy('createdAt', 'desc'),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ActivityLogEntry[]
  }

  return { log, fetchLogs, fetchLogsByEntity }
}
