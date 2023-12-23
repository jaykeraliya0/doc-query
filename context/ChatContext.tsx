import { toast } from "@/components/ui/use-toast";
import React, { ReactNode, createContext, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const backupMessage = useRef("");

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    onMutate: async () => {
      setIsLoading(true);
      backupMessage.current = message;

      setMessage("");

      await queryClient.cancelQueries({ queryKey: ["messages"] });

      const previousMessages = queryClient.getQueryData<ExtendedMessage[]>([
        "messages",
      ]);

      queryClient.setQueryData<ExtendedMessage[]>(
        ["messages"],
        (oldMessages) => [
          {
            id: crypto.randomUUID(),
            text: message,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isUserMessage: true,
          },
          ...(oldMessages ?? []),
        ]
      );

      return { previousMessages };
    },
    onSuccess: () => {
      queryClient.invalidateQueries("messages");
      setIsLoading(false);
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
      setMessage(backupMessage.current);
    },
    onSettled: () => {
      queryClient.invalidateQueries("messages");
      setIsLoading(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const addMessage = async () => sendMessage({ message });

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
