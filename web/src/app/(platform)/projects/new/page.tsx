import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { CreateProjectForm } from "./components/create-project-form";

export default function NewProjectPage() {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-background p-6">
      <div className="w-full max-w-2xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Project</CardTitle>
            <CardDescription>
              Provide the key details to kick off a new modeling task.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateProjectForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
