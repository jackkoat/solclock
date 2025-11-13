import Image from 'next/image';

interface SolPulseLogoProps {
  className?: string;
  showText?: boolean;
  height?: number;
  width?: number;
}

export default function SolPulseLogo({ 
  className = "", 
  showText = true, 
  height = 40, 
  width = 120 
}: SolPulseLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <Image 
          src="/favicon.jpeg" 
          alt="SolPulse" 
          width={40} 
          height={40}
          className="rounded-full"
        />
      </div>
      {showText && (
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent uppercase tracking-tight">
            SolPulse
          </h1>
        </div>
      )}
    </div>
  );
}