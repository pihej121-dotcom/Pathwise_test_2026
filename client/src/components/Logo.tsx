import logoImage from "@assets/Pathwise_Logo_BlackP_copy_1781385203200.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={logoImage}
        alt="Pathwise Logo"
        className={`${sizeClasses[size]} object-contain rounded-xl`}
        data-testid="pathwise-logo"
      />
    </div>
  );
}
