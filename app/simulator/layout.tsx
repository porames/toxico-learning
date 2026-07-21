import SimulatorShell from "@/components/simulator/SimulatorShell";

export const metadata = {
  title: "Simulator",
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return <SimulatorShell>{children}</SimulatorShell>;
}
