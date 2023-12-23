"use client";
import UploadButton from "./UploadButton";
import { File, Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState } from "react";
import { getUserSubscription } from "@/lib/stripe";
import { useMutation, useQuery, useQueryClient } from "react-query";

interface Props {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscription>>;
}

export default function Dashboard({ subscriptionPlan }: Props) {
  const [currentlyDeleting, setCurrentlyDeleting] = useState<string | null>(
    null
  );

  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery("files", async () => {
    const res = await fetch("/api/user-files");
    return (await res.json()) as DBFile[];
  });

  const { mutate: deleteFile, error } = useMutation(
    async ({ id }: { id: string }) => {
      const res = await fetch("/api/user-files", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      return (await res.json()) as DBFile[];
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("files");
      },
      onMutate: ({ id }) => {
        setCurrentlyDeleting(id);
      },
      onSettled: () => {
        setCurrentlyDeleting(null);
      },
    }
  );

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>
        <UploadButton isSubscribed={subscriptionPlan.isSubscribed as boolean} />
      </div>

      {files && files.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    mocked
                  </div>

                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size="sm"
                    className="w-full"
                    variant="destructive"
                  >
                    {currentlyDeleting === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {new Array(3).fill(null).map((_, i) => (
            <div
              key={i}
              role="status"
              className="flex items-center justify-center h-36 max-w-sm bg-gray-300 rounded-lg animate-pulse"
            >
              <File className="h-8 w-8 text-zinc-600" />
              <span className="sr-only">Loading...</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">Pretty empty around here...</h3>
          <p>Let&apos;s upload your first PDF</p>
        </div>
      )}
    </main>
  );
}
