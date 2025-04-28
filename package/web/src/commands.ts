import { toast } from "react-toastify";
import { getDebugInfo, stringifyDebugInfo } from "./utils/debug/debug_info";

// Slash command to get debug information
// Command: /debinfo
const SlashCommandDebugInfo = {
  name: "debinfo",
  description: "Get debug information",
  exec: async () => {
    // Copy stringified debug information to clipboard
    navigator.clipboard.writeText(stringifyDebugInfo(await getDebugInfo()));

    // Show success message
    toast.success("Debug information copied to clipboard");
  },
};

// Slash command definition
export const SlashCommands = [SlashCommandDebugInfo];
