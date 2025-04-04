"use client";

import React from "react";
import roadmapData from "@/data/roadmap.json";
import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function RoadmapPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Birdiemail Roadmap</h1>
        <p className="text-gray-600">
          Our journey to a better email experience. Track our progress as we
          build Birdiemail.
        </p>
      </div>

      <div className="space-y-12">
        {roadmapData.map((goal, index) => {
          const goalParts = goal.title.split(" // ");
          const goalCategory = goalParts.length > 1 ? goalParts[0] : null;
          const goalTitle = goalParts.length > 1 ? goalParts[1] : goal.title;

          const totalRequirements = goal.requirements.length;
          const completedRequirements = goal.requirements.filter(
            (req) => req.done
          ).length;
          const completionPercentage = Math.round(
            (completedRequirements / totalRequirements) * 100
          );

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {goalCategory && (
                    <span className="mr-2 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                      {goalCategory}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold">{goalTitle}</h2>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {completionPercentage}% Complete
                </div>
              </div>

              <p className="text-gray-600 mb-6">{goal.description}</p>

              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                <motion.div
                  className="bg-blue-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goal.requirements.map((req, reqIndex) => {
                  const reqParts = req.name.split(" // ");
                  const reqCategory = reqParts[0];
                  const reqName = reqParts[1];

                  return (
                    <div key={reqIndex} className="flex items-center">
                      <div
                        className={`w-5 h-5 flex-shrink-0 rounded-full mr-3 flex items-center justify-center ${
                          req.done ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        {req.done && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-medium ${
                            req.done ? "text-green-600" : "text-blue-600"
                          }`}
                        >
                          {reqCategory}
                        </span>
                        <span
                          className={
                            req.done ? "text-gray-500" : "text-gray-800"
                          }
                        >
                          {reqName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center text-gray-500 text-sm">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-2">
          Our roadmap is a living document and may change as we receive feedback
          and encounter challenges.
        </p>
      </div>
    </div>
  );
}
