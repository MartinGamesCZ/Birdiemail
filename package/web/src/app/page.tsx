"use client";

import { trpc } from "../server/trpc";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    (async () => {
      const data = await trpc.appRouter.hello.query();

      console.log(data);
    })();
  }, []);

  return <p>Hello, World!</p>;
}
