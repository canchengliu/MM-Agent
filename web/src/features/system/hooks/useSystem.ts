import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "~/core/api/queryKeys";
import { SystemService } from "~/core/api/services/system.service";

export const useSystemInfo = () => {
  return useQuery({
    queryKey: QueryKeys.systemInfo(),
    queryFn: SystemService.getInfo,
    staleTime: 5 * 60 * 1000,
  });
};
