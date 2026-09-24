import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Foto-Upload per Server Action: Vercel nimmt höchstens 4,5 MB pro Anfrage an, der
      // Browser verkleinert Fotos vorher auf höchstens 4 MB (siehe src/lib/supabase/foto.ts).
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
