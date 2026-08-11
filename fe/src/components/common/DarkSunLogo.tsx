interface DarkSunLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export const DarkSunLogo = ({
  size = 64,
  animated = true,
  className = '',
}: DarkSunLogoProps) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div
        className={`relative rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-600 to-purple-600 ${
          animated ? 'animate-corona-pulse' : ''
        }`}
        style={{ width: size, height: size }}
      >
        <img
          src="/dark-sun-logo.jpg"
          alt="Solaris Dark Sun Logo"
          className="w-full h-full object-cover rounded-full border border-amber-500/30 shadow-inner"
        />
      </div>
    </div>
  );
};
