import { useQuery } from "@tanstack/react-query";

export function useFileQuery(url?: string | null) {
  const query = useQuery({
    queryKey: ["file", url],
    queryFn: () => fetch(url!).then((res) => res.blob()),
    enabled: !!url,
  });

  return query;
}
