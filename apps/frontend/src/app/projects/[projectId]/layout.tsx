import ProjectNavbar from "@/components/ProjectNavbar";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>; // 1. Ahora es una Promesa
}) {

  return (
    <div>

      <ProjectNavbar />

      <main>
        {children}
      </main>
      
    </div>
  );
}