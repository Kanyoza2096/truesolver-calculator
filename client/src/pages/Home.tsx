import Calculator from "@/components/Calculator";
import { CalculatorProvider } from "@/context/CalculatorContext";
import { ThemeProvider } from "@/context/ThemeProvider";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background dark:bg-background">
      <ThemeProvider>
        <CalculatorProvider>
          <Calculator />
        </CalculatorProvider>
      </ThemeProvider>
    </div>
  );
}
