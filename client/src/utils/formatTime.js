export const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

export const formatLastSeen = (date) => {
  if (!date) return "Offline";

  const lastSeen = new Date(date);
  const now = new Date();
  const diff = now - lastSeen;

  if (diff < 60 * 1000) {
    return "just now";
  }

  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} min ago`;
  }

  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hr ago`;
  }

  return lastSeen.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};