export interface Project {
  id: number;
  title: string;
  description: string;
  type: string;
  tech: string[];
  github: string;
  live: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "WildAlert — Wildlife Reporting Platform",
    description:
      "AI-powered wildlife species identification platform with Google AI integration and analytics.",
    type: "Capstone Project",
    tech: ["PHP", "JavaScript", "Python (Flask)", "MySQL", "Chart.js", "Google AI"],
    github: "#",
    live: "#"
  },
  {
    id: 6,
    title: "Allowance Ally — Financial Management Platform",
    description:
      "Comprehensive allowance and expense tracking system with budget management, savings goals, discipline scoring, and analytics dashboard for students.",
    type: "Capstone Project",
    tech: ["React", "TypeScript", "Node.js", "Express", "MySQL", "Recharts", "JWT", "Tailwind CSS"],
    github: "#",
    live: "#"
  }
];
