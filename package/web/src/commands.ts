import { toast } from "react-toastify";
import { getDebugInfo, stringifyDebugInfo } from "./utils/debug/debug_info";

const SlashCommandDebugInfo = {
  name: "debinfo",
  description: "Get debug information",
  exec: async () => {
    navigator.clipboard.writeText(stringifyDebugInfo(await getDebugInfo()));

    toast.success("Debug information copied to clipboard");
  },
};

export const SlashCommands = [SlashCommandDebugInfo];
