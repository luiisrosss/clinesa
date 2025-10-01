import { HomeClient } from "@/components/home/home-client";
import { PageHeader } from "@/components/page-header";

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Home"
        description="Bienvenido a Clinesa. Gestiona tus clientes y sesiones desde aquí."
      />
      <HomeClient />
    </>
  );
}
