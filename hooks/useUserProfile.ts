"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  photoURL: string | null;
  year: string;
  uid: string;
  docId: string;
}

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      try {
        const q = query(collection(db, "users"), where("authId", "==", currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const userDoc = snap.docs[0];
          const data = userDoc.data();
          setProfile({
            name: data.name ?? currentUser.displayName ?? "User",
            email: data.email ?? currentUser.email ?? "",
            photoURL: currentUser.photoURL,
            role: data.role ?? "student",
            year: data.year ?? "",
            uid: currentUser.uid,
            docId: userDoc.id,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [router]);

  return { user, profile, loading };
}
