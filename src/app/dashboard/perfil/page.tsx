"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useMonthlyUsage } from "@/hooks/useMonthlyUsage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PerfilPage() {
  const user = useRequireAuth();
  const router = useRouter();
  const { plan } = useUserPlan(user?.uid ?? null);
  const { pdfCount, videoCount } = useMonthlyUsage(user?.uid ?? null, plan);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [study, setStudy] = useState("");
  const [heardFrom, setHeardFrom] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      const snap = await getDoc(
        doc(getFirestore(getFirebaseApp()), "users", user.uid),
      );
      if (snap.exists()) {
        const d = snap.data() as any;
        setName(d.name || "");
        setCountry(d.country || "");
        setLanguage(d.language || "");
        setStudy(d.study || "");
        setHeardFrom(d.heardFrom || "");
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(getFirestore(getFirebaseApp()), "users", user.uid),
        {
          name,
          country,
          language,
          study,
          heardFrom,
          profileCompleted: true,
        },
        { merge: true },
      );
      toast.success("Datos guardados");
      router.replace("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Error al guardar");
    }
  };

  if (!user || loading) return <div className="p-8 text-center">Cargando…</div>;

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>
      <form onSubmit={save} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="language">Idioma</Label>
          <Input
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="study">Estudio</Label>
          <Input
            id="study"
            value={study}
            onChange={(e) => setStudy(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="heard">¿Cómo nos conociste?</Label>
          <Input
            id="heard"
            value={heardFrom}
            onChange={(e) => setHeardFrom(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <Button type="submit" className="w-full">
          Guardar
        </Button>
      </form>
      <div className="pt-6 border-t text-sm space-y-1">
        <p>
          Plan: <b>{plan}</b>
        </p>
        <p>
          PDFs usados este mes: <b>{pdfCount}</b>
        </p>
        <p>
          Videos usados este mes: <b>{videoCount}</b>
        </p>
      </div>
    </div>
  );
}
