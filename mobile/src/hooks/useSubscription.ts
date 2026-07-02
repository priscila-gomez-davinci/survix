import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/src/services/firebase";
import { useAuth } from "@/src/context/AuthContext";
import type { PlanId } from "@/src/data/plansData";

export type PaidPlanId = Exclude<PlanId, "free">;

export type SubscriptionRecord = {
  plan: PaidPlanId;
  activa: boolean;
  fin: Timestamp | null;
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


export function useSubscription() {
  const { user } = useAuth();
  const [record, setRecord] = useState<SubscriptionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(db, "pruebas_premium", String(user.id_usuario));
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) setRecord(snap.data() as SubscriptionRecord);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const activate = useCallback(
    async (planId: PaidPlanId) => {
      if (!user) throw new Error("useSubscription.activate called without a logged in user");
      const ref = doc(db, "pruebas_premium", String(user.id_usuario));
      // (it's a direct "contratar"), so it's active with no end date.
      const fin = planId === "premium" ? Timestamp.fromDate(addDays(new Date(), 30)) : null;
      await setDoc(ref, {
        id_usuario: user.id_usuario,
        email: user.email,
        plan: planId,
        inicio: serverTimestamp(),
        fin,
        activa: true,
      });
      setRecord({ plan: planId, activa: true, fin });
    },
    [user],
  );

  const cancel = useCallback(async () => {
    if (!user) return;
    const ref = doc(db, "pruebas_premium", String(user.id_usuario));
    await updateDoc(ref, { activa: false });
    setRecord((prev) => (prev ? { ...prev, activa: false } : prev));
  }, [user]);

  return { record, loading, activate, cancel };
}
