import { PlusCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";

import { ProjectList } from "./components/project-list";

export default function ProjectsDashboardPage() {
  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects Dashboard</h1>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
      <ProjectList />
    </div>
  );
}
