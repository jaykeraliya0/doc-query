type DBFile = {
  id: string;
  name: string;
  uploadStatus: string;
  url: string;
  key: string;
  status: " PENDING" | "PROCESSING" | "FAILED" | "SUCCESS";
  createdAt: string;
  updatedAt: string;
  userId: string;
};

type ExtendedMessage = {
  id: string;
  text: string | JSX;
  isUserMessage: boolean;
  createdAt: string;
  updatedAt: string;
};
