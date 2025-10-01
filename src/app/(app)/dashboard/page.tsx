import { HomeClient } from "@/components/home/home-client";
import { PageHeader } from "@/components/page-header";

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Home"
        description="Busca un cliente o crea una nueva sesión."
      />
      <HomeClient />
    </>
  );
}
