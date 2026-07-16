import type { ClassItem } from "./types";

export const initialClasses: ClassItem[] = [
  {
    id: "class-1",
    name: "Introduction to Algorithms",
    code: "CS 201",
    lectures: [
      {
        id: "lec-1",
        title: "Big-O Notation & Complexity",
        startTime: "2026-07-21T09:00",
        endTime: "2026-07-21T10:30",
        materials: [
          {
            id: "mat-1",
            type: "youtube",
            title: "Big-O in 12 minutes",
            value: "https://www.youtube.com/watch?v=v4cd1O4zkGw",
          },
          {
            id: "mat-2",
            type: "pdf",
            title: "Lecture 1 slides",
            value: "",
          },
          {
            id: "mat-3",
            type: "text",
            title: "Pre-class notes",
            value: "Read chapter 1 of CLRS before class. Come with two questions.",
          },
        ],
      },
      {
        id: "lec-2",
        title: "Sorting Algorithms",
        startTime: "2026-07-23T09:00",
        endTime: "2026-07-23T10:30",
        materials: [
          {
            id: "mat-4",
            type: "link",
            title: "Visualizing sorting algorithms",
            value: "https://visualgo.net/en/sorting",
          },
        ],
      },
    ],
  },
  {
    id: "class-2",
    name: "Modern Web Development",
    code: "CS 340",
    lectures: [
      {
        id: "lec-3",
        title: "Component Architecture",
        startTime: "2026-07-22T13:00",
        endTime: "2026-07-22T14:15",
        materials: [
          {
            id: "mat-5",
            type: "text",
            title: "Discussion prompt",
            value: "What makes a component reusable? Bring one example from a site you use daily.",
          },
        ],
      },
    ],
  },
];
